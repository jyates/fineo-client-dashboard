import { AfterViewInit, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

import { CardConfig, ItemConfig } from '../../components';
import { BaseEditableItem } from '../../components';

/**
* Base class for items that need to be saved
*/
export class BaseCreateItem<T extends ItemConfig> extends BaseEditableItem {

  // create/edit items are not editable/deletable via the usual mechanisms
  public card: CardConfig = new CardConfig(false, false, false);

  // used in the template, so exposed here
  public form: FormGroup;

  // all passing in the config to create/edit
  @Input()
  public config: T;

  // from when we trigger a manual refresh
  @Input()
  public data;

  private skips:Array<string>;
  private nameMap;

  constructor(protected fb: FormBuilder, protected name: string) {
    super(name);
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.withConfig();
    }
  }

  /**
  * Called when there is a change to the incoming configuration
  */
  protected withConfig() { }

  protected setFirstQueryInForm(form: FormGroup, queryParam: string) {
    if (this.config.queries && this.config.queries.length > 0) {
      form.controls[queryParam].setValue(this.config.queries[0].text);
    }
  }

  protected setFields(from: any, to: FormGroup, skip: Array<string> = []) {
    BaseCreateItem.exclude(Object.keys(from), skip).forEach(key => {
      let control = to.controls[key];
      if (control) {
        control.setValue(from[key]);
      }
      else {
        console.warn("Skipping setting form control for:", key);
      }
    });
  }

  /**
   * Constantly update the target with information as it becomes available.
   * Skips values in the 'skip' array (e.g. they are handled in the update method).
   * NameMap is used to translate the form control name to the name in the target.
   * If there is no match in the nameMap, the control name is used in the target
   */
  protected listenForChanges(skip: string[] = [], nameMap = {}, onMatch = {}) {
    let controls = this.form.controls;
    this.skips = skip;
    this.nameMap = nameMap;
    BaseCreateItem.exclude(Object.keys(controls), skip)
      .forEach(name => {
        var targetName = nameMap[name];
        if (!targetName) {
          targetName = name;
        }
        let control = <AbstractControl>controls[name];

        // // set the initial fields
        // control.setValue(this.config[targetName]);

        // track changes from the form to the target (reverse binding)
        control.statusChanges.subscribe(status => {
          if (status == "VALID") {
            console.log("Setting ", this.name, ":", name, "to", controls[name].value)
            this.config[targetName] = controls[name].value;
            let func = onMatch[name];
            if (func) {
              func();
            }
          }
        })
      });
  }

  public static exclude(from: Array<string>, stringArray: any = []) {
    return from.filter(name => {
      return !stringArray.includes(name);
    })
  }

  protected getConfig(): Object { return null; }
}

