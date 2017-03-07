import { Component, Input } from "@angular/core";

@Component({
  selector: 'small-spinner',
  styles: [`
    .spinner-hold {
      height: 71px;
    }`],
  template: `
  <div class="row">
    <div class="spinner-hold" *ngIf="(!visible && holding)">
      <span></span>
    </div>
    <div class="spinner" *ngIf="visible">
      <sk-three-bounce></sk-three-bounce>
    </div>
  </div>
  `})

export class SmallSpinnerComponent {
  @Input()
  public visible: boolean = false;
  @Input()
  public holding:boolean = true;
}