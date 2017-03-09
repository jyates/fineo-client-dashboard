import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: "base-dashboard-component",
  outputs: ['deleteEvent', 'editEvent']
})
export class BaseComponent implements AfterViewInit, OnChanges {

  @Input()
  public data: Object;
  @Input()
  public editable: boolean = true;
  @Input()
  public deletable: boolean = true;

  private _init: boolean = false;

  ngAfterViewInit() {
    if (!this._init) {
      this.init();
      this._init = true;
    }
  }

  protected init(): void { };

  ngOnChanges(changes: SimpleChanges) {
    console.log("got changes:", changes)
    if (changes['data']) {
      this.updateData();
    }
  }

  protected updateData():void { };

  // pass through the delete/edit events from the underlying card
  public deleteEvent = new EventEmitter();
  public editEvent = new EventEmitter();
  public handleDelete(event): void {
    this.deleteEvent.next(event);
  }

  public handleEdit(event): void {
    this.editEvent.next(event);
  }
}