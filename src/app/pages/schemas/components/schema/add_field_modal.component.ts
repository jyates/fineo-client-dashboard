import {Component, ViewChild, ElementRef, Input} from "@angular/core";
import { ModalDirective } from 'ng2-bootstrap';

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

export class Field{
  name:string;
  aliases:Array<string>;
  type:string;
  constructor(private id:string){}
}