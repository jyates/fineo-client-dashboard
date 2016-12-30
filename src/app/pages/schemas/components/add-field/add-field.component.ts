import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'add-field-component',
    templateUrl: './add-field.html'
    // styles: [require('./schema.scss')]
})
export class AddFieldComponent {
    @Input() fieldForm: FormGroup; // This component is passed a FormGroup from the base component template
    @Input() index: number;
}