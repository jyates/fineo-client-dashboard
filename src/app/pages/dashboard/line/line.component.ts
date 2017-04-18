import { Component, ViewChild, Input, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { BaseCardComponent, ItemConfig, Query } from '../components';
import { layoutPaths } from '../../../theme';
import { BaAmChart } from '../../../theme/components/baAmChart'

// force the line css import, which solves the /deep/ issue
import 'style-loader!./line.scss';

var nextLineId = 0;
/**
* Usually, this would be a LineHandler that does the transformation of the data. However, the data transformation
* and config changes are pretty closely tied to how the line chart gets updated. As such, we just have a single
* class for making the changes
*/
@Component({
  selector: 'line-chart-component',
  // styleUrls: ['./line.scss'],
  templateUrl: './line.html'
})
export class Line extends BaseCardComponent<LineConfig> {

  @Input()
  public id = `line-${nextLineId++}`;

  @ViewChild(BaAmChart) public chartElem: BaAmChart;

  public chartData: ChartData = new ChartData(layoutPaths.images.amChart);
  private chartReady: boolean = false;
  private pendingData: boolean = false;
  private pendingConfig: boolean = false;

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
    this.chartReady = true;
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
      if(this.pendingConfig){
        this.pendingConfig = false;
        this.pendingData = false;
        console.log("Updating chart with pending config")
        this.updateConfig();
      }
      else if (this.pendingData) {
        debugger;
        this.pendingData = false;
        console.log("Updating chart with pending data");
        this.chartElem.updateData(this.chartData.dataProvider);
      }
    });
  }

  protected updateData() {
    console.log("Updating data for line chart, data:", this.data);
    this.chartData.data(this.data);
    this.updateChartData();
  }

  protected updateConfig() {
    // early exit if the chart has not been created yet
    if(!this.chartReady){
      this.pendingConfig = true;
      return;
    }
    console.log("Updating config");
    this.chartData.categoryAxis = this.config.xAxis;
    this.chartData.categoryField = this.config.xAxis.name;
    this.chartData.graphType = this.config.type;
    this.chartData.updateGraphQueries(this.config.queries);
    // make the updates to the graph
    this.chartElem.updateXaxis(this.chartData.categoryAxis);
    this.chartElem.updateGraphs(this.chartData.graphs);
    this.updateChartData();
    console.log("-- DONE Updating config --");
  }

  private updateChartData() {
    if(this.chartData.dataProvider && this.chartData.dataProvider.length > 0) {
      if (this.chartReady) {
          this.chartElem.updateData(this.chartData.dataProvider);
      } else {
        this.pendingData = true;
      }
    }
  }
}

export class LineConfig extends ItemConfig {

  constructor(title: string,
    size: string,
    queries: LineQuery[],
    public xAxis: Xaxis,
    public type: string) {
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
      // console.log("Converting row:", kv);
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
      // console.log("Got fields. x:", xfield, "y:", yfield);
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

  constructor(public name: string, public parseDates: boolean = true, public color: string, public axisColor: string, public minPeriod = 'mm') { };
}

class ChartData {

  public dataProvider;
  //  = [
  //   { date: new Date(2012, 11, 1, 1, 1, 1, 1), y_g0: 0, y_g1: 0},
  //   { date: new Date(2013, 0, 1, 1, 1, 1, 1), y_g0: 2000, y_g1: 19000 },
  // ];
  public graphType: string;
  public graphs: Array<GraphInfo> ;
  // = [
  //   {
  //     valueField: "y_g0",
  //     bullet : "none",
  //     useLineColorForBulletBorder: false,
  //     lineThickness: 1,
  //     negativeLineColor: "red",
  //     fillAlphas: 1,
  //     fillColorsField: 'lineColor',
  //     id: "g0",
  //     lineColor: "rgba(255, 255, 255, 0.3)",
  //     type: "smoothedLine"
  //   }
  // ]
  public categoryAxis: Xaxis = new Xaxis("date", false, "white", "white");
  public categoryField = "date";
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
    console.log("Setting data internal: ", data);
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
      // we do the date parsing, which matches the xaxis parseDate option, used when we pass a 'Date' object
      var d = new Date(parseInt(xvalue));
      add[xaxis] = d;
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
    console.log("Updating data for current queries from current internal data:", this.dataInternal);
    this.data(this.dataInternal);
  }
}

class UserCursor {
  public categoryBalloonDateFormat = 'DD MMMM YYYY JJ NN SS QQ';
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

  constructor(public id: string, public lineColor: string, public valueField: string, public type: string = "smoothedLine") { };
}
