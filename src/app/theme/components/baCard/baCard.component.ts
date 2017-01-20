import {Component, ViewEncapsulation, ViewChild, Input, EventEmitter} from '@angular/core';

@Component({
  selector: 'ba-card',
  styles: [require('./baCard.scss')],
  template: require('./baCard.html'),
  encapsulation: ViewEncapsulation.None,
  outputs: ['deleteEvent', 'editEvent']
})
export class BaCard {
  @Input() title:String;
  @Input() baCardClass:String;
  @Input() deletable:boolean = true;
  @Input() editable:boolean = true;

  public deleteEvent = new EventEmitter();
  public editEvent = new EventEmitter();

  public editItem():void{
    this.editEvent.next(this);
  }

  public deleteItem():void{
    this.deleteEvent.next(this);
  }
}
