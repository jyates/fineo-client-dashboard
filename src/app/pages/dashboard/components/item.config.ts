import {Query} from './query'

export class ItemConfig {
  public queries;
  constructor(public title: string,
    query, public size: string) {
    // support single or multi-query components
    if (typeof query == "string") {
      this.queries = [new Query(query)]
    } else {
      this.queries = query;
    }
  }
}