import { Component, ViewEncapsulation, Input, EventEmitter } from '@angular/core';
import './gauge.loader.ts';

@Component({
  selector: 'gauge',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./gauge.scss')],
  template: require('./gauge.html'),
  outputs: ['deleteEvent', 'editEvent']
})
export class Gauge {

  @Input()
  public chart: Object;
  @Input()
  public editable: boolean = true;
  @Input()
  public deletable: boolean = true;

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
    // ["small", "medium", "large"].forEach(size => {
    //   elems["pie-chart-container-" + size] = this.chart["size"] == size
    // });
    // return elems;
    // let elemClass = []
    this.addAttributes("small", ["col-xl-3"], elems);
    this.addAttributes("medium", ["col-xl-4"], elems);
    this.addAttributes("large", ["col-xl-6"], elems);
    // switch(this.chart["size"]){
    //   case "small":
    //     elemClass = ["col-xlg-3"]// col-lg-3 col-md-6 col-sm-12 col-xs-12"
    //     break;
    //   case "medium":
    //     elemClass = ["col-xlg-6"]// col-lg-3 col-md-6 col-sm-12 col-xs-12"
    //     break;
    //   case "large":
    //     elemClass = ["col-xlg-12"]// col-lg-3 col-md-6 col-sm-12 col-xs-12"
    //     break;
    //   default:
    //     // console.log("Unknown size:", this.size,". Skipping setting gauge size");
    //     return elemClass;
    // }

    // // console.log("Setting elems on gauge", elemClass)
    // // convert into a property set that is understood & valid
    // let ret = {}
    // elemClass.forEach(clazz =>{
    //   ret[clazz] = true;
    // })
    // return ret;
    return elems;
  }

  private addAttributes(size:string, attributes:string[], to:Object){
    let enabled = this.chart["size"] == size;
    attributes.forEach(attrib =>{
      to[attrib] = enabled;
    })
    to["pie-chart-container-"+size] = enabled;
  }
  
  private getStyle() {
    switch (this.chart["size"]) {
      case "small":
        return {
          width: "35%",
          flex: "0 0 100%"
        }
      case "medium":
        return {
          width: "50%",
          flex: "0 0 100%"
        }
        break;
      case "large":
        return {
          width: "100%",
          flex: "0 0 100%"
        }
        break;
      // default:
    }
  }
}
