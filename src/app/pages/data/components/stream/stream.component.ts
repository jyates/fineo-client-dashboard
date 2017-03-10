import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective }     from 'ng2-bootstrap';

import { DataUploadService } from '../../../../services/data.upload.service';

@Component({
  selector: 'stream-component',
  templateUrl: './stream.html',
  styleUrls: ['./stream.scss'],
})
export class StreamComponent {

  public submitting:boolean = false;
  public form:FormGroup;
  private content:AbstractControl;
  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

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
    val = JSON.parse(val);

    // also disables the form validity
    this.content.reset();

    this.submitting = true;

    // update the data to send to ensure there is a timestamp, if there isn't one already
    var timeInMs = Date.now();
    if (Array.isArray(val)){
      val.forEach(obj =>{
        this.addTimestampIfNecessary(obj);
      })
    } else {
      this.addTimestampIfNecessary(val);
    }

    console.log("Submitting: ", JSON.stringify(val));

    // make the request
    this.service.stream(val).then(result =>{
      this.submitting = false;
      console.log("Successfully submitted data!");
    })
    .catch(err =>{
      console.log("Error uploading data!", JSON.stringify(err));
      alert("Failed to upload data! Please send console information to help@fineo.io");
    });
  }

  private addTimestampIfNecessary(obj:Object):void{
    if (obj['timestamp'] === undefined){
      obj['timestamp'] = Date.now();
    }
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