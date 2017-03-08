import {Component, ViewEncapsulation, Input, EventEmitter} from '@angular/core';
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
  public chart:Object;
  @Input()
  public editable:boolean = true;
  @Input()
  public deletable:boolean = true;

  // pass through the delete/edit events from the underlying card
  public deleteEvent = new EventEmitter();
  public editEvent = new EventEmitter();
  public handleDelete(event):void {
    this.deleteEvent.next(event);
  }

  public handleEdit(event):void{
    this.editEvent.next(event);
  }
}
