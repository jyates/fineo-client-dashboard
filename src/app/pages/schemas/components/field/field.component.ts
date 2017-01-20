import { Component, Input, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'field-sub-component',
    templateUrl: './field-subcomponent.html',
    styles: [require('./field-component.scss')],
    outputs: ['deleteItem']
})
export class FieldSubComponent {
    @Input() fieldForm: FormGroup; // This component is passed a FormGroup from the base component template
    @Input() index: number;

    public deleteItem = new EventEmitter();
    public handleDelete(event):void {
      this.deleteItem.next(this.index);
    }
}