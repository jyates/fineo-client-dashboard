import {Component, ViewEncapsulation, ViewChild, Input, EventEmitter} from '@angular/core';

@Component({
  selector: 'package-card',
  styles: [require('./package.scss')],
  template: require('./package.html'),
  encapsulation: ViewEncapsulation.None,
  outputs: ['selectEvent']
})
export class Package {
  @Input() title:String;
  @Input() info:String;
  @Input() price:String;
  @Input() enterprise:boolean = false;
  @Input() selected:Function;

  public selectEvent = new EventEmitter();

  public select():void{
    console.log("Selecting ", this.title)
    this.selectEvent.next(this.title);
  }
}