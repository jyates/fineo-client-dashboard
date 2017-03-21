import { Injectable, Inject } from '@angular/core';

import {
  FineoApi,
  Data,
  Read
} from './fineo.service';

@Injectable()
export class DataReadService {

  private service:Read;
  constructor(@Inject(FineoApi) fineo:FineoApi){
    this.service = fineo.data.read;
  }

  public read(sql:string):Promise<any>{
    return this.service.query({request: sql});
  }
}