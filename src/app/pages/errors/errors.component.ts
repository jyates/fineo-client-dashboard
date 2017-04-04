import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';

import { Ng2TableModule } from 'ng2-table/ng2-table';
import { ErrorDataService, Result } from "./error.data.service";
import { DataPager } from './data.paging';
import { DataMassage } from './data.massage';
import { DropdownDirective, DatePickerComponent } from 'ng2-bootstrap';

@Component({
  selector: 'errors',
  styleUrls: ['./errors.scss'],
  templateUrl: './errors.html'
})
export class Errors {

  @ViewChild('dropdownGroup') dropdown: DropdownDirective;
  @ViewChild('datepickerStart') customDateComponentStart: DatePickerComponent;
  @ViewChild('datepickerEnd') customDateComponentEnd: DatePickerComponent;

  public ranges: Array<string> = ["all", "30s", "5m", "1hr", "6h", "1d", "1w"];

  // fixed, for now
  private columns: Array<any> = [
    { title: 'Timestamp', name: 'ts_display', sort: 'desc', className: 'ts-col' },
    { title: 'Type', name: 'type' , className: 'type-col'},
    { title: 'Stage', name: 'stage' , className: 'stage-col'},
    { title: 'Message', name: 'message', className: 'message-col' },
    { title: 'Event', name: 'event', className: 'event-col'}
  ];

  // of the range we want to support
  private start: number;
  private end: number;

  // configuration of the table
  public pager: PageManager;
  public maxSize: number = 5;
  public config: any = {
    columns: this.columns,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
    className: ['table-striped', 'table-bordered'],
    loading: false
  };

  public custom: any = {
    start: new Date(),
    end: new Date(),
    showWeeks: false
  }

  constructor(service: ErrorDataService, private ref: ChangeDetectorRef) {
    this.start = 0;
    this.end = Date.now()
    let columns = this.columns.map(col => {
      return col.name
    });
    this.pager = new PageManager(new DataPager(service, columns, "errors.stream"), this.config, () => { ref.detectChanges() });
    this.reloadData();
  }

  public reloadData(): void {
    this.pager.reloadData(this.start, this.end);
  }

  public ngOnInit(): void {
    // this.pager.onChangeTable(this.config);
  }

  /**
  * Fixed set of possible time ranges for time
  */
  public applyRangeFilter(time: string): void {
    console.log("Applying range: ", time);
    // cancel any custom range we have
    this.cancelRange();

    // figure out how far back we need to go
    let now = Date.now();
    var inc = now;
    switch (time) {
      case 'all':
        break;
      case '30s':
        inc = 30000;
        break;
      case '5m':
        inc = 300000;
        break;
      case '1h':
        inc = 3600000;
        break;
      case '6h':
        inc = 21600000;
        break;
      case '1w':
        inc = 604800000;
        break;
    }
    this.setRange(now - inc, now);
  }

  private setRange(start: number, end: number): void {
    console.log("Setting time range to [", new Date(start), ",", new Date(end), "]");
    this.start = start;
    this.end = end;
    this.reloadData();
  }

  /**
   * Get a custom range of date from the user via modal
   */
  public customRange(): void {
    console.log("Setting a custom range...")
    this.dropdown.show()
  }

  public confirmRange(): void {
    let start = this.custom.start.getTime();
    let end = this.custom.end.getTime();
    if (end < start) {
      alert("Start time must come before end time!");
      return;
    }
    this.setRange(start, end);
    this.dropdown.hide();
  }

  public cancelRange(): void {
    this.custom.start = new Date();
    this.custom.end = new Date();
    this.dropdown.hide();
    // TODO get this to adjust the actual UI calendar to the start/end time.
    this.customDateComponentStart.writeValue(this.custom.start);
    this.customDateComponentEnd.writeValue(this.custom.end);
  }

  public onCellClick(data: any): any {
    console.log(data);
  }
}

// simple proxy object so we can get rid of errors in PageManager
class TableConfig {
  public filtering;
  public sorting;
  public columns: Array<any>;
  public loading: boolean = false;
}


class PageManager {
  private massage: DataMassage = new DataMassage();
  public page: number = 1;
  public itemsPerPage: number = 10;
  public numPages: number = 1;
  // actual data that the table displays
  public rows: Array<any> = [];
  // total length of the displayed data
  public length: number;

  // all the data that we currently have loaded
  private data: Array<any> = [];
  private morePages: boolean = true;

  constructor(private service: DataPager, private config: TableConfig, private onChange: (this: void) => void) { }

  public reloadData(start: number, end: number): void {
    let self = this;
    this.config.loading = true;
    this.morePages = true;
    this.service.setRange(start, end);
    this.service.getNextPage().then(result => {
      this.data = self.massage.apply(result.data);
      // didn't get any data, so don't try and load more pages
      if (this.data.length == 0) {
        console.log("Didn't get any data from load, skipping looking for more pages");
        this.morePages = false;
      }
      console.log("set data, triggering update table");
      this.onChangeTable(this.config);
    }).catch(err => {
      this.config.loading = false;
      if (err.credentials) {
        console.log("Failed to load credentials:", err);
        return;
      }
      let content = JSON.stringify(err);
      console.log("Failed to complete error read request!", content);
      alert("Failed to read error data! Please send console output to help@fineo.io\n" + content);
    })
  }

  /**
  * Some sort of table change occured. Therefore we should:
  *  1. apply the filter
  *  2. sort the data
  *  3. select the page.
  * If we don't have any more data (or less than a full page) ask for the next big page of the data from the data
  * service. It assumed (for now) that we keep all the data pages in memory... this won't work forever. #startup
  */
  public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
    console.log("Table Change! Config: ", config, "Page: ", page);
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    let output = page ? this.changePage(page, sortedData) : sortedData;
    this.numPages = sortedData.length / this.itemsPerPage;
    // clone all the rows into the output array.
    this.rows = [];
    output.forEach(elem => {
      this.rows.push(elem);
    });
    this.length = sortedData.length;

    // no more changes, as far as we know...
    this.config.loading = false;

    // load the next page if we:
    //  a. have less than a full page of items
    //  b. are on the last page
    //  c. its not a reload (that covers all rows)
    let shouldLoad = (this.length < this.itemsPerPage) || (this.page >= this.numPages)
    console.log("More pages: ", this.morePages);
    console.log("Length:", this.length, ", itemsPerPage", this.itemsPerPage, ", this.page:", this.page, "numpages: ", this.numPages);
    if (shouldLoad && this.morePages) {
      // add a marker that we are doing some more loading for that last row
      this.config.loading = true;
      this.rows.push({
        ts_display: "Loading",
        type: "more",
        stage: "rows",
        message: "...",
        event: ""
      });


      // do the actual next page load
      this.service.getNextPage().then(result => {
        this.config.loading = false;
        if (result.data && result.data.length > 0) {
          this.data = this.data.concat(this.massage.apply(result.data));
        } else {
          // no more pages!
          this.morePages = false;
          console.log("No more pages for current query!");
        }
        return result;
      }).then(result => {
        console.log("updating the current page");
        this.onChangeTable(this.config, page);
      }).catch(err => {
        this.rows.pop();// remove the loading row
        this.config.loading = false;
        console.log("Failed to complete next page read request!", JSON.stringify(err));
        alert("Failed to complete next page read request! Please send console output to help@fineo.io");
      });
    }

    // avoid breaking with "Expression has changed after it was checked" error when paging and filtering.
    // see https://github.com/valor-software/ng2-table/issues/397
    this.onChange();
  }

  public changePage(page: any, data: Array<any> = this.data): Array<any> {
    this.page = page.page;
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort && columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    console.log("Sorting on: ", columnName);
    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      let pv = this.value(previous, columnName);
      let cv = this.value(current, columnName)
      if (pv > cv) {
        return sort === 'desc' ? -1 : 1;
      } else if (pv < cv) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  private value(row, column) {
    if (column === 'ts_display') {
      column = "timestamp"
    }
    return row[column];
  }

  public changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.config.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    // no filtering or an empty filter string
    if (!config.filtering || config.filtering.filterString === "") {
      console.log("Skipping filtering!")
      return filteredData.filter(item => true);
    }


    // if we just wanted to show a single column, we could use something like this
    // if (config.filtering.columnName) {
    //   return filteredData.filter((item: any) =>
    //     item[config.filtering.columnName].match(this.config.filtering.filterString));
    // }

    console.log("Filterting on string:", this.config.filtering.filterString);
    let tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.config.columns.forEach((column: any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }
}