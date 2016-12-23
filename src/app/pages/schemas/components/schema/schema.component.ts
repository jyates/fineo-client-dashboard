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
  private added_fields:Array<Field>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: SchemaService){}

  ngOnInit() {
    this.route.params.subscribe(path_info => this.schema_info = this.service.getSchema(path_info["id"]))
  }

  public save(){
     // save the changes
  }
}

class Field{
  private name:string;
  private aliases:Array<string>;
  private type:string;
}