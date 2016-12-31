import { Component, ViewEncapsulation, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'bach-component',
  // encapsulation: ViewEncapsulation.None,
  template: require('./batch.html'),
  styles: [require('./batch.scss')]
})
export class BatchComponent {

  constructor(private fb:FormBuilder){
  }
}