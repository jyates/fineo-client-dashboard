import { Component, ViewEncapsulation, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalDirective } from 'ng2-bootstrap';
import { AlertModule } from 'ng2-bootstrap';

import { 
  SchemaService, 
  SchemaMetaInfo,
  SchemaInfo,
  TimestampFieldInfo
} from '../../../../services/schema.service'

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
  private fields:AbstractControl;
  private added_fields_control:AbstractControl;

  private id:string;
  private schema_info:SchemaInfo;
  // private schema_properties:SchemaInfo;
  private added_fields:Field[] = [];
  public addField:Field;
  private timestamp:TimestampFieldInfo;

  @ViewChild('childModal') childModal: ModalDirective;
  // private childModal:AddFieldModalComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: SchemaService,
              private fb:FormBuilder){
  }

  ngOnInit() {
    let self = this;
    this.route.params.subscribe(path_info => {
      this.id = path_info["id"];
      this.service.getSchema(this.id)
        .then(info => {
          self.initWithInfo(info);
          self.loading = false;
        })
        .catch(error => alert(JSON.stringify(error)));
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
    this.fields = this.form.controls['fields'];
    this.added_fields_control = this.form.controls['added_fields'];
  }

  private initFields(){
    const arrayControl = <FormArray>this.form.controls['fields'];
    this.schema_info['fields'].forEach(field => {
      this.addFieldToControl(field, arrayControl);
    });
  }

  private addNewField(field:Field){
    const arrayControl = <FormArray>this.form.controls['added_fields'];
    this.addFieldToControl(field, arrayControl);
  }

  private addFieldToControl(field, arrayControl:FormArray){
    let newGroup = this.newFieldGroup(field);
    arrayControl.push(newGroup);
  }

  private newFieldGroup(field:Field){
    return this.fb.group({
      name: [field.name, []],
      aliases: [field.aliases, []],
      type: [field.type, []]
    });
  }

  public checkTimestamp(control:FormGroup){
    var value = control.controls['name'].value
    return value == "timestamp"
  }

  public onSubmit(form):void{
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
  }

  public delete_schema(){
     // delete the schema
     console.log("Deleteing schema!");
     this.deleting = true;
     this.service.delete_schema(this.id);
     this.deleting = false;
     this.returnHome();
  }

  private returnHome():void{
    var target = '/'
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  public showFieldCreateModal(): void {
    console.log("showing modal")
    this.addField = new Field(this.randomString(5));
    this.childModal.show();
    // this.childModal.show(this.addField);
  }

  public hideFieldCreateModal(save:boolean): void {
    console.log("Current field state: "+JSON.stringify(this.addField));
    // not saving, so just close
    if(!save){
      this.childModal.hide();
    }
    else if(this.addField.validate()){
      this.addNewField(this.addField)
      this.childModal.hide();
      // clear the old state
      this.addField = null;
    }
    // this.childModal.hide(save);
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
}

export class Field{
  error:string = null;
  name:string;
  aliases:string[];
  type:string[] = [];
  constructor(private id:string){}

  public validate():boolean{
    this.error = null;
    if(this.name == null || this.name == ""){
      this.error = "Must specify a name for the field!";
      return false;
    }
   
   this.validType(this.type);
    return this.error == null;
  }

  private validType(t:string[]):boolean {
    if (t === undefined || t == null || t.length == 0) {
      this.error = "Must specify a type!"
      return false;
    }
    var type = t[0];

    type = type.toLowerCase()
    switch(type){
      case "varchar":
      case "integer":
      case "long":
      case "double":
      case "float":
      case "binary":
      case "boolean":
        return true;
      default:
        this.error = "Not a valid type! Valid types are: varchar, integer, long, double, float, binary & boolean";
    }
    return false;
  }
}