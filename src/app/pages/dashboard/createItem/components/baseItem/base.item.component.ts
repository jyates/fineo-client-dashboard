import { Component, AfterViewInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { ItemConfig } from '../../../baseComponent';


/*
 * Item building for a gauge
 */
@Component({
  selector: 'base-item',
})
export class BaseItem implements OnChanges, AfterViewInit {

  // data from the underlying query
  @Input()
  public dataIn: Object = null;
  // configuration for the underlying viz component
  @Input()
  public config;

  // translation from the input data and passed along to the viz component
  public dataOut: Object = null;

  // are we in the process of doing an outside task?
  @Input()
  public saving: boolean = false;
  @Input()
  public refreshing: boolean = false;

  // used in the template, so exposed here
  public form: FormGroup;

  // notify the parent of the save/refresh events
  @Output()
  public save = new EventEmitter();
  @Output()
  public refresh = new EventEmitter();

  private _init: boolean = false;

  constructor(protected fb: FormBuilder, private name: string) {
  }

  ngAfterViewInit() {
    if (!this._init) {
      // do an initial data load
      this.onRefresh();
      this._init = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['dataIn']) {
      let result = this.updateData(this.dataIn);
      // reset the data to trigger a change event on the child
      this.dataOut = Object.create(result);
    }
  }

  protected updateData(result): Object { return null; }

  /**
   * Constantly update the target with information as it becomes available.
   * Skips values in the 'skip' array (e.g. they are handled in the update method).
   * NameMap is used to translate the form control name to the name in the target.
   * If there is no match in the nameMap, the control name is used in the target
   */
  protected listenForChanges(target: Object, skip: string[] = [], nameMap = {}) {
    let controls = this.form.controls;
    Object.keys(controls)
      .filter(name => {
        return !skip.includes(name);
      })
      .forEach(name => {
        let control = <AbstractControl>controls[name];
        control.statusChanges.subscribe(status => {
          if (status == "VALID") {
            console.log("Setting ", this.name, ":", name,"to", controls[name].value)
            var targetName = nameMap[name];
            if (!targetName) {
              targetName = name;
            }
            target[targetName] = controls[name].value;
          }
        })
      });
  }

  public onSave(): void {
    console.log("[" + this.name + "] Triggering save");
    this.save.next(this.getConfig());
  }

  public onRefresh(): void {
    let config = this.getConfig();
    console.log("[" + this.name + "] Triggering refresh. Config: ", config);
    this.refresh.next(config);
  }

  protected getConfig(): Object { return null; }
}
