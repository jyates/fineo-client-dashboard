import { Component, ViewEncapsulation, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import './gauge.loader.ts';

var nextId = 0;

@Component({
  selector: 'gauge',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./gauge.scss')],
  template: require('./gauge.html'),
  outputs: ['deleteEvent', 'editEvent']
})
export class Gauge implements AfterViewInit, OnChanges {

  @Input()
  public chart: Object;
  @Input()
  public editable: boolean = true;
  @Input()
  public deletable: boolean = true;
  @Input()
  id = `gauge-${nextId++}`;

  private _init: boolean = false;

  // pass through the delete/edit events from the underlying card
  public deleteEvent = new EventEmitter();
  public editEvent = new EventEmitter();
  public handleDelete(event): void {
    this.deleteEvent.next(event);
  }

  public handleEdit(event): void {
    this.editEvent.next(event);
  }

  private getChartSize() {
    let elems = {};
    this.setSize("small", 3, elems);
    this.setSize("medium", 4, elems);
    this.setSize("large", 6, elems);
    return elems;
  }

  private setSize(size: string, width: number, to: Object) {
    let widths = ["xl", "lg", "md", "sm", "xs"];
    let attributes = []
    widths.forEach(w => {
      attributes.push("col-" + w + "-" + width);
    });
    this.addAttributes(size, attributes, to);
  }

  private addAttributes(size: string, attributes: string[], to: Object) {
    let enabled = this.chart["size"] == size;
    attributes.forEach(attrib => {
      to[attrib] = enabled;
    })
    to["pie-chart-container-" + size] = enabled;
  }


  ngAfterViewInit() {
    if (!this._init) {
      this._loadPieCharts();
      this._init = true;
    }
  }

  private _loadPieCharts() {
    jQuery('.chart').each(function() {
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

  ngOnChanges(changes: SimpleChanges) {
    console.log("got changes:", changes)
    if (changes['chart']) {
      this.updateChart(this.chart['percent']);
    }
  }

  private updateChart(percent: number) {
    let select = "#" + this.id + " .chart"
    console.log("Updating chart with selection:", select, "-", percent);
    jQuery(select).each(function(index, chart) {
      console.log("Updating chart:", index, "=>", chart)
      jQuery(chart).data('easyPieChart').update(percent);
    });
  }
}