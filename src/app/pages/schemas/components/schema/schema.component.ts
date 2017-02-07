import { Component, ViewEncapsulation, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalDirective } from 'ng2-bootstrap';
import { AlertModule } from 'ng2-bootstrap';

import {GlobalState} from '../../../../global.state';

 import {
   BaThemePreloader,
   BaThemeSpinner
 } from '../../../../theme/services';

import {
  SchemaService,
  SchemaMetaInfo,
  SchemaInfo,
  TimestampFieldInfo
} from '../../../../services/schema.service'

import { AddFieldComponent } from '../add-field/add-field.component';
import { FieldSubComponent } from '../field/field.component';
import { StringifyPipe } from '../util/stringify.pipe';

@Component({
  selector: 'schema-component',
  // encapsulation: ViewEncapsulation.None,
  template: require('./schema.html'),
  styles: [require('./schema.scss')]
})
export class SchemaComponent {

  public loading:boolean = true;
  public deleting:boolean = false;

  public form:FormGroup;
  private name:AbstractControl;
  private aliases:AbstractControl;
  private ts_aliases:AbstractControl;
  private ts_formats:AbstractControl;
  private fields:FormArray;
  private added_fields_control:FormArray;
  private removedFields:AbstractControl[] = [];

  private id:string;
  private schema_info:SchemaInfo;
  private timestamp:TimestampFieldInfo;

  @ViewChild('childModal') childModal: ModalDirective;
  // private childModal:AddFieldModalComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: SchemaService,
              private fb:FormBuilder,
              private state:GlobalState){
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      this.id = path_info["id"];
      this.loadSchema();
    });
  }

  private loadSchema(){
    // register the "schema loading" work
    this.loading = true;
    let self = this;
    BaThemePreloader.registerLoader(
        // add a loading spinner 
        this.service.getSchema(this.id)
          .then(info => {
            self.initWithInfo(info);
          })
          .catch(error => alert(JSON.stringify(error))));

    // hide spinner once schema loading has completed
    BaThemePreloader.load().then((values) => {
      console.log("Done loading schema!")
      self.loading = false;
    });
  }

  private initWithInfo(info:SchemaInfo){
    this.schema_info = info;
    console.log("Initializing schema info for: "+JSON.stringify(info));
    this.timestamp = <TimestampFieldInfo> this.schema_info["fields"].filter(elem => elem.name == "timestamp")[0];
    if(!this.timestamp){ alert("Internal server error - missing timestamp field. Please notify help@fineo.io"); }

    // build the form information based on the retrieved schema properties
    var group = {
      'name': [this.schema_info.name, Validators.compose([Validators.required, Validators.minLength(4)])],
      'aliases': [this.schema_info.aliases, []],
      'ts_aliases': [this.timestamp.aliases, []],
      'ts_formats': [this.timestamp.formats, []],
      'fields': this.fb.array([]),
      'added_fields': this.fb.array([])
    }

    this.form = this.fb.group(group);
    this.name = this.form.controls['name'];
    this.aliases = this.form.controls['aliases'];
    this.ts_aliases = this.form.controls['ts_aliases'];
    this.ts_formats = this.form.controls['ts_formats'];

    this.initFields();
    this.fields = <FormArray>this.form.controls['fields'];
    this.added_fields_control = <FormArray>this.form.controls['added_fields'];
  }

  private initFields(){
    const arrayControl = <FormArray>this.form.controls['fields'];
    this.schema_info['fields'].forEach(field => {
      this.addFieldToControl(field, arrayControl);
    });
  }

  private addNewField(){
    const arrayControl = <FormArray>this.form.controls['added_fields'];
    this.addFieldToControl({}, arrayControl);
  }

  private addFieldToControl(field, arrayControl:FormArray){
    let newGroup = this.newFieldGroup(field);
    arrayControl.push(newGroup);
  }

  private newFieldGroup(field:Field){
    return this.fb.group({
      name: [field.name, [Validators.required]],
      originalName:[field.name, [Validators.required]],
      aliases: [field.aliases, []],
      type: [field.type, [Validators.required]]
    });
  }

  public checkTimestamp(control:FormGroup){
    var value = control.controls['name'].value
    return value == "timestamp"
  }

  public onSubmit(form):void{
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
    // this.name = this.form.controls['name'];
    // this.aliases = this.form.controls['aliases'];
    // this.ts_formats = this.form.controls['ts_formats'];
    var promise = null;
    if(this.name.dirty || this.aliases.dirty || this.ts_formats.dirty){
      promise = this.service.setSchemaMetadata(this.schema_info.name, this.name.value, this.aliases.value, this.ts_formats.value)
        // update the schema name that we display
        .then(result => this.schema_info.name = this.name.value)
        // and notify that we changed state
        .then(result =>  this.updateStateChange("updateName"));
    }
    // this.ts_aliases = this.form.controls['ts_aliases'];
    if(this.ts_aliases.dirty){
      if(promise == null){
        promise = this.service.setTimestampAliases(this.schema_info.name, this.ts_aliases.value);
      } else {
        promise.then(result =>{ return this.service.setTimestampAliases(this.schema_info.name, this.ts_aliases.value);});
      }
    }
    // fields/added fields are a little more complex b/c we need to handle them in sequence - concurrent modifications are challenging for the system

    // field updates
    // this.fields = this.form.controls['fields'];
    var fields = [];
    this.fields.controls.forEach((control:FormGroup) =>{
      let controls = control.controls;
      let nameControl = controls['name'];
      let aliasControl = controls['aliases'];
      if(nameControl.dirty || aliasControl.dirty){
        fields.push(() =>{ return this.service.updateField(this.schema_info.name, controls['originalName'].value, nameControl.value, aliasControl.value);})
      }
    });
    if(fields.length > 0){
      if(promise == null){
        promise = this.pseries(fields);
      } else {
        promise = promise.then(result => { return this.pseries(fields); });
      }
    }

    // new fields
    // this.added_fields_control = this.form.controls['added_fields'];
    let added_fields = []
    this.added_fields_control.controls.forEach((control:FormGroup) =>{
      let controls = control.controls;
      let nameControl = controls['name'];
      let aliasControl = controls['aliases'];
      let typeControl = controls['type'];
      added_fields.push(() =>{ return this.service.addField(this.schema_info.name, nameControl.value, typeControl.value, aliasControl.value);});
    });

    if(added_fields.length > 0){
      if(promise == null){
        promise = this.pseries(added_fields);
      } else {
        promise = promise.then(result => { return this.pseries(added_fields); });
      }
    }
  }

  /**
   * Exexcute a series of "promise-factories" in series. Note: calling Promise.then() executes it immediately.
  */
  private pseries(list):Promise<any> {  
    var p = Promise.resolve();
    return list.reduce(function(pacc, fn) {
      return pacc = pacc.then(fn);
    }, p);
  }

  private updateStateChange(type:string){
    this.state.notifyDataChanged(SchemaService.SCHEMA_CHANGE_STATE, type+" - "+this.id+": ("+this.schema_info.name+")");
  }

  public delete_schema(){
     // delete the schema
     console.log("Deleteing schema!");
     this.deleting = true;
     this.service.delete_schema(this.id).then(response =>{
       // first update the menu that we deleted a schema and it should reload
       this.updateStateChange("delete");

       // return home
       this.deleting = false;
       this.returnHome();
   }).catch(err =>{
     console.log("Failed to delete schema \n", JSON.stringify(err));
      alert("Failed to delete schema. Please send console output to help@fineo.io");
   });
     
  }

  private returnHome():void{
    var target = '/pages/dashboard'
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  private randomString(len:number):string{
    var text = " ";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ ){
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return text;
  }

  private stringify(obj){
    var seen = [];

    return JSON.stringify(obj, function(key, val) {
       if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    });
  }

  public deleteAddedField(item){
    console.log("remove field: ", this.stringify(item));
    this.added_fields_control.removeAt(item);
  }
}

export class Field{
  error:string = null;
  name:string;
  aliases:string[];
  type:string = null;
  constructor(public id:string){}

  public validate():boolean{
    this.error = null;
    if(this.name == null || this.name == ""){
      this.error = "Must specify a name for the field!";
      return false;
    }
   
   this.validType(this.type);
    return this.error == null;
  }

  private validType(t:string):boolean {
    if (t === undefined || t == null || t.length == 0) {
      this.error = "Must specify a type!"
      return false;
    }
    var type = t;
    console.log("Got type: ", type);
    switch(type.toLowerCase()){
      case "varchar":
      case "integer":
      case "long":
      case "double":
      case "float":
      case "binary":
      case "boolean":
        return true;
      default:
        this.error = "Not a valid type! Valid types are: Varchar, Integer, Long, Double, Float, Binary & Boolean";
    }
    return false;
  }
}