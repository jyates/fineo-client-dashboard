import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SchemaService } from '../../../../schema.service'

@Component({
  selector: 'add-schema-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./add.html'),
  styles: [require('./add.scss')]
})
export class AddSchemaComponent {

  constructor(){}
}