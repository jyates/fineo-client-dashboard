import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

import { Subject } from 'rxjs/Subject';

import {
  DataReadService
} from '../../../services';

import { ItemConfig } from '../components';

@Component({
  selector: 'create-dashboard-item-instance',
  styleUrls: ['./create.item.scss'],
  templateUrl: './create.item.html'
})
export class CreateItem implements OnInit {

  private static DASHBOARD = "/pages/dashboard";

  private type: string;
  public data: Object = null;

  private refresh: Refresh;
  private refreshing: boolean = false;

  private save: Save;
  private saving: boolean = false;
  constructor(private route: ActivatedRoute,
    private router: Router,
    service: DataReadService) {
    if ('production' != ENV) {
      this.refresh = new RefreshHandlerForTesting();
      this.save = new SaveHandlerForTesting();
    } else {
      this.refresh = new RefreshHandler(service);
      this.save = new SaveHandler();
    }
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      this.type = path_info["type"];
    });

    // go to the top of the page
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  public handleSave(config: ItemConfig) {
    this.saving = true;
    // save the configuration value
    console.log("Saving", this.type, " => ", config.title, ":", config.queries);
    this.save.save(config).then(success => {
      this.saving = false;
      this.router.navigate([CreateItem.DASHBOARD]);
    }).catch(err => {
      this.saving = false;
      this.alertUser("Failed to save " + this.type + "[" + config.title + "]!", err);
    })
  }

  public handleRefresh(config: ItemConfig) {
    this.refreshing = true;
    console.log("Attempting to refresh data for query:", config.queries);
    // save the configuration value
    this.refresh.refresh(config).then(result => {
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

interface Refresh {
  refresh(config: ItemConfig): Promise<any>;
}

class RefreshHandler implements Refresh {
  constructor(private service: DataReadService) { }

  refresh(config: ItemConfig): Promise<any> {
    let results = [];
    config.queries.forEach(query => {
      results.push(this.service.read(query.text));
    });

    return Promise.all(results);
  }
}

class RefreshHandlerForTesting implements Refresh {
  public refresh(config: ItemConfig): Promise<any> {
    return new Promise((accept, reject) => {
      setTimeout(() => {
        // send a fake result
        let name = config.constructor.name;
        var result = null;
        debugger;
        if (name === "LineConfig") {
          result = // line data
            [
              // first query result
              [
                { timestamp: 1491538857000, value: 1000 },
                { timestamp: 1491800957000, value: 2000 },
                { timestamp: 1492038957000, value: 2500 },
                { timestamp: 1492049957000, value: 1250 },
                { timestamp: 1493049957000, value: 1350 }
              ],
              // second query result
              []
            ];
        }
        else if (name === "GaugeConfig") {
          result = { percent: 74, result: 125 }
        } else if (name === "DonutConfig") {
          result = {
            column1: 10,
            column2: 20,
            column3: 75,
            column4: 35,
            column5: 122
          }
        }
        accept(result);
        // end function
      }, 200)
    });
  }
}

interface Save {
  save(config: ItemConfig): Promise<any>;
}

class SaveHandler implements Save {
  save(config: ItemConfig): Promise<any> {
    return null;
  }
}

class SaveHandlerForTesting implements Save {
  save(config: ItemConfig): Promise<any> {
    return new Promise((accept, reject) => {
      setTimeout(() => {
        console.log("done saving!");
        accept(null);
      }, 2000)
    });
  }
}
