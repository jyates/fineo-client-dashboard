import {Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl} from '@angular/forms';

import { Subject }  from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { GaugeConfig } from '../../../gauge';


/*
 * Item building for a gauge
 */
@Component({
  selector: 'create-gauge',
  styleUrls: ['./gauge.item.scss'],
  templateUrl: './gauge.item.html',
  outputs: ['save', 'refresh']
})
export class GaugeItem implements OnChanges, AfterViewInit{

  @Input()
  public data:Object = null;
  @Input()
  public config:GaugeConfig = 
    new GaugeConfig("Gauge", 
      "SELECT 75 as percent, 125 as result", "medium","refresh", "result", "percent");

  @Input()
  public saving:boolean = false;
  @Input()
  public refreshing:boolean = false;

  private gauge:Object;
  public form:FormGroup;

  public save = new EventEmitter();
  public refresh = new EventEmitter();

  private _init: boolean = false;
  private icons = ["face", "refresh", "person", "money"];//, "shopping-cart", "comments"]

  constructor(private _baConfig:BaThemeConfigProvider,
              private fb:FormBuilder) {
    console.log("setting up gauge")
    // initial gauge setup
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    this.gauge = {
      color: pieColor,
      description: this.config.title ? this.config.title: 'Gauge',
      icon: this.config.icon ? (this.config.icon) : null,
      size: this.config.size,
    }

    // create the form to describe the gauge
    // the form groups match the fields in the gauge, not the config
    this.form = fb.group({
      'description': [this.gauge['description'], Validators.compose([Validators.required, Validators.minLength(1)])],
      'icon': [this.gauge['icon'], []],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(3)])],
      'query': [this.config.query, Validators.compose([Validators.required, Validators.minLength(3)])],
      'stats': [this.config.value,  Validators.compose([Validators.minLength(1)])],
      'percent': [this.config.percent,  Validators.compose([Validators.required, Validators.minLength(1)])]
    });
    this.listenForChanges(this.form);
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
      this.updateData(this.data);
    }
  }

  private updateData(result):void{
    console.log("got a data event: ", result);
    let row = result? result[0]: null;
    if(!row){
      return;
    }

    console.log("updating gauge")
    let config = this.getConfig();
    let column = config.value;
    if(column){
      let value = row[column] ? row[column] : "0";
      this.gauge['stats'] = ""+value;
    }
    let percent = config.percent;
    if(percent){
      let pvalue = row[percent] ? row[percent] : 0;
      this.gauge['percent'] = pvalue;
    }
    // force a new object to trigger the child change detection
    this.gauge = Object.create(this.gauge);
  }

  private selectIcon(name:string){
    this.config.icon = name;
    var val = name
    if(name == "none"){
      val = "";
    }
    console.log("Setting icon to", val, "from name", name)
    this.form.controls['icon'].setValue(val);
  }

  /**
   * Constantly update the gauge with information as it becomes available.
   * Skips 'query' update b/c that is handled by the onRefresh() hook 
   */
  private listenForChanges(form:FormGroup){
    let controls = form.controls;
    let skip = ["query", "stats", "percent"];
    Object.keys(controls)
      .filter(name =>{
        return !(skip.indexOf(name) > 0);
      })
      .forEach(name =>{
        let control = <AbstractControl>controls[name];
        control.statusChanges.subscribe(status =>{
          if(status == "VALID"){
            // console.log("Setting gauge", name, "to", controls[name].value)
            this.gauge[name] = controls[name].value;
          }
        })
      })
  }

  public onSave():void{
    console.log("[gauge] Triggering save");
    this.save.next(this.getConfig());
  }

  public onRefresh():void{
    console.log("[gauge] Triggering refresh");
   this.refresh.next(this.getConfig());
  }

  private getConfig():GaugeConfig{
    return new GaugeConfig(this.form.controls['description'].value,
                           this.form.controls['query'].value,
                           this.form.controls['icon'].value,
                           this.form.controls['size'].value,
                           this.form.controls['stats'].value,
                           this.form.controls['percent'].value)
  }
}