import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DashboardDataService } from '../dashboard.component'
import { ItemConfig, Query, CardConfig } from './index'

/**
* Display the dashboard item type and manage getting refreshes of the data
*/
@Component({
  selector: 'dashboard-card',
  styleUrls: ['./dashboard.card.scss'],
  templateUrl: './dashboard.card.html'
})
export class DashboardCard implements OnInit {

  private FIVE_MINS_MILLIS: number = 5000;
  private done: boolean = false;

  @Input()
  public config: ItemConfig;
  @Input()
  public type: string;

  @Input()
  public card:CardConfig = new CardConfig();
  @Input()
  public noRefresh: boolean = false;
  @Input()
  public data: any;

  constructor(private dataService: DashboardDataService) {
  }

  ngOnInit() {
    // only load data if there is no data
    if (!this.data) {
      this.loadData();
    }
  }

  private loadData(): Promise<any> {
    // execute each of the queries
    let results = [];
    this.config.queries.forEach(query => {
      results.push(this.dataService.read(query.text));
    });

    // don't set the results if we are done
    if (this.done) {
      return;
    }

    let result = Promise.all(results);
    // after setting the results, trigger the background wait
    result.then(successArray => {
      this.data = successArray;
    }).then(r => this.loadMoreData());
  }

  /*
  * Background task that loads more data after waiting a pre-configured amount of time.
  */
  private loadMoreData() {
    if (this.noRefresh) {
      return;
    }

    setTimeout(() => {
      // unless we are done, in which case, don't do anything
      if (this.done) {
        return;
      }
      this.loadData();
    }, this.FIVE_MINS_MILLIS)
  }

  // pass through the delete/edit events from the underlying card
  @Output()
  public deleteEvent = new EventEmitter();
  @Output()
  public editEvent = new EventEmitter();
  public handleDelete(event): void {
    this.done = true;
    this.deleteEvent.next(event);
  }
  public handleEdit(event): void {
    this.done = true;
    this.editEvent.next(event);
  }
}
