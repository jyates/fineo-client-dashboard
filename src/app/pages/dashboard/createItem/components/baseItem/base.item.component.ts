import {Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl} from '@angular/forms';

import { Subject }  from 'rxjs/Subject';

import {BaThemeConfigProvider, colorHelper} from '../../../../../theme';
import {ItemConfig} from '../../create.item.component'


/*
 * Item building for a gauge
 */
 @Component({
  selector: 'base-item',
  outputs: ['save', 'refresh']
})
export class BaseItem implements OnChanges, AfterViewInit{

  @Input()
  public data:Object = null;
  @Input()
  public config;

  @Input()
  public saving:boolean = false;
  @Input()
  public refreshing:boolean = false;

  // output from the item to the actual chart. 
  public out: Object = null;

  public form: FormGroup;
  public save = new EventEmitter();
  public refresh = new EventEmitter();

  private _init: boolean = false;

  constructor(protected fb:FormBuilder, private name:string) {
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
    if (changes['data']) {
      let result = this.updateData(this.data);
      // reset the data to trigger a change event on the child
      this.out = Object.create(result);
    }
  }

  protected updateData(result): Object { return null;}

  /**
   * Constantly update the gauge with information as it becomes available.
   * Skips values in the 'skip' array (e.g. they are handled in the update method)
   */
  private listenForChanges(target:Object, skip:string[]){
    let controls = this.form.controls;
    Object.keys(controls)
      .filter(name =>{
        return !(skip.indexOf(name) > 0);
      })
      .forEach(name =>{
        let control = <AbstractControl>controls[name];
        control.statusChanges.subscribe(status =>{
          if(status == "VALID"){
            // console.log("Setting gauge", name, "to", controls[name].value)
            target[name] = controls[name].value;
          }
        })
      })
  }

  public onSave():void{
    console.log("["+this.name+"] Triggering save");
    this.save.next(this.getConfig());
  }

  public onRefresh():void{
    console.log("["+this.name+"] Triggering refresh");
     this.refresh.next(this.getConfig());
  }

  protected getConfig(): Object { return null;}
}
