import { AfterViewInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

/**
* Base class for items that need to be saved
*/
export class BaseEditableItem {

  // are we in the process of doing an outside task?
  @Input()
  public saving: boolean = false;
  @Output()
  public save = new EventEmitter();
  @Input()
  public refreshing: boolean = false;
  @Output()
  public refresh = new EventEmitter();

  private _init: boolean = false;

  constructor(protected name: string) {
  }

  ngAfterViewInit() {
    if (!this._init) {
      this._init = true;
      // do an initial data load
      this.onRefresh();
    }
  }

  public onRefresh(): void {
    console.log("[", this.name, "] Triggering refresh.");
    this.refresh.next(this);
  }

  public onSave(): void {
    console.log("[" + this.name + "] Triggering save");
    this.save.next(this);
  }

}