import { Injectable, Inject } from '@angular/core';

import {
  FineoApi,
  Data,
  Stream,
  Batch
} from './fineo.service';

@Injectable()
export class DataUploadService {

  private streamService:Stream;
  private batchService:Batch;
  constructor(@Inject(FineoApi) fineo:FineoApi){
    this.streamService = fineo.data.stream;
    this.batchService = fineo.data.batch;
  }

  public stream(content:string):Promise<any>{
    return this.streamService.send(content);
  }

  public batchS3(file:string):Promise<any>{
    console.log("submitting s3 file: "+file);
    return this.batchService.batchS3(file);
  }

  public batchLocal(name:string, content:string):Promise<any>{
    console.log("submitting local file: "+name);
    return this.batchService.batch(name, content);
  }
}