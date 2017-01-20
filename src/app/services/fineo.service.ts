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
  static BATCH_URL  = "https://mo2n9uyzo4.execute-api.us-east-1.amazonaws.com/prod";
  static META_URL   = "https://q5zrhiqdx4.execute-api.us-east-1.amazonaws.com/prod";

  public data:Data;
  public schema:Schema;
  public meta:Metadata;

  constructor(@Inject(UserLoginService) private users:UserLoginService) {
     this.data = new Data(this.users);
     this.schema = new Schema(this.users);
     this.meta = new Metadata(this.users);
  }

  public setApiKey(key:string):void{
    this.data.setApiKey(key);
    this.schema.setApiKey(key);
    this.meta.setApiKey(key);
  }
}

class BaseExec {

  protected api:Api;
  public endpoint:string;
  public pathComponent:string;

  constructor(protected users:UserLoginService,
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

  setApiKey(key:string){
    this.api.apiKey = key;
  }
}

interface WithApiGatewayClient{
  doWithClient(apiGatewayClient):void;
}

export class Metadata extends BaseExec {
  constructor(users:UserLoginService){
    super(users, FineoApi.META_URL);
  }

  // user metadata
  // -------------
  public getApiKey():Promise<any>{
    // skip using an api key for this - we are getting the api key!
    let opts = new FineoRequestOptions();
     opts.skipApiKey = true;
      return this.api.doGet("/meta/user", {
        // ewww, way to far into objects here... but its way easier
        "username": this.users.cognitoUtil.getCurrentUser().getUsername()
      }, opts);
   }

  // devices
  // -------
  public createDevice():Promise<any>{
    // have to include some content in the body ("some":"body"), otherwise the request gets converted into
    // Content-Type:text/plain;charset=UTF-8, which breaks the application/json API expectation.
    return this.api.doPut("/meta/device", {"s":"b"});
  }

  public deleteDevice(id:string):Promise<any> {
     return this.api.doDelete("/meta/device", {
       id: id
     });
   }

   public getDeviceInfo(id:string):Promise<any>{
    return this.api.doGet("/meta/device", {deviceId: id});
   }

  public getDeviceIds():Promise<any> {
    return this.api.doGet("/meta/devices");
  }

  public updateDevice(id:string, description:string):Promise<any>{
    return this.api.doPatch("/meta/device", {
      id:id,
     description: description
    });
  }

  // device key(s)
  // -------------
  public getDeviceKeys(id:string):Promise<any>{
    return this.api.doGet("/meta/device/key")
  }

  public createKey(id:string):Promise<any>{
    return this.api.doPut("/meta/device/key",{
      id: id
    });
  }

  public deleteKey(id:string, keyId:string):Promise<any>{
    return this.api.doDelete("/meta/device/key",{
      id: id,
      key: keyId
    });
  }
}

export class Data {

  public batch:Batch;
  public stream:Stream;
  constructor(users:UserLoginService){
    this.batch = new Batch(users);
    this.stream = new Stream(users)
  }

  public setApiKey(key:string){
    this.batch.setApiKey(key);
    this.stream.setApiKey(key);
  }
}

export class Stream extends BaseExec {

  constructor(users: UserLoginService){
    super(users, FineoApi.STREAM_URL);
  }

  public send(events:Object):Promise<any>{
    return this.api.doPut("/stream/events", events);  
  }  
}

export class Batch extends BaseExec {

  constructor(users: UserLoginService){
    super(users, FineoApi.BATCH_URL);
  }

  public batch(fileName:string, body:Object):Promise<any>{
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
    return this.api.doGet("/schema");
  }

  public updateParentSchemaInfo(body:Object):Promise<any>{
    return this.api.doPatch("/schema", body); 
  }

  public getMetrics():Promise<any>{
    return this.api.doGet("/schema/metrics");
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
  public createField(body:Object): Promise<any>{
    console.log("Attempting to create field with request: "+JSON.stringify(body));
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
    console.log("Attempting to update field with request: "+JSON.stringify(body));
    return this.api.doPatch("/schema/field", body);
  }

  // FIELD deletes are NOT supported
}

class FineoRequestOptions{
  public skipApiKey:boolean = false;
  constructor(){}
}

class Api {
  public apiKey:string = null;
  constructor(private exec:BaseExec){
  }

  public doPut(ending: string, body:Object):Promise<any>{
    return this.sendBody("put", ending, body);
  }

  public doPost(ending: string, body:Object):Promise<any>{
    return this.sendBody("post", ending, body);
  }

  public doPatch(ending:string, body:Object):Promise<any>{
    return this.sendBody("patch", ending, body);
  }

  public doDelete( ending:string, body?:Object, queries?:Object):Promise<any>{
    return this.sendBody("delete", ending, body, queries);
  }

  public doGet(ending: string, queries?:Object, options?:FineoRequestOptions):Promise<any>{
    if(queries === undefined || queries == null){ queries = {}; }
    var request = {
      verb: 'get'.toUpperCase(),
      path: this.exec.pathComponent + ending,
      headers: {},
      queryParams: queries,
      body: {},
    }
    return this.doCall(request, options);
  }

  private sendBody(method:string, path:string, body?:Object, queries?:Object):Promise<any>{
    if(body === undefined || body == null){body = {}};
    if(queries === undefined || queries == null){ queries = {}; }
    var request = {
      verb: method.toUpperCase(),
      path: this.exec.pathComponent + path,
      headers: {},
      queryParams: queries,
      body: body
    }
    return this.doCall(request);
  }

  private doCall(request:Object, options?:FineoRequestOptions):Promise<any>{
    let api = this;
    return new Promise(function(resolve, reject) {
      api.exec.makeCall({
        doWithClient:function(apiGatewayClient){
          let promise = null;
          if(options != null && options.skipApiKey){
            console.log("Skipping api key lookup.");
            promise = Promise.resolve("");
          }else{
            promise = api.ensureApiKey();
          }
          promise.then(function(apikey){
            let response = apiGatewayClient.makeRequest(request, 'AWS_IAM', {}, apikey);
            response.then(result =>{
                    // handle the internal request. It may be that we got a 200 response, but
                    // the deployed function is actually returning an error message (e.g function
                    // was WAY wrong configured).
                      let data = result.data;
                      if (data === undefined) {
                        resolve({});
                      }
                      else if(data.errorMessage != undefined) {
                        console.log("rejecting result - it has an error message!")
                        reject(data);
                      } else{
                        resolve(data);
                      }
                    }).catch(error => reject({
                      request: request,
                      error: error
                    }));
          }).catch(err =>{
            console.log("Failed loading the api key! -- ", JSON.stringify(err));
            reject(err);
          });
        }
      });
    });
  }

  private ensureApiKey():Promise<string>{
    return new Promise((resolve, reject) =>{
      if(this.apiKey != null){
        resolve(this.apiKey);
      } else {
        reject("Missing API Key!");
      }
    });
  }
}