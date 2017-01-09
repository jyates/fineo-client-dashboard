import {Injectable, Inject} from "@angular/core";
import { Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import {
  UserLoginService,
  WithCredentials
} from './cognito.service'

// declare var apigClientFactory:any;
declare var apiGateway:any;

@Injectable()
export class FineoApi {

  static STREAM_URL = "https://wj7mcwo8vg.execute-api.us-east-1.amazonaws.com/prod";
  static SCHEMA_URL = "https://kgtq36jvac.execute-api.us-east-1.amazonaws.com/prod";
  static BATCH_URL =  "https://mo2n9uyzo4.execute-api.us-east-1.amazonaws.com/prod";

  private api:Api;
  public data:Data;
  public schema:Schema;

  constructor(@Inject(UserLoginService) private users:UserLoginService) {
     this.data = new Data(this.users);
     this.schema = new Schema(this.users);
  }
}

class BaseExec {

  protected api:Api;
  public endpoint:string;
  public pathComponent:string;

  constructor(private users:UserLoginService,
              private url:string){
    this.api = new Api(this);
    // extract endpoint and path from url
    this.endpoint = /(^https?:\/\/[^\/]+)/g.exec(this.url)[1];
    this.pathComponent = this.url.substring(this.endpoint.length);
  }

  public makeCall(func:WithApiGatewayClient){
    let exec = this;
    this.users.withCredentials({
      with: function(access:string, secret:string, session:string){
        // setup signing the request
        var sigV4ClientConfig = {
            accessKey: access,
            secretKey: secret,
            sessionToken: session,
            serviceName: 'execute-api',
            region: 'us-east-1',
            endpoint: exec.endpoint,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };

        var simpleHttpClientConfig = {
            endpoint: exec.endpoint,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };

        // now we have a client
        var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
        func.doWithClient(apiGatewayClient);
    }
   });
  }
}

interface WithApiGatewayClient{
  doWithClient(apiGatewayClient):void;
}

export class Data {

  public batch:Batch;
  public stream:Stream;
  constructor(users:UserLoginService){
    this.batch = new Batch(users);
    this.stream = new Stream(users)
  }

}

export class Stream extends BaseExec {

  constructor(users: UserLoginService){
    super(users, FineoApi.STREAM_URL);
  }

  public doPut(events:Object):Promise<any>{
    return this.api.doPut("/stream/events", events);  
  }  
}

export class Batch extends BaseExec {

  constructor(users: UserLoginService){
    super(users, FineoApi.BATCH_URL);
  }

  public batch(fileName:string, body:Object){
    return this.api.doPut("/batch/upload/data/"+fileName, body);
  }

  public batchS3(file:string):Promise<any>{
    let obj = {
      "filePath": file
    };
    return this.api.doPost("/batch/upload/file", obj);
  }
}

export class Schema extends BaseExec {

  constructor(users: UserLoginService){
    super(users, FineoApi.SCHEMA_URL);
  }

  public getParentSchemaInfo():Promise<any>{
    return this.api.doGet2("/schema");
  }

  public updateParentSchemaInfo(body:Object):Promise<any>{
    return this.api.doPatch("/schema", body); 
  }

  public getMetrics():Promise<any>{
    return this.api.doGet2("/schema/metrics");
  }

  // Metric
  //--------
  // CREATE
  public createMetric(body:Object): Promise<any>{
   return this.api.doPost("/schema/metric", body); 
  }

  // READ
  public getMetric(metricName:string):Promise<any>{
    return this.api.doGet("/schema/metric", {
      'metricName': [metricName]
    });
  }
  
  // UPDATE
  public updateMetric(body:Object):Promise<any>{
    return this.api.doPatch("/schema/metric", body);
  }

  // DELETE
  public deleteMetric(metricName:String):Promise<any>{
    return this.api.doDelete("/schema/metric", {"metricName": [metricName]});
  }

  // Field
  //--------

  // CREATE
  public creatField(body:Object): Promise<any>{
   return this.api.doPost("/schema/field", body); 
  }

  // READ
  public getField(metricName:string, fieldName:string):Promise<any>{
    return this.api.doGet("/schema/field", {
      'metric': [metricName],
      'field': [fieldName]
    });
  }

  // UPDATE
  public updateField(body:Object):Promise<any>{
    return this.api.doPatch("/schema/field", body);
  }

  // FIELD deletes are NOT supported
}

export class Api {
  private apiKey:string = null;
  constructor(private exec:BaseExec){
  }

  public doPut(ending: string, body:Object):Promise<any>{
    var request = {
      verb: 'put'.toUpperCase(),
      path: this.exec.pathComponent + ending,
      headers: {},
      queryParams: {},
      body: body
    }
    return this.doCall2(request);
  }

  public doGet2(ending: string, queries?:Map<string, string[]>):Promise<any>{
    if(queries === undefined || queries == null){ queries = {}; }
    var request = {
      verb: 'get'.toUpperCase(),
      path: this.exec.pathComponent + ending,
      headers: {},
      queryParams: queries,
      body: {},
    }
    return this.doCall2(request);
  }

  private doCall2(request:Object):Promise<any>{
    let api = this;
    return new Promise(function(resolve, reject) {
      api.exec.makeCall({
        doWithClient:function(apiGatewayClient){
          api.ensureApiKey()
          .then(function(apikey){
            console.log("Got client, making request!");
            let response = apiGatewayClient.makeRequest(request, 'AWS_IAM', {}, apikey);
            response.then(result => resolve(result)).catch(error => reject(error));
          }).catch(function(err:Response){
            console.log("Failed loading the aPI key! -- "+JSON.stringify(err));
            reject(err);
        });
        }
      });
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

    var url = base +"/user"+ending;
    let options = new RequestOptions({ headers: headers });
    return 
  }

  private ensureApiKey():Promise<string>{
    if(this.apiKey != null){
      return Observable.from(this.apiKey).toPromise();
    }
    //TODO support API key look up call for user, don't just use the canary API KEY
    return new Promise(function(resolve, reject){
      resolve("yLi6cd4Gpi2RsX8R1tvay6JPLFTXuyTaEFRp4A1d");
    });
  }
}