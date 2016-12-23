import { Component, ViewEncapsulation, ViewChild, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';

import { SchemaService, SchemaMetaInfo, TimestampFieldInfo } from '../../../../schema.service'

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

// import { AddFieldModalComponent, Field } from '../add-field-modal/add_field_modal.component'

@Component({
  selector: 'add-field-modal',
  template: require('./add_field_modal.html'),
  styles: [require('./add_field_modal.scss')]
})
export class AddFieldModalComponent {
  @Input() addField: Field;
  @ViewChild('childModal') childModal: ModalDirective;

  public show(field:Field): void {
    console.log("showing modal")
    this.childModal.show();
  }

  public hide(save:boolean): void {
    console.log("hiding modal: "+save)
    this.childModal.hide();
  }

  private randomString(len:number):string{
    var text = " ";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ ){
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return text;
  }
}

@Component({
  selector: 'schema-component',
  // encapsulation: ViewEncapsulation.None,
  template: require('./schema.html'),
  styles: [require('./schema.scss')]
})
export class SchemaComponent {

  private schema_info:Object;
  private schema_properties:SchemaMetaInfo;
  private added_fields:Field[] = [];
  public addField:Field;
  private timestamp:TimestampFieldInfo;
  @ViewChild('childModal') childModal: ModalDirective;
  // private childModal:AddFieldModalComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: SchemaService){
    // this.childModal = new AddFieldModalComponent();
    // this.addField = new Field(this.randomString(5));
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      var id = path_info["id"];
      this.schema_info = this.service.getSchema(id);
      this.schema_properties = this.service.getSchemaProperties(id)
      this.timestamp = this.schema_info["fields"].filter(elem => elem.id == "timestamp")[0];
    })
  }

  public save(){
     // save the changes
  }

  public showFieldCreateModal(): void {
    console.log("showing modal")
    this.addField = new Field(this.randomString(5));
    this.childModal.show();
    // this.childModal.show(this.addField);
  }

  public hideFieldCreateModal(save:boolean): void {
    console.log("hiding modal: "+save)
    console.log("Current field state: "+JSON.stringify(this.addField));
    // not saving, so just close
    if(!save){
      this.childModal.hide();
    }
    else if(this.addField.validate()){
      this.added_fields.push(this.addField);
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
}

export class Field{
  error:string = null;
  name:string;
  aliases:string[];
  type:string;
  constructor(private id:string){}

  public validate():boolean{
    this.error = null;
    if(name == null){
      this.error = "Must specify a field name";
    }
   
   this.validType(this.type);
    return this.error == null;
  }

  private validType(type:string):boolean {
    if (type === undefined) {
      this.error = "Must specify a type!"
      return false;
    }
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