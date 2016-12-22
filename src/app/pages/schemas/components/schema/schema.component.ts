import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SchemaService } from '../../../../schema.service'

@Component({
  selector: 'schema-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./schema.html'),
  styles: [require('./schema.scss')]
})
export class SchemaComponent {

  private schema_info:Object;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: SchemaService){}

  ngOnInit() {
    this.route.params.subscribe((value) => this.schema_info = this.service.getSchema(value["id"]));
  }
}