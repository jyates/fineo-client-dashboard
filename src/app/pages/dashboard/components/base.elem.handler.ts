import { AfterViewInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs/Subject';

import { BaseCardEventHandler } from './base.card.event.handler'
import { CardConfig } from './card.config'
import { ItemConfig } from './item.config'

/*
 * Base wrapper for managing the data to and from a dashboard item. Takes in data from 'dataIn' and exposes it as 'dataOut'.
 */
export class BaseElemHandler<T extends ItemConfig> extends BaseCardEventHandler implements OnChanges {

  @Input()
  public config: T;

  @Input()
  public card: CardConfig;

  // data from the underlying query
  @Input()
  public data: Object = null;

  // translation from the input data and passed along to the viz component
  public dataOut: Object = null;

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['data']) {
      let result = this.updateData(this.data);
      console.log("Using data from handler:", result);
      // reset the data to trigger a change event on the child
      this.dataOut = Object.create(result);
    }
    if (changes['config']) {
      this.updateConfig(changes['config']);
    }
  }

  protected getOneRow(result: any): Object {
    // just get the first element, if there are multiple rows
    if (result instanceof Array || Array.isArray(result)) {
      if (result.length == 1) {
        return result[0];
      } else {
        debugger;
        throw new TypeError("This item only support a single row of data! Got result:\n" + result);
      }
    }
    return result;
  }

  protected updateData(result): Object { return null; }
  protected updateConfig(changes:SimpleChange): void { };
}
