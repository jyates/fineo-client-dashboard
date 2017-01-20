import { Component, Input, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'add-field-component',
    templateUrl: './add-field.html',
    styles: [require('./add-field.scss')],
    outputs: ['deleteItem']
})
export class AddFieldComponent {
    @Input() fieldForm: FormGroup; // This component is passed a FormGroup from the base component template
    @Input() index: number;

    public deleteItem = new EventEmitter();
    public handleDelete(event):void {
      this.deleteItem.next(this.index);
    }
}