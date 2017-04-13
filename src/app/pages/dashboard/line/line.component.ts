import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { BaseComponent, ItemConfig, Query } from './../baseComponent';
import { layoutPaths } from '../../../theme';
import { BaAmChart } from '../../../theme/components/baAmChart'

var nextLineId = 0;

@Component({
  selector: 'line-chart',
  styleUrls: ['./line.scss'],
  templateUrl: './line.html'
})
export class Line extends BaseComponent<LineConfig> {

  public static DEMO_DATA = {
    // query id 1
    "1": [
      { date: new Date(2012, 11).getTime(), value: 0 },
      { date: new Date(2013, 0).getTime(), value: 15000 },
      { date: new Date(2013, 1).getTime(), value: 30000 },
      { date: new Date(2013, 2).getTime(), value: 25000 },
      { date: new Date(2013, 3).getTime(), value: 21000 },
      { date: new Date(2013, 4).getTime(), value: 24000 },
      { date: new Date(2013, 5).getTime(), value: 31000 },
      { date: new Date(2013, 6).getTime(), value: 40000 },
      { date: new Date(2013, 7).getTime(), value: 37000 },
      { date: new Date(2013, 8).getTime(), value: 18000 },
      { date: new Date(2013, 9).getTime(), value: 5000 },
      { date: new Date(2013, 10).getTime(), value: 40000 },
      { date: new Date(2013, 11).getTime(), value: 20000 },
      { date: new Date(2014, 0).getTime(), value: 5000 },
      { date: new Date(2014, 1).getTime(), value: 3000 },
      { date: new Date(2014, 2).getTime(), value: 1800 },
      { date: new Date(2014, 3).getTime(), value: 10400 },
      { date: new Date(2014, 4).getTime(), value: 25500 },
      { date: new Date(2014, 5).getTime(), value: 2100 },
      { date: new Date(2014, 6).getTime(), value: 6500 },
      { date: new Date(2014, 7).getTime(), value: 1100 },
      { date: new Date(2014, 8).getTime(), value: 17200 },
      { date: new Date(2014, 9).getTime(), value: 26900 },
      { date: new Date(2014, 10).getTime(), value: 14100 },
      { date: new Date(2014, 11).getTime(), value: 35300 },
      { date: new Date(2015, 0).getTime(), value: 54800 },
      { date: new Date(2015, 1).getTime(), value: 49800 }
    ],
    // query 2
    "2": [
      { date: new Date(2012, 11).getTime(), value: 0 },
      { date: new Date(2013, 0).getTime(), value: 19000 },
      { date: new Date(2013, 1).getTime(), value: 20000 },
      { date: new Date(2013, 2).getTime(), value: 22000 },
      { date: new Date(2013, 3).getTime(), value: 25000 },
      { date: new Date(2013, 4).getTime(), value: 29000 },
      { date: new Date(2013, 5).getTime(), value: 26000 },
      { date: new Date(2013, 6).getTime(), value: 25000 },
      { date: new Date(2013, 7).getTime(), value: 20000 },
      { date: new Date(2013, 8).getTime(), value: 22000 },
      { date: new Date(2013, 9).getTime(), value: 26000 },
      { date: new Date(2013, 10).getTime(), value: 30000 },
      { date: new Date(2013, 11).getTime(), value: 25000 },
      { date: new Date(2014, 0).getTime(), value: 13000 },
      { date: new Date(2014, 1).getTime(), value: 13000 },
      { date: new Date(2014, 2).getTime(), value: 13000 },
      { date: new Date(2014, 3).getTime(), value: 13000 },
      { date: new Date(2014, 4).getTime(), value: 13000 },
      { date: new Date(2014, 5).getTime(), value: 13000 },
      { date: new Date(2014, 6).getTime(), value: 13000 },
      { date: new Date(2014, 7).getTime(), value: 13000 },
      { date: new Date(2014, 8).getTime(), value: 13000 },
      { date: new Date(2014, 9).getTime(), value: 13000 },
      { date: new Date(2014, 10).getTime(), value: 13000 },
      { date: new Date(2014, 11).getTime(), value: 13000 },
      { date: new Date(2015, 0).getTime(), value: 13000 },
      { date: new Date(2015, 1).getTime(), value: 13000 }
    ]
  };

  @Input()
  public id = `line-${nextLineId++}`;

  @ViewChild(BaAmChart) public chartElem: BaAmChart;

  public chartData: ChartData = new ChartData(layoutPaths.images.amChart);
  private chartReady: boolean = false;
  constructor() {
    super("line-chart-container");
  }

  private getSize() {
    let elems = {};
    this.setSize("small", 4, elems);
    this.setSize("medium", 6, elems);
    this.setSize("large", 12, elems);
    return elems;
  }

  // callback when chart is ready 
  initChart(chart: any) {
    console.log("Chart is initialized");
    // TODO replace the initial zoom
    // let zoomChart = () => {
    //   chart.zoomToDates(new Date(2013, 3), new Date(2014, 0));
    // };

    // chart.addListener('rendered', zoomChart);
    // zoomChart();

    // if (chart.zoomChart) {
    //   chart.zoomChart();
    // }
    chart.addListener('rendered', () => {
      console.log("Chart is done rendering!");
    });
    this.chartReady = true;
  }

  protected updateData() {
    console.log("Updating data for line chart")
    this.chartData.data(this.data);
    if (this.chartReady) {
      this.chartElem.updateData(this.chartData.dataProvider);
    }
  }

  protected updateConfig() {
    this.chartData.categoryAxis = this.config.xAxis;
    this.chartData.categoryField = this.config.xAxis.name;
    this.chartData.graphType = this.config.type;
    this.chartData.updateGraphQueries(this.config.queries);
  }
}

export class LineConfig extends ItemConfig {

  constructor(title: string,
    size: string,
    queries: LineQuery[],
    public xAxis: Xaxis,
    public type:string) {
    super(title, queries, size);
  }
}

export class LineQuery extends Query {
  constructor(text, name,
    public color: string,
    public chart: QueryChartConfig) {
    super(text, name);
  }
}

export class QueryChartConfig {
  // each query needs its own yvalue field name, otherwise, charts can't distinguish them, i guess
  public outY: string;
  constructor(public queryId, public xfield: string, public yfield = null) {
    if (!xfield)
      throw new ReferenceError("Must provide an xfield name");
    this.outY = "y_" + queryId;
  }

  public translate(rows: Object[], targetX: string): Object {
    let ret = {};
    console.log("Converting rows:", rows);
    rows.forEach(kv => {
      console.log("Converting row:", kv);
      let x = kv[this.xfield];
      if (!x) {
        console.log("Row is missing value for x-coordinate:", this.xfield);
        return;
      }

      // we have a yfield, life is good
      let yfield = null;
      if (this.yfield) {
        yfield = this.yfield;
      } else {
        // no yfield, use the first, non-xfield column we find
        for (var key in kv) {
          if (key === this.xfield) {
            continue;
          }
          yfield = key;
          break;
        }
        if (yfield === null) {
          throw new ReferenceError("No y-axis value found!");
        }
      }

      let self = this;
      let xfield = targetX ? targetX : self.xfield;
      console.log("Got fields. x:", xfield, "y:", yfield);
      let value = kv[yfield];
      let val = {};
      val[self.outY] = value;
      if (ret[x]) {
        console.log("Overwriting key: ", ret[x], "with value:", val);
      }
      ret[x] = val;
    });
    return ret;
  }
}

export class Xaxis {
  // public boldPeriodBeginning = false;
  public gridAlpha = 0;
  public minPeriod = "mm"

  constructor(public name: string, public parseDates: boolean = true, public color: string, public axisColor: string) { };
}

class ChartData {

  public dataProvider = [];
  public graphType:string;
  public graphs: GraphInfo[];
  public categoryAxis: Xaxis = new Xaxis("xfield", false, "white", "white");
  public categoryField;
  public chartCursor: UserCursor = new UserCursor();
  public export = {
    enabled: true
  };
  public dataDateFormat = 'DD MMMM YYYY JJ NN SS QQ';
  public creditsPosition = 'bottom-right';
  // public zoomOutButton = {
  //   backgroundColor: '#fff',
  //   backgroundAlpha: 1
  // };
  // public zoomOutText = 'zoom out';
  public type = 'serial';
  public theme = 'blur';
  public marginTop = 15;
  public marginRight = 15;
  public responsive = {
    'enabled': true
  };

  public valueAxes = [{
    axisColor: "#ffffff",
    color: "#ffffff",
    graphAlpha: 0,
    minVerticalGap: 50
  }];

  private queries: LineQuery[];
  private dataInternal: Object;

  constructor(public pathToImages) { }

  // Update the data provider with new data
  // see the DEMO_DATA for the format of the data, but basically, {queryId: [{x:val, y:val}]}
  public data(data: Object): void {
    console.log("Setting data internal");
    this.dataInternal = data;
    // didn't get any data, be done early
    if (!data) {
      console.log("no data recieved");
      return;
    }
    // parse the results according to the current queries we have

    if (!this.queries) {
      console.log("no queries to go with data");
      return;
    }

    let newProvider = {};
    let xaxis = this.categoryAxis.name;
    this.queries.forEach(query => {
      let id = query.chart.queryId;
      let rows = <Object[]>data[id];
      if (!rows) {
        console.log("No rows recieved for query:", query);
        return;
      }

      console.log("Converting rows for query:", query, "Rows:", rows);
      // translate the rows into <xvalue>: {yname: yvalue}
      let converted = query.chart.translate(rows, xaxis);
      console.log("Got converted row:", converted);

      // add all the converted rows into the newprovider
      for (var key in converted) {
        let adds = converted[key];
        let val = newProvider[key]
        if (val) {
          for (var valuekey in adds) {
            val[valuekey] = adds[valuekey];
          }
        } else {
          newProvider[key] = adds;
        }
      }
    });

    // convert the newprovider into the expected format:
    //  [{xaxis: xvalue, yaxis1: yvalue1, yaxis2: yvalue2...}]
    let out = [];
    for (var xvalue in newProvider) {
      let add = newProvider[xvalue];
      var d = new Date(parseInt(xvalue));
      // parse the date into the expected format so we can send it 'cleanly'
      add[xaxis] = AmCharts.formatDate(d, this.dataDateFormat);
      out.push(add);
    }
    console.log("Providing data:", out);
    this.dataProvider = out;
  }

  // updateGraphs gets called by amChart.. and we don't want to do that.
  public updateGraphQueries(queries: LineQuery[]): void {
    this.queries = queries;
    // convert queries to graph infos
    this.graphs = queries.map(query => {
      return new GraphInfo(query.chart.queryId, query.color, query.chart.outY, this.graphType);
    });
    this.data(this.dataInternal);
  }
}

class UserCursor {
  public categoryBalloonDateFormat = 'MM YYYY';
  public categoryBalloonColor = '#4285F4';
  public categoryBalloonAlpha = 0.7;
  public cursorAlpha = 0;
  public valueLineEnabled = true;
  public valueLineBalloonEnabled = true;
  public valueLineAlpha = 0.5;
}

export class GraphInfo {
  public bullet: string = 'none';
  public useLineColorForBulletBorder: boolean = true;
  public lineThickness: number = 1;
  public negativeLineColor: string = "red";
  public fillAlphas: number = 1;
  public fillColorsField: string = 'lineColor';

  constructor(public id: string, public lineColor: string, public valueField: string, public type:string = "smoothedLine") { };
}
