import { Component, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

// import {Ng2Uploader} from 'ng2-uploader/ng2-uploader';
// import {NgProgressService} from "ng2-progressbar";
import { ModalDirective }     from 'ng2-bootstrap';

import { DataUploadService } from '../../dataUpload.service';

@Component({
  selector: 'stream-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./stream.html'),
  styles: [require('./stream.scss')],
  // providers: [Ng2Uploader]
})
export class StreamComponent {

  public form:FormGroup;
  private content:AbstractControl;
  @ViewChild('fileUpload') protected _fileUpload:ElementRef;
  @ViewChild('childModal') modal: ModalDirective;

  constructor(private service: DataUploadService,
              private fb:FormBuilder,
              // private pService: NgProgressService,
              private renderer:Renderer,
              // protected uploader:Ng2Uploader
              ){
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
    // this.pservice.start();
    this.service.stream(val);
    //.subscribe(result =>{
      // request complete!
      // this.pservice.done();
    // });
    this.modal.hide();
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