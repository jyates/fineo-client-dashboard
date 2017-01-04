import { Component, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective }     from 'ng2-bootstrap';

import { DataUploadService } from '../../dataUpload.service';

@Component({
  selector: 'bach-component',
  // encapsulation: ViewEncapsulation.None,
  template: require('./batch.html'),
  styles: [require('./batch.scss')]
})
export class BatchComponent {

  public s3Form:FormGroup;
  private s3Location:AbstractControl;

  public localForm:FormGroup;
  private localFile:AbstractControl;
  private localFileContent:AbstractControl;

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;
  @ViewChild('childModal') modal: ModalDirective;

  constructor(private service: DataUploadService,
              private fb:FormBuilder,
              // private pService: NgProgressService,
              private renderer:Renderer,
              // protected uploader:Ng2Uploader
              ){
      this.s3Form = this.fb.group({
          's3Location': ['',  Validators.compose([Validators.required, , Validators.minLength(2)])]
      });
      this.s3Location = this.s3Form.controls['s3Location']

      this.localForm = this.fb.group({
          'localFile': ['',  Validators.compose([Validators.required, Validators.minLength(1)])],
          'localFileContent': ['',  Validators.compose([Validators.required, Validators.minLength(9)])]
      });
      this.localFile = this.localForm.controls['localFile'];
      this.localFileContent = this.localForm.controls['localFileContent'];
  }

  private submitLocal(form_value):void{
    this.submit(this.localFileContent, this.service.batchLocal);
    this.localFile.reset();
  }

  private submitS3(form_value):void{
    this.submit(this.s3Location, this.service.batchS3);
  }

  private submit(control:AbstractControl, method:Function): void{
    var val = control.value;
    this.modal.show();
    // also disables the form validity
    control.reset();

    // make the request
    // this.pservice.start();
    method(val);
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
      console.log("Selected file: "+file.name);
      this.readFile(file);
    }
  }

  private readFile(file):void{
    const reader = new FileReader();
    reader.addEventListener('load', (event:Event) => {
      this.localFile.setValue(file.name);
      this.localFileContent.setValue((<any> event.target).result);
    }, false);
    reader.readAsText(file);
  }
}