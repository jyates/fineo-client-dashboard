import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective }     from 'ng2-bootstrap';

import { DataUploadService } from '../../../../services/data.upload.service';

@Component({
  selector: 'bach-component',
  templateUrl: './batch.html',
  styleUrls: ['./batch.scss']
})
export class BatchComponent {

  public s3Form:FormGroup;
  private s3Location:AbstractControl;
  private fileName:string;

  public localForm:FormGroup;
  private localFile:AbstractControl;
  private localFileContent:AbstractControl;

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;
  @ViewChild('childModal') modal: ModalDirective;

  constructor(private service: DataUploadService,
              private fb:FormBuilder,
              private renderer:Renderer){
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
    let self = this;
    this.submit(this.localFileContent, function(content){
      return this.service.batchLocal(self.fileName, content)
    });
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
    method(val).then(result =>{
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
      console.log("Selected file: "+file.name);
      this.readFile(file);
      this.fileName = file.name;
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