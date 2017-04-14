import { DataReadService } from '../../services'

/**
* Light wrapper around the data service for testability
*/
export class DashboardDataService {

  constructor(private dataService: DataReadService, private data: any = null) { }

  public read(sql: string): Promise<any> {
    if (this.data) {
      return Promise.resolve(this.data);
    }
    return this.dataService.read(sql);
  }
}