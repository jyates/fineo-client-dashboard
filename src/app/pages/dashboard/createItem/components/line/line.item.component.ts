import { Component, AfterViewInit, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { BaThemeConfigProvider, colorHelper } from '../../../../../theme';
import { Xaxis, Line, QueryChartConfig, LineQuery, LineConfig } from '../../../line';
import { BaseItem } from '../baseItem/base.item.component';


/*
 * Item building for a line component
 */
@Component({
  selector: 'create-line-chart',
  styleUrls: ['./line.item.scss'],
  templateUrl: './line.item.html'
})
export class LineItem extends BaseItem {

  private static GRAPH_TRANSPARENCTY_PERCENT = [0.30, 0.15];
  private static EXPANDED_CARD_SIZE = 270;
  private static COLLAPSED_CARD_SIZE = 220;

  private time_tooltip: string = "e.g. 'MM DD'. If empty, rounds to the nearest second";
  private y_tooltip: string = "Name of the yaxis field, if there are more than two columns (one being timestamp) in the result.";

  private colorIndex = 0;
  private graphColor;
  private textColor;
  constructor(_baConfig: BaThemeConfigProvider, fb: FormBuilder) {
    super(fb, 'line');
    var layoutColors = _baConfig.get().colors;
    this.graphColor = layoutColors.custom.dashboardLineChart;
    this.textColor = layoutColors.defaultText;
    console.log("setting up line")
    if (this.config == null) {
      this.config = new LineConfig("Line Chart", "large",
        [
          // simple demo query with four points
          new LineQuery("SELECT `timestamp`,val FROM (VALUES (1,'1000'),(2,'2000'), (3, '2500'), (4, '1200')) as MyTable(`timestamp`,val)",
            "query1",
            this.getNextColor(),
            new QueryChartConfig("0", "timestamp", "value"))
        ], this.xAxis(),
      );
    }

    // create the form to describe the gauge
    // the form groups match the fields in the gauge, not the config
    this.form = fb.group({
      'title': [this.config.title, Validators.compose([Validators.required, Validators.minLength(1)])],
      'size': [this.config.size, Validators.compose([Validators.required, Validators.minLength(3)])],
      'queries': this.fb.array([]),
    });
    this.listenForChanges(this.config, ["queries"]);
    this.addQueries(this.getQueries());
  }

  private xAxis(): Xaxis {
    return new Xaxis("date", true, this.textColor, this.textColor);
  }

  private getNextColor() {
    let color = colorHelper.hexToRgbA(this.graphColor, LineItem.GRAPH_TRANSPARENCTY_PERCENT[this.colorIndex]);
    this.colorIndex = (this.colorIndex++) % LineItem.GRAPH_TRANSPARENCTY_PERCENT.length;
    return color;
  }

  private addQueries(queries: FormArray) {
    let current: LineQuery[] = <LineQuery[]>this.config.queries
    current.forEach(query => {
      queries.push(this.createQuery(query.text, query.name, query.chart.yfield, query.color));
    })
  }

  public addQuery() {
    let queries = this.getQueries();
    if (queries.length == 2) {
      console.log("Cannot have more than 2 queries");
      return;
    }
    queries.push(this.createQuery());
  }

  private createQuery(query: string = "", name: string = "", yvalue = null, color = null): FormGroup {
    if (color === null || color === undefined) {
      color = this.getNextColor();
    }
    return this.fb.group({
      'name': [name, Validators.compose([Validators.required, Validators.minLength(1)])],
      'query': [query, Validators.compose([Validators.required, Validators.minLength(3)])],
      'y-axis': [yvalue, []],
      'card-height': [LineItem.COLLAPSED_CARD_SIZE, []],
      'color': [color, []]
    });
  }

  public isExpanded(sizeControl: AbstractControl) {
    return sizeControl.value == LineItem.EXPANDED_CARD_SIZE
  }

  public toggleCard(index: number) {
    let queries = this.getQueries();
    let group = <FormGroup>queries.controls[index];
    let control = group.controls['card-height'];
    if (control.value === LineItem.COLLAPSED_CARD_SIZE) {
      control.setValue(LineItem.EXPANDED_CARD_SIZE);
    } else {
      control.setValue(LineItem.COLLAPSED_CARD_SIZE);
    }
  }

  public allowMoreQueries() {
    return this.getQueriesArray().length < 2;
  }

  public removeQuery(index: number) {
    console.log("Removing query", index);
    let queries = this.getQueries();
    queries.removeAt(index);
    // refresh the data on remove!
    this.onRefresh();
  }

  private getQueries(): FormArray {
    return <FormArray>this.form.controls['queries'];
  }

  public getQueriesArray(): FormGroup[] {
    return <FormGroup[]>this.getQueries().controls;
  }

  protected updateData(results): Object {
    console.log("got a data event: ", results);
    if (!results) {
      return {};
    }
    // convert the results into 'nice' format for the component
    let out = {}
    for (var i = 0; i < results.length; i++) {
      let queryResult = results[i];
      out[i] = queryResult;
    }
    console.log("Converted to:", out);
    return out;
  }

  protected getConfig(): LineConfig {
    // convert the queries into line queries
    let queries = this.getQueriesArray();
    let lines: LineQuery[] = [];
    for (var i = 0; i < queries.length; i++) {
      var controls = queries[i].controls;
      lines.push(new LineQuery(controls['query'].value, controls['name'].value, controls['color'].value,
        new QueryChartConfig(i.toString(), "timestamp", controls['y-axis'])));
    }

    return new LineConfig(this.form.controls['title'].value,
      this.form.controls['size'].value,
      lines,
      this.xAxis());
  }
}