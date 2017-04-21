import { Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { GaugeConfig } from '../../../gauge';
import { BaseCreateItem } from '../base.create.item';


/*
 * Item building for a gauge
 */
@Component({
  selector: 'create-gauge',
  styleUrls: ['./gauge.item.scss'],
  templateUrl: './gauge.item.html'
})
export class GaugeItem extends BaseCreateItem<GaugeConfig> {

  private icons = ["face", "refresh", "person", "money"];//, "shopping-cart", "comments"]

  constructor(_baConfig: BaThemeConfigProvider,
    fb: FormBuilder) {
    super(fb, 'gauge');
    console.log("setting up gauge")
    if (this.config == null) {
      this.config = new GaugeConfig("Gauge",
        "SELECT 75 as `percent`, 125 as `result` FROM (VALUES (1))",
        "medium", "refresh", "result", "percent", _baConfig.get().colors.custom.dashboardPieChart);
    }
    // create the form to describe the gauge
    // the form groups match the fields in the gauge, not the config
    this.form = this.fb.group({
      'title': [this.config.title, Validators.compose([Validators.required, Validators.minLength(1)])],
      'icon': [this.config.icon, []],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(3)])],
      'query': [this.config.queries[0].text, Validators.compose([Validators.required, Validators.minLength(3)])],
      'value': [this.config.value, Validators.compose([Validators.minLength(1)])],
      'percent': [this.config.percent, Validators.compose([Validators.required, Validators.minLength(1)])]
    });
    this.listenForChanges(['queries']);
  }

  // we got a new config
  protected withConfig() {
    this.setFields(this.config, this.form, ['queries', 'color']);
    this.setFirstQueryInForm(this.form, 'query');
  }

  private selectIcon(name: string) {
    this.config.icon = name;
    var val = name
    if (name == "none") {
      val = "";
    }
    console.log("Setting icon to", val, "from name", name)
    this.form.controls['icon'].setValue(val);
  }

  protected getConfig(): GaugeConfig {
    return new GaugeConfig(this.form.controls['title'].value,
      this.form.controls['query'].value,
      this.form.controls['size'].value,
      this.form.controls['icon'].value,
      this.form.controls['value'].value,
      this.form.controls['percent'].value)
  }
}