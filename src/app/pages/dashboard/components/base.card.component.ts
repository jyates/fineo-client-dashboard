import { ViewEncapsulation, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { BaseCardEventHandler, CardConfig } from './index'
/**
* Wrapper around a 'baCard' that outputs the edit and delete event
*/
export class BaseCardComponent<T> extends BaseCardEventHandler implements AfterViewInit, OnChanges {

  @Input()
  public data: Object = null;
  @Input()
  public config: T = null;
  @Input()
  public card: CardConfig;

  private _init: boolean = false;

  constructor(private item_prefix: string) {
    super();
  }

  ngAfterViewInit() {
    if (!this._init) {
      this.init();
      this._init = true;
    }
  }

  protected init(): void { };

  ngOnChanges(changes: SimpleChanges) {
    console.log("got changes:", changes)
    // config and data can change at the same time, e.g. on initialize. Update config first b/c that could contain infor pertinent to processing the data
    if (changes['config']) {
      this.updateConfig();
    }
    if (changes['data']) {
      this.updateData();
    }
  }

  protected updateConfig(): void { };
  protected updateData(): void { };
}