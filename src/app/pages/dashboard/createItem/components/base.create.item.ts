import { AfterViewInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

import { CardConfig, ItemConfig } from '../../components';

/**
* Base class for items that need to be saved
*/
export class BaseCreateItem<T extends ItemConfig>{

  // create/edit items are not editable/deletable via the usual mechanisms
  public card: CardConfig = new CardConfig(false, false, false);

  // used in the template, so exposed here
  public form: FormGroup;
  public config:T;

  // from when we trigger a manual refresh
  @Input()
  public data;

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

  constructor(protected fb: FormBuilder, protected name: string) {
  }

  ngAfterViewInit() {
    if (!this._init) {
      this._init = true;
      // do an initial data load
      this.onRefresh();
    }
  }

  public onRefresh(): void {
    let config = this.getConfig();
    console.log("[" + this.name + "] Triggering refresh. Config: ", config);
    this.refresh.next(config);
  }

  public onSave(): void {
    console.log("[" + this.name + "] Triggering save");
    this.save.next(this.getConfig());
  }

  /**
   * Constantly update the target with information as it becomes available.
   * Skips values in the 'skip' array (e.g. they are handled in the update method).
   * NameMap is used to translate the form control name to the name in the target.
   * If there is no match in the nameMap, the control name is used in the target
   */
  protected listenForChanges(target: Object, skip: string[] = [], nameMap = {}, onMatch = {}) {
    let controls = this.form.controls;
    Object.keys(controls)
      .filter(name => {
        return !skip.includes(name);
      })
      .forEach(name => {
        let control = <AbstractControl>controls[name];
        control.statusChanges.subscribe(status => {
          if (status == "VALID") {
            console.log("Setting ", this.name, ":", name, "to", controls[name].value)
            var targetName = nameMap[name];
            if (!targetName) {
              targetName = name;
            }
            target[targetName] = controls[name].value;
            let func = onMatch[name];
            if (func) {
              func();
            }
          }
        })
      });
  }

  protected getConfig(): Object { return null; }
}

