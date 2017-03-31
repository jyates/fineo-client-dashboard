import { Component, ViewChild, ElementRef, Renderer, OnInit } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ModalDirective } from 'ng2-bootstrap';

import { DataUploadService } from '../../../../services/data.upload.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'stream-component',
  templateUrl: './stream.html',
  styleUrls: ['./stream.scss'],
})
export class StreamComponent implements OnInit {

  private tooltip: string = "All events that do not have a 'timestamp' field will have one added with the value as the current time.";

  public submitting: boolean = false;
  public displayDone: boolean = false;
  private clearDoneId: any = null;
  public form: FormGroup;
  private content: AbstractControl;
  @ViewChild('fileUpload') protected _fileUpload: ElementRef;

  constructor(private service: DataUploadService,
    private fb: FormBuilder,
    private renderer: Renderer,
    private user: UserService) {
    this.form = this.fb.group({
      'content': ['', Validators.compose([Validators.required, Validators.minLength(9), this.checkJson])]
    });
    this.content = this.form.controls['content']
  }

  ngOnInit() {
    console.log("In init")
    // ensure that we have credentials
    this.user.ensureUser().then(success => { console.log("Success init: ", success)}).catch(failure => {
      console.log("Unexpected error getting user! Error:", failure);
      alert("Failed to find user. Please send console output to help@fineo.io");
    })
  }

  private checkJson(control: AbstractControl): any {
    const val = control.value
    try {
      JSON.parse(val);
    } catch (e) {
      return { "invalidJson": e.message };
    }
    return null;
  }

  private onSubmit(form_value): void {
    var val = this.content.value;
    val = JSON.parse(val);

    this.markSubmit();
    // update the data to send to ensure there is a timestamp, if there isn't one already
    var timeInMs = Date.now();
    if (Array.isArray(val)) {
      val.forEach(obj => {
        this.addTimestampIfNecessary(obj);
      })
    } else {
      this.addTimestampIfNecessary(val);
    }

    console.log("Submitting: ", JSON.stringify(val));

    // make the request
    this.service.stream(val).then(result => {
      this.markDone();
      console.log("Successfully submitted data!");
    })
      .catch(err => {
        console.log("Error uploading data!", JSON.stringify(err));
        this.markDone(false);
        alert("Failed to upload data! Please send console information to help@fineo.io");
      });
  }

  private markSubmit(): void {
    this.submitting = true;
    let val = this.content.value.toString();
    // this.content.setValue(val);
    this.content.reset({ value: val, disabled: true });
    this.cancelDone()
  }

  private cancelDone(): void {
    if (this.clearDoneId != null) {
      clearTimeout(this.clearDoneId);
      this.clearDoneId = null;
      this.displayDone = false;
    }
  }

  private markDone(displayDone: boolean = true) {
    this.content.reset();
    this.submitting = false;
    this.displayDone = displayDone;
    // turn off displayDone in 2 seconds. 
    if (displayDone) {
      console.log("Enabling 'done' display, waiting to turn if off");
      this.clearDoneId = setTimeout(() => this.displayDone = false, 2000);
    }
  }

  private addTimestampIfNecessary(obj: Object): void {
    if (obj['timestamp'] === undefined) {
      obj['timestamp'] = Date.now();
    }
  }

  public load(): boolean {
    this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
    return false;
  }

  public onFiles(): void {
    let files = this._fileUpload.nativeElement.files;

    if (files.length) {
      const file = files[0];
      this.readFile(file);
    }
  }

  private readFile(file): void {
    const reader = new FileReader();
    reader.addEventListener('load', (event: Event) => {
      this.content.setValue((<any>event.target).result);
    }, false);
    reader.readAsText(file);
  }
}