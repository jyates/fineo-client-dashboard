import { ErrorDataService, Result } from "./error.data.service";

export class DataPager {
  private static ONE_HOUR_MILLIS: number = 3600000;
  private static SIX_HOURS: number = DataPager.ONE_HOUR_MILLIS * 6;

  private start: number;
  private end: number;

  private page: Page = null;
  private pages: Array<Page> = [];

  constructor(private service: ErrorDataService, private columns: Array<any>, private table: string, private maxStepSize: number = DataPager.SIX_HOURS) { }

  public reload(): Promise<Result> {
    console.log("DataPager: reload");
    this.setRange(this.start, this.end);
    return this.getNextPage();
  }

  public setRange(start: number, end: number): void {
    console.log("DataPager: setRange:", new Date(start), ",", new Date(end));
    this.start = start;
    this.end = end;
    this.pages = []; // clear the current set of pages
    this.page = null;
  }

  /**
  * Get the next page of rows.
  * @param end_millis_first_page milliseconds for the first page of rows, if there is not a previous page to use
  */
  public getNextPage(): Promise<Result> {
    console.log("DataPager: getNextPage. current page:", JSON.stringify(this.page));
    // initially, we cover the whole query range
    var start = this.start;
    var end = this.end;
    // we have a previous page, so step to the one before
    if (this.page != null) {
      end = this.page.start;
      // it was a full page, go back only, at most, the step size
      if (this.page.full) {
        start = Math.max(start, end - this.maxStepSize);
      }
    }

    // something bad happened and the data returned from the last page is outside the range we are searching
    if (start < this.start || end > this.end || start > this.end) {
      console.log("Set range [", this.start, ",", this.end,
        "] does not encompass attempted query range: [", start, ",", end,
        "]. Done getting data. Returning empty");
      return Promise.resolve({ data: [] });
    }

    return this.doRead(start, end);
  }

  private doRead(start, end): Promise<Result> {
    let range = <string>(this.getRange(start, end));
    if (range == null) {
      return Promise.resolve({ data: [] });
    }
    return this.service.read("SELECT " + this.getColumns() + " FROM " + this.table + " " + range + " LIMIT 500").then(result => {
      // skip if we didn't get any rows
      if (!result.data || result.data.length === 0) {
        console.log("Skipping updating page - no data recieved");
        result.more_pages = this.checkDone(end);
        return result;
      }

      // data is expected to be sorted by timestamp
      // track the start/ end of the range, so we can get further pages as necessary
      let data = result.data;
      let page_start = data[0]["handled_timestamp"];
      let page_end = data[data.length - 1]["handled_timestamp"];
      // if we have less than the max number of rows, then we are definitely at the limit
      let full_page = data.length >= 500;
      if (!full_page) {
        console.log("Less than max, page covers entire time range.");
        page_start = start;
        page_end = end;
      }
      this.page = new Page(page_start, page_end, full_page);
      console.log("Adding page: ", new Date(this.page.start), ",", new Date(this.page.end), "full: ", full_page);
      this.pages.push(this.page);
      return result;
    });
  }

  private checkDone(request_end: number) {
    return request_end >= this.end;
  }

  private getColumns(): string {
    return ['type', 'stage', 'event', 'message', 'handled_timestamp'].join(", ");
  }

  private getRange(start: number, end: number): String {
    if (end === 0) {
      return null;
    }
    let dateStart = new Date(start);
    let dateEnd = new Date(end);
    console.log("Looking for for range:", dateStart, " to ", dateEnd);
    // just the stages we can currently search
    var tsRange = " WHERE (stage = 'raw' OR stage = 'staged') AND (type = 'error' OR type = 'malformed') AND "
    // and the timerange we have to be within
    tsRange += `\`handled_timestamp\` BETWEEN ${this.start} AND ${this.end}`;
    // but we can also limit based on the year, month, day and hour columns, which hels cut down overhead
    let sYear = dateStart.getUTCFullYear();
    let eYear = dateEnd.getFullYear();
    tsRange += this.andRange("year", sYear, eYear);
    if (sYear === eYear) {
      // months start from 0
      let sMonth = dateStart.getUTCMonth() +1;
      let eMonth = dateEnd.getUTCMonth() +1;
      tsRange += this.andRange("month", sMonth, eMonth);
      if (sMonth === eMonth) {
        // dates start at 1
        let sDay = dateStart.getUTCDate(); // hint: day() gets the day of the week
        let eDay = dateEnd.getUTCDate();
        tsRange += this.andRange("day", sDay, eDay);
        if (sDay === eDay) {
          tsRange += this.andRange("hour", dateStart.getUTCHours(), dateEnd.getUTCHours());
        }
      }
    }
    return tsRange;
  }

  private andRange(field: string, start: number, end: number) {
    console.log(" ", field, ":", start, ":", end);
    let prefix = ` AND (CAST(\`${field}\` AS INT)`
    if (start === end) {
      return `${prefix} = ${start})`
    }
    return `${prefix} BETWEEN ${start} AND ${end})`;
  }
}

class Page {
  constructor(public start: number, public end: number, public full: boolean) { }
}