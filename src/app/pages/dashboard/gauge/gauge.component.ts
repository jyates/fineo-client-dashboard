import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import './gauge.loader.ts';

import { BaseCardComponent, ItemConfig } from '../components';

var nextId = 0;

@Component({
  selector: 'gauge',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./gauge.scss')],
  template: require('./gauge.html'),
})
export class Gauge extends BaseCardComponent<GaugeConfig> {
  @Input()
  id = `gauge-${nextId++}`;

  constructor(){
    super("pie-chart-container");
  }

  public init() {
    let select = this.select();
    jQuery(select).each(function() {
      let chart = jQuery(this);
      chart.easyPieChart({
        easing: 'easeOutBounce',
        onStep: function(from, to, percent) {
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

  protected updateData(){
    this.updateChart(this.data['percent'])
  }

  private updateChart(percent: number) {
    let select = this.select();
    console.log("Updating chart with selection:", select, "-", percent);
    jQuery(select).each(function(index, chart) {
      console.log("Updating chart:", index, "=>", chart)
      jQuery(chart).data('easyPieChart').update(percent);
    });
  }

  private select():string{
    return "#" + this.id + " .chart";
  }

  public getSize(){
    let elems = {};
    this.setSize("small", 3, elems);
    this.setSize("medium", 4, elems);
    this.setSize("large", 6, elems);
    return elems;
  }

 protected setSize(size: string, width: number, to: Object) {
    let widths = ["xl", "lg", "md", "sm", "xs"];
    let attributes = []
    widths.forEach(w => {
      attributes.push("col-" + w + "-" + width);
    });
    this.addAttributes(size, attributes, to);
  }

  protected addAttributes(size: string, attributes: string[], to: Object) {
    let enabled = this.config["size"] == size;
    attributes.forEach(attrib => {
      to[attrib] = enabled;
    })
    to["pie-chart-container" + "-" + size] = enabled;
  }
}

export class GaugeConfig extends ItemConfig {

  constructor(title:string,
              query:string,
              size:string,
              public icon:string,
              public value:string,
              public percent:string,
              public color: string = "#ffffff"){
    super(title, query, size);
  }
}