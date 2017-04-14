import { AfterViewInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { CardConfig } from './card.config'
import { ItemConfig } from './item.config'

/*
 * Base wrapper for managing the data to and from a dashboard item. Takes in data from 'dataIn' and exposes it as 'dataOut'.
 */
export class BaseElemHandler<T extends ItemConfig> implements OnChanges {

  @Input()
  public config: T;

  @Input()
  public card: CardConfig;

  // data from the underlying query
  @Input()
  public dataIn: Object = null;

  // translation from the input data and passed along to the viz component
  public dataOut: Object = null;

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['dataIn']) {
      let result = this.updateData(this.dataIn);
      // reset the data to trigger a change event on the child
      this.dataOut = Object.create(result);
    }
  }

  protected updateData(result): Object { return null; }
}
