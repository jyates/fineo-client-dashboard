import { Injectable } from '@angular/core';

@Injectable()
export class DataUploadService {

  public stream(content:string):any{
  }

  public batchS3(file:string):any{
    console.log("submitting s3 file: "+file);
  }

  public batchLocal(file:string):any{
    console.log("submitting local file: "+file);
  }
}