import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ItemConfig } from './components'
import { DashboardElement } from './dashboard.component'

/**
* Display the dashboard item type and manage getting refreshes of the data
*/
@Component({
  selector: 'edit-dashboard-item',
  templateUrl: './edit.dashboard.card.html'
})
export class EditDashboardCard implements OnInit {

  private FIVE_MINS_MILLIS: number = 5000;
  private done: boolean = false;

  @Input()
  public item: DashboardElement;
  @Input()
  public index: number;

  // data used for the underlying ui component
  public data: Object = null;
  // config to roll back to
  private origConfig: string;

  // are we in the process of doing an outside task?
  @Output()
  public cancel = new EventEmitter();
  @Output()
  public save = new EventEmitter();
  public saving: boolean = false;
  public refreshing: boolean = false;
  private loading: boolean = false;

  /**
  * Just track the original config so we can revert back. Data loading happens naturally on creating the panel
  */
  ngOnInit() {
    if (this.item) {
      this.origConfig = JSON.stringify(this.item.config);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // track the changes for the item so we can 'cancel' any edits and roll back
    console.log("got changes:", changes)
    if (changes['item']) {
      this.origConfig = JSON.stringify(this.item.config);
      this.data = null; // reset data so we don't mix between objects;
    }
  }

  private loadData(): Promise<any> {
    this.loading = true;
    let service = this.item.data;
    let config = this.item.config;
    console.log("Loading data for queries: ", config.queries);
    // execute each of the queries
    let results = [];
    config.queries.forEach(query => {
      results.push(service.read(query.text));
    });

    console.log("Requested results, waiting for response");
    // after setting the results, trigger the background wait
    return Promise.all(results)
      .then(successArray => {
        console.log("Done loading data");
        this.data = successArray;
      }).catch(err => {
        this.alertUser("Failed to refresh " + this.item.type + "!", err);
      }).then(r => {
        this.loading = false;
      });
  }

  public handleSave(config: ItemConfig) {
    console.log("saving config:", config);
    console.log("Current config:", this.item.config);
    this.item.config = config;
    this.saving = true;
    this.save.next(this.index);
  }

  public handleRefresh(config: ItemConfig) {
    console.log("Attempting to refresh data for query:", config.queries);
    // this.refreshing = true;
    this.loadData().then(result => {
      console.log("Done refreshing data");
      // this.refreshing = false;
    })
  }

  public onCancel() {
    this.item.config = JSON.parse(this.origConfig);
    this.cancel.emit(this.index);
  }

  private alertUser(msg: string, cause: any) {
    this.alertFineo(msg + "\nReason: " + JSON.stringify(cause))
  }

  private alertFineo(msg: string): void {
    alert(msg + "\nPlease contact help@fineo.io with the output of the web console.");
  }
}
