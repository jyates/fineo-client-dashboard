import { Component, ViewEncapsulation, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: "base-dashboard-component"
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
    else if (changes['config']){
      this.updateConfig();
    }
  }

  protected updateConfig(): void { };
  protected updateData(): void { };

  // pass through the delete/edit events from the underlying card
  @Output()
  public deleteEvent = new EventEmitter();
  @Output()
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
    let enabled = this.config["size"] == size;
    attributes.forEach(attrib => {
      to[attrib] = enabled;
    })
    to[this.item_prefix + "-" + size] = enabled;
  }
}

export class ItemConfig {
  public queries;
  constructor(public title: string,
    query, public size: string) {
    // support single or multi-query components
    console.log("Setting up config with query:", query);
    if (typeof query == "string") {
      this.queries = [new Query(query)]
    }else{
      this.queries = query;
    }
  }
}

export class Query{
  constructor(public text, public name:string = ""){}
}