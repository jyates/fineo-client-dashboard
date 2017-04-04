import { ErrorDataService, Result } from "./error.data.service";

export class DataPager {

  private start: number;
  private end: number;

  private page: Page = null;
  private pages: Array<Page> = [];

  constructor(private service: ErrorDataService, private columns:Array<any>, private table:string) { }

  public reload(): Promise<Result> {
    console.log("DataPager: reload");
    return this.setRange(this.start, this.end);
  }

  public setRange(start: number, end: number): Promise<Result> {
    console.log("DataPager: setRange:", start, ",", end);
    this.start = start;
    this.end = end;
    this.pages = []; // clear the current set of pages
    let range = <string>(this.getRange(this.start, this.end));
    return this.doRead(range);
  }

  public getNextPage(): Promise<Result> {
    console.log("DataPager: getNextPage. current page:", JSON.stringify(this.page));
    let range = <string>(this.getRange(this.page.end, this.end));
    return this.doRead(range);
  }

  private doRead(range: string): Promise<Result> {
    return this.service.read("SELECT "+this.getColumns()+" FROM "+this.table+" " + range + " LIMIT 500").then(result => {
      // skip if we didn't get any rows
      if (result.data && result.data.length === 0) {
        console.log("Skipping updating page - no data recieved");
        return result;
      }

      // data is expected to be sorted by timestamp
      // track the start/ end of the range, so we can get further pages a necessary
      let data = result.data;
      this.page = new Page(data[0]["timestamp"], data[data.length - 1]["timestamp"]);
      this.pages.push(this.page);
      return result;
    });
  }

  private getColumns(): string{
    return ['type', 'stage', 'event', 'message', 'handled_timestamp'].join(", ");
  }

  private getRange(start: number, end: number): String {
    console.log("Looking for for range:", new Date(start), " to ", new Date(end));
    // just the stages we can currently search
    var tsRange = " WHERE (stage = 'raw' OR stage = 'staged') AND (type = 'error' OR type = 'malformed') AND "
    // and the timerange we have to be within
    tsRange += `\`timestamp\` BETWEEN ${this.start} AND ${this.end}`;
    // but we can also limit based on the year, month, day and hour columns
    let dateStart = new Date(start);
    let dateEnd = new Date(end);
    tsRange += this.andRange("year", dateStart.getUTCFullYear(), dateEnd.getUTCFullYear());
    tsRange += this.andRange("month", dateStart.getUTCMonth(), dateEnd.getUTCMonth());
    tsRange += this.andRange("day", dateStart.getUTCDay(), dateEnd.getUTCDay());
    tsRange += this.andRange("hour", dateStart.getUTCHours(), dateEnd.getUTCHours());
    return tsRange;
  }

  private andRange(field: string, start: number, end: number) {
    let prefix = ` AND (CAST(\`${field}\` AS INT)`
    if (start === end) {
      return `${prefix} = ${start})`
    }
    return `${prefix} BETWEEN ${start} AND ${end})`;
  }
}

class Page {
  constructor(public start: number, public end: number) { }
}