import {Injectable, Inject} from "@angular/core";
import { Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import {
  CognitoUtil
} from './cognito.service'

import {Callback} from './aws.services'


@Injectable()
export class FineoApi {

  static STREAM_URL = "https://wj7mcwo8vg.execute-api.us-east-1.amazonaws.com/prod";
  static SCHEMA_URL = "https://kgtq36jvac.execute-api.us-east-1.amazonaws.com/prod";
  static BATCH_URL =  "https://mo2n9uyzo4.execute-api.us-east-1.amazonaws.com/prod";

  private api:Api;
  public data:Data;
  public schema:Schema;

  constructor(@Inject(CognitoUtil) private cognitoUtil:CognitoUtil,
               @Inject(Http) private http: Http) {
     this.api = new Api(cognitoUtil, http);
     this.data = new Data(this.api);
  }
}

export class Data {

  public batch:Batch;
  constructor(private api:Api){
    this.batch = new Batch(this.api);
  }

  public events(...events:Object[]):Promise<any> {
     return this.api.doPut(FineoApi.STREAM_URL, "/stream/events", events);
   }
}

export class Batch {

  constructor(private api:Api){
  }

  public batch(fileName:string, body:Object){
    return this.api.doPut(FineoApi.BATCH_URL, "/batch/upload/data/"+fileName, body);
  }

  public batchS3(file:string):Promise<any>{
    let obj = {
      "filePath": file
    };
    return this.api.doPost(FineoApi.BATCH_URL, "/batch/upload/file", obj);
  }
}

export class Schema {

  constructor(private api:Api){
  }

  public getParentSchemaInfo():Promise<any>{
    return this.api.doGet(FineoApi.SCHEMA_URL, "/schema");
  }

  public updateParentSchemaInfo(body:Object):Promise<any>{
    return this.api.doPatch(FineoApi.SCHEMA_URL, "/schema", body); 
  }

  // Metric
  //--------
  // CREATE
  public createMetric(body:Object): Promise<any>{
   return this.api.doPost(FineoApi.SCHEMA_URL, "/schema/metric", body); 
  }

  // READ
  public getMetric(metricName:string):Promise<any>{
    return this.api.doGet(FineoApi.SCHEMA_URL, "/schema/metric", {
      'metricName': [metricName]
    });
  }
  
  // UPDATE
  public updateMetric(body:Object):Promise<any>{
    return this.api.doPatch(FineoApi.SCHEMA_URL, "/schema/metric", body);
  }

  // DELETE
  public deleteMetric(metricName:String):Promise<any>{
    return this.api.doDelete(FineoApi.SCHEMA_URL, "/schema/metric", {"metricName": [metricName]});
  }

  // Field
  //--------

  // CREATE
  public creatField(body:Object): Promise<any>{
   return this.api.doPost(FineoApi.SCHEMA_URL, "/schema/field", body); 
  }

  // READ
  public getField(metricName:string, fieldName:string):Promise<any>{
    return this.api.doGet(FineoApi.SCHEMA_URL, "/schema/field", {
      'metric': [metricName],
      'field': [fieldName]
    });
  }

  // UPDATE
  public updateField(body:Object):Promise<any>{
    return this.api.doPatch(FineoApi.SCHEMA_URL, "/schema/field", body);
  }

  // FIELD deletes are NOT supported
}

class Api{
  private apiKey:string = null;
  constructor(private cognitoUtil:CognitoUtil,
              private http: Http){
  }

  public doPut(base:string, ending: string, body:Object):Promise<any>{
    let api = this;
    return this.doCall(base, ending, body, {
          act: function(url, body, options){
            return api.http.put(url, body, options)
                           .map(api.jsonBody);
          }
        });
  }

 public doPost(base:string, ending: string, body:Object):Promise<any>{
    let api = this;
    return this.doCall(base, ending, body, {
          act: function(url, body, options){
            return api.http.post(url, body, options)
                           .map(api.jsonBody);
          }
        });
  }

   public doGet(base:string, ending: string, queries?:Map<string, string[]>):Promise<any>{
    let api = this;
    return this.doCall(base, ending, null, {
          act: function(url, body, options){
            api.addQueryParams(options, queries);
            return api.http.get(url, options)
                           .map(api.jsonBody);
          }
        });
  }

  public doPatch(base:string, ending:string, body:Object):Promise<any>{
    let api = this;
    return this.doCall(base, ending, null, {
          act: function(url, body, options){
            return api.http.patch(url, body, options)
                           .map(api.jsonBody);
          }
        });
  }

  public doDelete(base:string, ending:string, body?:Object, queries?:Map<string, string[]>):Promise<any>{
    let api = this;
    return this.doCall(base, ending, null, {
          act: function(url, body, options){
            api.addQueryParams(options, queries);
            // have to "trick" the query parameters to supoort a body for delete by putting it in the options
            if (body != undefined){
              options.body = body
            }
            return api.http.delete(url, options)
                           .map(api.jsonBody);
          }
        });
  }

  private addQueryParams(options, queries?:Map<string, string[]>){
    if(queries == null){
      return;
    }
    let params = new URLSearchParams();
    queries.forEach((key:string, value:string[]) => {
      value.forEach((val:string) =>{
        params.append(key, val);
      })
    });
    options.search = params;
  }

  private jsonBody(res:Response){
    let body = res.json();
    return body.data || { };
  }

  private doCall(base:string, ending: string, body:Object, obs: ObservableGen){
    let api = this;
    return new Promise((resolve, reject) =>{
        api.ensureApiKey().toPromise()
        .then((apikey) => api.call(apikey, base, ending, body, resolve, reject, obs))
        .catch((err:Response) => reject(err));
    });
  }

  private call(apikey:string, base:string, ending:string, body:Object, resolve, reject, obsg: ObservableGen):void{
    let api = this;
    this.cognitoUtil.getIdToken({
      callback: function(){
        reject("Unknown failure when getting token for user!");
      },
      sessionExpired: function(){
          reject("user session expired");
      },
      callbackWithParam: function(id){
        if(id == null){
          reject("Don't have a valid ID token!");
          return;
        }

        let obs = api.makeRequest(apikey, id, base, ending, body, obsg);
        obs.subscribe(resolve, reject);
      }
    });
  }

  private makeRequest(apikey:string, token:string, base:string, ending: string, body:Object, obs: ObservableGen):Observable<any>{
    let headers = new Headers({ 
     'Content-Type': 'application/json',
      'Authorization':  token,
      'x-api-key': apikey
    });

    var url = base +"/user/"+ending;
    let options = new RequestOptions({ headers: headers });
    return 
  }

  private ensureApiKey():Observable<string>{
    if(this.apiKey != null){
      return Observable.from(this.apiKey);
    }
    //TODO support API key look up call for user, don't just use the canary API KEY
    return Observable.from("yLi6cd4Gpi2RsX8R1tvay6JPLFTXuyTaEFRp4A1d");
  }
}

interface ObservableGen{
  act(url, body, options):Observable<any>;
}