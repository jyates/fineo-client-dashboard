import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SchemaService, SchemaMetaInfo, TimestampFieldInfo } from '../../../../schema.service'

@Component({
  selector: 'add-schema-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./add.html'),
  styles: [require('./add.scss')]
})
export class AddSchemaComponent {

  public form:FormGroup;
  private name:AbstractControl;
  private aliases:AbstractControl;
  private ts_aliases:AbstractControl;
  private ts_formats:AbstractControl;
  private fields:FormArray;

  constructor(private route: ActivatedRoute,
              private router: Router,
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
        name: ['', []],
        aliases: ['', []],
        type: ['', []]
    }));
  }
}