import {Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl} from '@angular/forms';

import { Subject }  from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { GaugeConfig } from '../../../gauge';
import { BaseItem } from '../baseItem/base.item.component';


/*
 * Item building for a gauge
 */
@Component({
  selector: 'create-gauge',
  styleUrls: ['./gauge.item.scss'],
  templateUrl: './gauge.item.html'
})
export class GaugeItem extends BaseItem{

  private icons = ["face", "refresh", "person", "money"];//, "shopping-cart", "comments"]

  constructor(_baConfig:BaThemeConfigProvider,
              fb:FormBuilder) {
    super(fb, 'gauge');
    console.log("setting up gauge")
    if(this.config == null){
     this.config = new GaugeConfig("Gauge", 
        "SELECT 75 as `percent`, 125 as `result` FROM (VALUES (1))",
        "medium","refresh", "result", "percent", _baConfig.get().colors.custom.dashboardPieChart);
    }

    // create the form to describe the gauge
    // the form groups match the fields in the gauge, not the config
    this.form = fb.group({
      'title': [this.config.title, Validators.compose([Validators.required, Validators.minLength(1)])],
      'icon': [this.config.icon, []],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(3)])],
      'query': [this.config.queries[0].text, Validators.compose([Validators.required, Validators.minLength(3)])],
      'stats': [this.config.value,  Validators.compose([Validators.minLength(1)])],
      'percent': [this.config.percent,  Validators.compose([Validators.required, Validators.minLength(1)])]
    });
    this.listenForChanges(this.config, [ "stats", "percent"]);
  }

  protected updateData(result):Object{
    console.log("got a data event: ", result);
    let row = result? result[0]: null;
    if(!row){
      return null;
    }

    console.log("updating gauge")
    let config = this.getConfig();
    let column = config.value;
    let out = {};
    if(column){
      let value = row[column] ? row[column] : "0";
      out['stats'] = ""+value;
    }
    let percent = config.percent;
    if(percent){
      let pvalue = row[percent] ? row[percent] : 0;
      out['percent'] = pvalue;
    }
    return out;
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

  protected getConfig():GaugeConfig{
    return new GaugeConfig(this.form.controls['title'].value,
                           this.form.controls['query'].value,
                           this.form.controls['icon'].value,
                           this.form.controls['size'].value,
                           this.form.controls['stats'].value,
                           this.form.controls['percent'].value)
  }
}