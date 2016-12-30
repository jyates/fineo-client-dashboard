import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import { SchemaService, SchemaMetaInfo, TimestampFieldInfo } from '../../../../schema.service'

@Component({
  selector: 'add-schema-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./add.html'),
  styles: []//require('./add.scss')
})
export class AddSchemaComponent {

  public form:FormGroup;
  private name:AbstractControl;
  private aliases:AbstractControl;
  private ts_aliases:AbstractControl;
  private ts_formats:AbstractControl;
  private fields:FormArray;

  constructor(private router: Router,
              private service: SchemaService,
              private fb:FormBuilder){
    var group = {
        'name': ['', Validators.compose([Validators.required])],
        'aliases': ['', []],
        'ts_aliases': ['', []],
        'ts_formats': ['', []],
        'fields': this.fb.array([])
    } 

    this.form = this.fb.group(group);
    this.name = this.form.controls['name']
    this.aliases = this.form.controls['aliases']
    this.ts_aliases = this.form.controls['ts_aliases']
    this.ts_formats = this.form.controls['ts_formats']
    this.fields = <FormArray>this.form.controls['fields']
  }

  public addField(){
    this.fields.push(
      this.fb.group({
        name: ['', Validators.compose([Validators.required])],
        type: ['', Validators.compose([Validators.required])],
        aliases: ['', []]
    }));
  }

  public onSubmit(form, valid):void{
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
    var name = this.name.value;
    // TODO: submit the schema creation to the server
    var id = this.service.createSchema(name, this.aliases.value);

    // add timestamp aliases, if any
    var arr = <string[]>this.checkArraySet(this.ts_aliases.value)
    if(arr != null){
      this.service.setTimestampAliases(name, this.ts_aliases.value);  
    }

    // add timestamp patterns
    var arr = <string[]>this.checkArraySet(this.ts_formats.value);
    if(arr != null){ 
      this.service.setMetricTimestampPatterns(name, arr);
    }
    
    // add any fields
    if(this.fields.length > 0){
      for (var i = 0; i < this.fields.length; i++) {
        var field = <FormGroup>this.fields.at(i)
        this.service.addField(name, field.controls['name'].value, field.controls['type'].value, field.controls['aliases'].value);
      }
    }

    // DONE! Now, go to the schema page for the created schema
    var target = '/pages/schemas/inst/'+id;
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  private checkArraySet(val:string):string[]{
    if(val != undefined && val != null){
      return val.split(",");
    } 
    return null;
  }
}