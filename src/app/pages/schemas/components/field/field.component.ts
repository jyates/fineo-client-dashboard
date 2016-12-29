import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'field-sub-component',
    templateUrl: './field-subcomponent.html'
    // styles: [require('./schema.scss')]
})
export class FieldSubComponent {
    @Input() fieldForm: FormGroup; // This component is passed a FormGroup from the base component template
    @Input() index: number;
}