import { Component, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective }     from 'ng2-bootstrap';

import { DataUploadService } from '../../../../services/dataUpload.service';

@Component({
  selector: 'stream-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./stream.html'),
  styles: [require('./stream.scss')],
})
export class StreamComponent {

  public form:FormGroup;
  private content:AbstractControl;
  @ViewChild('fileUpload') protected _fileUpload:ElementRef;
  @ViewChild('childModal') modal: ModalDirective;

  constructor(private service: DataUploadService,
              private fb:FormBuilder,
              private renderer:Renderer){
      this.form = this.fb.group({
          'content': ['',  Validators.compose([Validators.required, Validators.minLength(9), this.checkJson])]
      });
      this.content = this.form.controls['content']
  }

  private checkJson(control: AbstractControl):any{
    const val = control.value
    try{
      JSON.parse(val);
    } catch(e){
      return {"invalidJson": e.message };
    }
    return null;
  }

  private onSubmit(form_value):void{
    var val = this.content.value;
    this.modal.show();
    console.log("submittting")
    // also disables the form validity
    this.content.reset();

    // make the request
    this.service.stream(val).then(result =>{
      this.modal.hide();
    })
    .catch(err =>{
      console.log("Error uploading data!", JSON.stringify(err));
      alert("Failed to upload data! Please send console information to help@fineo.io");
    });
  }

  public load():boolean{
    this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
    return false;
  }

  public onFiles():void{
    let files = this._fileUpload.nativeElement.files;

    if (files.length) {
      const file = files[0];
      this.readFile(file);
    }
  }

  private readFile(file):void{
    const reader = new FileReader();
    reader.addEventListener('load', (event:Event) => {
      this.content.setValue((<any> event.target).result);
    }, false);
    reader.readAsText(file);
  }
}