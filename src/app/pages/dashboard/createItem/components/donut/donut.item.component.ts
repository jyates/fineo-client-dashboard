import {Component, ViewEncapsulation, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl} from '@angular/forms';

import { Subject }  from 'rxjs/Subject';

import {BaThemeConfigProvider, colorHelper} from '../../../../../theme';
import {ItemConfig} from '../../create.item.component'


/*
 * Item building for a gauge
 */
 @Component({
  selector: 'create-gauge',
  encapsulation: ViewEncapsulation.None,
  template: require('./gauge.item.html'),
  styles: [require('./gauge.item.scss')],
  outputs: ['save', 'refresh']
})
export class DonutItem implements OnChanges, AfterViewInit{

  @Input()
  public data:Object = null;
  @Input()
  public config:DonutConfig = 
    new DonutConfig("Donut", 
      "SELECT 75 as c1, 125 as c2, 60 as c3, 30 as c4, 40 as c5, 70 as c6", "large", "percent", "Center Label");

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

    // create the form to describe the contents
    this.form = fb.group({
      'title': [this.gauge['title'], Validators.compose([Validators.required, Validators.minLength(1)])],
      'query': [this.config.query, Validators.compose([Validators.required, Validators.minLength(3)])],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(1), Validators.pattern("small|large")])]
      'centerEnabled': [this.config.centerEnabled, []],
      'centerLabel': [this.config.centerLabel, []],
      'valueType': [this.config.valueType, [Validators.compose([Validators.required, Validators.minLength(1), Validators.pattern("raw|percent")])]]]
    });
    // this.listenForChanges(this.form);
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

  private getConfig():DonutConfig{
    return new DonutConfig(this.form.controls['title'].value,
                           this.form.controls['query'].value,
                           this.form.controls['icon'].value,
                           this.form.controls['size'].value,
                           this.form.controls['stats'].value,
                           this.form.controls['percent'].value)
  }
}

export class DonutConfig extends ItemConfig {

  constructor(title:string,
              query:string,
              size:string,
              public valueType:string,
              public centerEnabled:boolean;
              public centerLabel:string){
    super(title, query, size);
  }
}
