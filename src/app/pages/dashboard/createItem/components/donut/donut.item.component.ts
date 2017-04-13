import { Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { DonutConfig } from '../../../donut';
import { BaseItem } from '../baseItem/base.item.component';


/*
 * Item building for a donut
 */
@Component({
  selector: 'create-donut',
  styleUrls: ['./donut.item.scss'],
  templateUrl: './donut.item.html'
})
export class DonutItem extends BaseItem {

  private colorOptions = [];

  constructor(private _baConfig: BaThemeConfigProvider,
    fb: FormBuilder) {
    super(fb, 'donut');
    console.log("setting up donut")
    // setup the base donut
    if (!this.config) {
      this.config =
        new DonutConfig("Donut",
          "SELECT 75 as c1, 125 as c2, 60 as c3, 30 as c4, 40 as c5, 70 as c6 FROM (VALUES (1))",
          "large", "percent", true, "Total Value");
    }

    // name and a value to display
    let dashboardColors = this._baConfig.get().colors.dashboard;
    Object.keys(dashboardColors).forEach(name => {
      this.colorOptions.push({
        name: name,
        color: dashboardColors[name]
      })
    });

    // create the form to describe the contents
    this.form = fb.group({
      'title': [this.config.title, Validators.compose([Validators.required, Validators.minLength(1)])],
      'query': [this.config.queries[0].text, Validators.compose([Validators.required, Validators.minLength(3)])],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(1), Validators.pattern("small|large")])],
      'centerEnabled': [this.config.centerEnabled, []],
      'centerLabel': [this.config.centerLabel, []],
      'valueType': [this.config.valueType, [Validators.compose([Validators.required, Validators.minLength(1), Validators.pattern("raw|percent")])]]
    });
    this.listenForChanges(this.config);
  }

  protected updateData(result): Object {
    console.log("got a data event: ", result);
    if (!result) {
      return null;
    }
    return result;
  }

  protected getConfig(): DonutConfig {
    return new DonutConfig(this.form.controls['title'].value,
      this.form.controls['query'].value,
      this.form.controls['size'].value,
      this.form.controls['valueType'].value,
      this.form.controls['centerEnabled'].value,
      this.form.controls['centerLabel'].value)
  }
}