import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import {
  SchemaService,
  SchemaMetaInfo,
  TimestampFieldInfo
} from '../../../../services/schema.service'
import {GlobalState} from '../../../../global.state';

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
  private submitted:boolean = false;

  constructor(private router: Router,
              private service: SchemaService,
              private fb:FormBuilder,
              private state:GlobalState){
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

  public deleteField(index:number):void {
    this.fields.removeAt(index);
  }

  public onSubmit(form, valid):void{
    if(this.submitted){
      console.log("Waiting for server response...");
      return;
    }

    this.submitted = true;
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
    var name = this.name.value;
    
    let self = this;
    this.service.createSchema(name, this.aliases.value)
    // start with adding the fields - those are the most annoying to get back
    .then(id =>{
        // add any fields
        let fieldPromises = []
        self.fields.controls.forEach(f =>{
          let field = <FormGroup>f;
          let fname = field.controls['name'].value;
          let ftype =  field.controls['type'].value;
          let faliases = field.controls['aliases'].value;
          console.log("Adding field: ",fname,",", ftype+",", faliases);
          fieldPromises.push(self.service.addField(name, fname, ftype, faliases));
        })
        if(fieldPromises.length > 0){
          console.log("Adding some fields...");
          return Promise.all(fieldPromises).then(result =>{ console.log("resolving with id: ", id); return Promise.resolve(id)});
        } else {
          console.log("resolving with id: ", id); 
          return Promise.resolve(id);
        }
    })
     // add timestamp aliases, if any
    .then(id =>{
      console.log("Starting with id: ", id);
      console.log("trying timestamp aliases:", self.ts_aliases.value)
      var arr = <string[]>self.checkArraySet(self.ts_aliases.value)
      if(arr != null){
        console.log("Adding timestamp aliases:", arr);
        return self.service.setTimestampAliases(name, self.ts_aliases.value).then(result =>{ console.log("resolving with id: ", id); return Promise.resolve(id)});  
      } else {
        console.log("resolving with id: ", id); 
        return Promise.resolve(id)
      }
    }).then(id =>{
       // add timestamp patterns
       console.log("trying timestamp patterns:", self.ts_formats.value)
      var tsArr = <string[]>self.checkArraySet(self.ts_formats.value);
      var aliases = <string[]>self.checkArraySet(self.aliases.value);

      if(tsArr != null || aliases != null){ 
        console.log("Adding timestamp patterns: ", tsArr, " and aliases: ", aliases);
        return self.service.setMetricAliasesAndTimestampPatterns(name, aliases, tsArr).then(result =>{ console.log("resolving with id: ", id); return Promise.resolve(id)});
      } else {
        console.log("resolving with id: ", id); 
        return Promise.resolve(id);
      }
    }).then(id =>{
      console.log("resolving with id: ", id); 
      // notify the menu builder that we created a new schema
      self.state.notifyDataChanged(SchemaService.SCHEMA_CHANGE_STATE, "add - "+id+": ("+name+")");
      return Promise.resolve(id);
    }).then(id =>{
      console.log("DONE with id: ", id); 
       // DONE! Now, go to the schema page for the created schema
      var target = '/pages/schemas/inst/'+id;
      console.log("redirecting to: "+target);
      this.router.navigate([target]);
      this.submitted = false;
    }).catch(err =>{
      // still notify a state change for failure - we might have got partially through it, in which case the client can manage on their own
      this.state.notifyDataChanged(SchemaService.SCHEMA_CHANGE_STATE, "add - unknown: "+name);

      console.log(JSON.stringify(err));
      if( err.error.data.type != undefined){
        switch(err.error.data.type){
          case "Bad Request":
            alert("Some parts of the schema did not update because of bad data:\n"+err.error.data.message);
            break;
          default:
            alert("Failed to completely save schema! Please send the console output to help@fineo.io");
        }
      }
      
      // go back to the dashboard
      this.router.navigate(["/pages/devices/view"])
    })
  }

  private checkArraySet(val:string):string[]{
    if(val != undefined && val != null){
      let arr = val.split(",");
      return arr;
    } 
    return null;
  }
}