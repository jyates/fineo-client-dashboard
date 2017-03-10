import {Component, ViewChild, Input, EventEmitter} from '@angular/core';

@Component({
  selector: 'package-card',
  styleUrls: ['./package.scss'],
  templateUrl: './package.html',
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