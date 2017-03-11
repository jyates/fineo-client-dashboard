import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs/Subject';

import {
  DataReadService
} from '../../../services/data.read.service';

import { ItemConfig } from '../baseComponent';

@Component({
  selector: 'create-dashboard-item-instance',
  styleUrls: ['./create.item.scss'],
  templateUrl: './create.item.html'
})
export class CreateItem implements OnInit {

  // private handleRefresh:EventEmitter<ItemConfig>;
  private type: string;
  private saving: boolean = false;
  private refreshing: boolean = false;
  public data: Object = null;

  constructor(private route: ActivatedRoute,
    private router: Router) {
    //private service: DataReadService) {
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      this.type = path_info["type"];
    });
  }

  public handleSave(config: ItemConfig) {
    this.saving = true;
    // save the configuration value
    console.log("Saving", this.type, " => ", config.title, ":", config.queries);
    new Promise((accept, reject) => {
      setTimeout(() => {
        console.log("done saving!");
        accept(null);
      }, 2000)
    }).then(success => {
      this.saving = false;
    }).catch(err => {
      this.saving = false;
      this.alertUser("Failed to save " + this.type + "[" + config.title + "]!", err);
    })
  }

  public hanldeR(config){
    this.handleRefresh(config);
  }

  public handleRefresh(config: ItemConfig) {
    this.refreshing = true;
    console.log("Attempting to refresh data for query:", config.queries);
    // save the configuration value
    new Promise((accept, reject) => {
      setTimeout(() => {
        // send a fake result
        accept([{
          "c1": 75,
          "c2": 125,
          "c3": 60,
          "c4": 30,
          "c5": 40,
          "c6": 70,
        }]);
      }, 200)
    }).then(result => {
      console.log("Got query result:", JSON.stringify(result));
      this.data = result;
      this.refreshing = false;
    }).catch(err => {
      this.refreshing = false;
      this.alertUser("Failed to refresh " + this.type + "!", err);
    })
  }

  private alertUser(msg: string, cause: any) {
    this.alertFineo(msg + "\nReason: " + JSON.stringify(cause))
  }

  private alertFineo(msg: string): void {
    alert(msg + "\nPlease contact help@fineo.io with the output of the web console.");
  }
}
