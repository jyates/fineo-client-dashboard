import {Component, ViewEncapsulation, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl} from '@angular/forms';

import { Subject }  from 'rxjs/Subject';

import {BaThemeConfigProvider, colorHelper} from '../../../../../theme';
import {ItemConfig} from '../../create.item.component'

var nextId = 0;

/*
 * Item building for a gauge
 */
 @Component({
  selector: 'create-gauge',
  encapsulation: ViewEncapsulation.None,
  template: require('./gauge.item.html'),
  outputs: ['save', 'refresh']
})
export class GaugeItem implements AfterViewInit, OnChanges{

  @Input()
  public data:Object = null;
  @Input()
  public config:GaugeConfig = new GaugeConfig("", "", "", "", "");
  @Input()
  public saving:boolean = false;
  @Input()
  public refreshing:boolean = false;
  @Input()
  id = `create-gauge-${nextId++}`;

  private gauge:Object;
  public form:FormGroup;

  public save = new EventEmitter();
  public refresh = new EventEmitter();

  private _init:boolean = false;

  constructor(private _baConfig:BaThemeConfigProvider,
              private fb:FormBuilder) {
    console.log("setting up gauge")
    // initial gauge setup
    let pieColor = this._baConfig.get().colors.custom.dashboardPieChart;
    this.gauge = {
      color: pieColor,
      description: this.config.title ? this.config.title: 'Gauge',
      icon: this.config.icon ? (this.config.icon) : null,
    }

    // create the form to describe the gauge
    // the form groups match the fields in the gauge, not the config
    this.form = fb.group({
      'description': [this.gauge['description'], Validators.compose([Validators.required, Validators.minLength(1)])],
      'icon': [this.gauge['icon'], []],
      'query': [this.config.query, Validators.compose([Validators.required, Validators.minLength(3)])],
      'stats': [this.config.value,  Validators.compose([Validators.minLength(1)])],
      'percent': [this.config.percent,  Validators.compose([Validators.required, Validators.minLength(1)])]
    });
    this.listenForChanges(this.form);
  }

ngOnChanges(changes: SimpleChanges) {
        // only run when property "data" changed
        console.log("Got change in input: ", changes);
        if (changes['data']) {
          console.log("got data change")
            this.updateData(this.data);
        }
    }

  private updateData(result):void{
      console.log("got a data event: ", result);
      let row = result? result[0]: null;
      if(!row){
        return;
      }

      let config = this.getConfig();
      let column = config.value;
      if(column){
        let value = row[column] ? row[column] : "0";
        this.gauge['stats'] = ""+value;
      }
      let percent = config.percent;
      if(percent){
        let pvalue = row[percent] ? row[percent] : 0;
        this.updateChart(pvalue);
      }
  }

  private updateChart(percent:number){
    let select = "#"+this.id+" .chart"
    jQuery(select).each(function(index, chart) {
      console.log("Updating chart:", index, "=>", chart)
      jQuery(chart).data('easyPieChart').update(percent);
    });
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
                           this.form.controls['stats'].value,
                           this.form.controls['percent'].value)
  }

  ngAfterViewInit() {
    if (!this._init) {
      this._loadPieCharts();
      this._init = true;
    }
  }

  private _loadPieCharts() {
    jQuery('.chart').each(function () {
      let chart = jQuery(this);
      chart.easyPieChart({
        easing: 'easeOutBounce',
        onStep: function (from, to, percent) {
          jQuery(this.el).find('.percent').text(Math.round(percent));
        },
        barColor: jQuery(this).attr('data-rel'),
        trackColor: 'rgba(0,0,0,0)',
        size: 84,
        scaleLength: 0,
        animation: 2000,
        lineWidth: 9,
        lineCap: 'round',
      });
    });
  }
}

export class GaugeConfig extends ItemConfig {

  constructor(title:string,
              query:string,
              public icon:string,
              public value:string,
              public percent:string){
    super(title, query);
  }
}
