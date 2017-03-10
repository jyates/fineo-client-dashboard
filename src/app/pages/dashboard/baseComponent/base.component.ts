import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: "base-dashboard-component",
  outputs: ['deleteEvent', 'editEvent']
})
export class BaseComponent<T> implements AfterViewInit, OnChanges {

  @Input()
  public data: Object = null;
  @Input()
  public config: T = null;
  @Input()
  public editable: boolean = true;
  @Input()
  public deletable: boolean = true;

  private _init: boolean = false;

  constructor(private item_prefix: string) { }

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

  protected updateData(): void { };

  // pass through the delete/edit events from the underlying card
  public deleteEvent = new EventEmitter();
  public editEvent = new EventEmitter();
  public handleDelete(event): void {
    this.deleteEvent.next(event);
  }

  public handleEdit(event): void {
    this.editEvent.next(event);
  }

  protected setSize(size: string, width: number, to: Object) {
    let widths = ["xl", "lg", "md", "sm", "xs"];
    let attributes = []
    widths.forEach(w => {
      attributes.push("col-" + w + "-" + width);
    });
    this.addAttributes(size, attributes, to);
  }

  protected addAttributes(size: string, attributes: string[], to: Object) {
    let enabled = this.data["size"] == size;
    attributes.forEach(attrib => {
      to[attrib] = enabled;
    })
    to[this.item_prefix + "-" + size] = enabled;
  }
}

export class ItemConfig {
  constructor(public title: string,
    public query: string,
    public size: string) { }
}