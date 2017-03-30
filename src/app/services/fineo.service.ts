import { Injectable, Inject } from "@angular/core";
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { UserService, WithUserCredentials } from './user.service'

import { GlobalState } from '../global.state'
import { environment } from '../environment'

// declare var apigClientFactory:any;
declare var apiGateway: any;

@Injectable()
export class FineoApi {

  public data: Data;
  public schema: Schema;
  public meta: Metadata;
  private lookup: MetaLookup;

  constructor( @Inject(UserService) private users: UserService,
    @Inject(GlobalState) private _state: GlobalState) {
    this.lookup = new MetaLookup(this.users, this._state);
    this.meta = new Metadata(this.users, this.lookup);
    this.data = new Data(this.users, this.lookup);
    this.schema = new Schema(this.users, this.lookup);

    // any changes to the API KEY we track and update
    this._state.subscribe(UserService.API_KEY_STATE, (key) => {
      this.setApiKey(key);
    });
  }

  public setApiKey(key: string): void {
    console.log("Setting api key in fineo api:", key);
    this.data.setApiKey(key);
    this.schema.setApiKey(key);
    this.meta.setApiKey(key);
    this.lookup.setApiKey(key);
  }
}

const APPL_JSON: string = 'application/json';

class BaseExec {

  protected api: Api;
  public endpoint: string;
  public pathComponent: string;
  private url: string;

  constructor(protected users: UserService,
    path: string,
    protected lookup: MetaLookup) {
    this.url = environment.urls.api + path;
    this.api = new Api(this, lookup);
    // extract endpoint and path from url
    this.endpoint = /(^https?:\/\/[^\/]+)/g.exec(this.url)[1];
    this.pathComponent = this.url.substring(this.endpoint.length);
  }

  public makeCall(func: WithApiGatewayClient) {
    let exec = this;
    this.users.withCredentials({
      with: function(access: string, secret: string, session: string) {
        // setup signing the request
        var sigV4ClientConfig = {
          accessKey: access,
          secretKey: secret,
          sessionToken: session,
          serviceName: 'execute-api',
          region: 'us-east-1',
          endpoint: exec.endpoint,
          defaultContentType: APPL_JSON,
          defaultAcceptType: APPL_JSON
        };

        var simpleHttpClientConfig = {
          endpoint: exec.endpoint,
          defaultContentType: APPL_JSON,
          defaultAcceptType: APPL_JSON
        };

        // now we have a client
        var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
        func.doWithClient(apiGatewayClient);
      },
      fail: function(reason) {
        func.failBeforeClient(reason);
      }
    });
  }

  setApiKey(key: string) {
    this.api.apiKey = key;
  }
}

interface WithApiGatewayClient {
  doWithClient(apiGatewayClient): void;
  failBeforeClient(error): void;
}

class MetaLookup extends BaseExec {

  constructor(users: UserService, private state: GlobalState) {
    super(users, environment.urls.meta, null);
  }

  public getApiKey(): Promise<any> {
    // skip using an api key for this - we are getting the api key!
    let opts = new FineoRequestOptions();
    opts.skipApiKey = true;
    return this.api.doGet("/meta/user", {
      "username": this.users.getUserName()
    }, opts).then(result => {
      console.log("got key result:", JSON.stringify(result))
      let key = result.apiKey;
      this.state.notifyDataChanged(UserService.API_KEY_STATE, key);
      return key;
    });
  }
}

export class Metadata extends BaseExec {
  constructor(users: UserService, lookup: MetaLookup) {
    super(users, environment.urls.meta, lookup);
  }

  // user metadata
  // -------------
  public getApiKey(): Promise<any> {
    return this.lookup.getApiKey();
  }

  // devices
  // -------
  public createDevice(): Promise<any> {
    // have to include some content in the body ("some":"body"), otherwise the request gets converted into
    // Content-Type:text/plain;charset=UTF-8, which breaks the application/json API expectation.
    return this.api.doPut("/meta/device", { "s": "b" });
  }

  public deleteDevice(id: string): Promise<any> {
    return this.api.doDelete("/meta/device", {
      deviceId: id
    });
  }

  public getDeviceInfo(id: string): Promise<any> {
    return this.api.doGet("/meta/device", { deviceId: id });
  }

  public getDeviceIds(): Promise<any> {
    return this.api.doGet("/meta/devices");
  }

  public updateDevice(id: string, description: string): Promise<any> {
    return this.api.doPatch("/meta/device", {
      deviceId: id,
      description: description
    });
  }

  // device key(s)
  // -------------
  public getDeviceKeys(id: string): Promise<any> {
    return this.api.doGet("/meta/device/key", { deviceId: id });
  }

  public createKey(id: string): Promise<any> {
    return this.api.doPut("/meta/device/key", {
      id: id
    });
  }

  public deleteKey(id: string, keyId: string): Promise<any> {
    return this.api.doDelete("/meta/device/key", {
      id: id,
      key: keyId
    });
  }
}

export class Data {

  public batch: Batch;
  public stream: Stream;
  constructor(users: UserService, lookup: MetaLookup) {
    this.batch = new Batch(users, lookup);
    this.stream = new Stream(users, lookup)
  }

  public setApiKey(key: string) {
    this.batch.setApiKey(key);
    this.stream.setApiKey(key);
  }
}

export class Stream extends BaseExec {

  constructor(users: UserService, lookup: MetaLookup) {
    super(users, environment.urls.stream, lookup);
  }

  public send(events: Object): Promise<any> {
    return this.api.doPut("/stream/events", events);
  }
}

export class Batch extends BaseExec {

  constructor(users: UserService, lookup: MetaLookup) {
    super(users, environment.urls.batch, lookup);
  }

  public batch(fileName: string, body: Object): Promise<any> {
    return this.api.doPut("/batch/upload/data/" + fileName, body);
  }

  public batchS3(file: string): Promise<any> {
    let obj = {
      "filePath": file
    };
    return this.api.doPost("/batch/upload/file", obj);
  }
}

export class Schema extends BaseExec {

  constructor(users: UserService, lookup: MetaLookup) {
    super(users, environment.urls.schema, lookup);
  }

  public getParentSchemaInfo(): Promise<any> {
    return this.api.doGet("/schema");
  }

  public updateParentSchemaInfo(body: Object): Promise<any> {
    return this.api.doPatch("/schema", body);
  }

  public getMetrics(): Promise<any> {
    return this.api.doGet("/schema/metrics");
  }

  // Metric
  //--------
  // CREATE
  public createMetric(body: Object): Promise<any> {
    return this.api.doPost("/schema/metric", body);
  }

  // READ
  public getMetric(metricName: string): Promise<any> {
    return this.api.doGet("/schema/metric", {
      'metricName': [metricName]
    });
  }

  // UPDATE
  public updateMetric(body: Object): Promise<any> {
    return this.api.doPatch("/schema/metric", body);
  }

  // DELETE
  public deleteMetric(metricName: String): Promise<any> {
    return this.api.doDelete("/schema/metric", { "metricName": [metricName] });
  }

  // Field
  //--------

  // CREATE
  public createField(body: Object): Promise<any> {
    console.log("Attempting to create field with request: " + JSON.stringify(body));
    return this.api.doPost("/schema/field", body);
  }

  // READ
  public getField(metricName: string, fieldName: string): Promise<any> {
    return this.api.doGet("/schema/field", {
      'metric': [metricName],
      'field': [fieldName]
    });
  }

  // UPDATE
  public updateField(body: Object): Promise<any> {
    console.log("Attempting to update field with request: " + JSON.stringify(body));
    return this.api.doPatch("/schema/field", body);
  }

  // FIELD deletes are NOT supported
}

class FineoRequestOptions {
  public skipApiKey: boolean = false;
  constructor() { }
}

class Api {
  public apiKey: string = null;
  constructor(private exec: BaseExec, private lookup: MetaLookup) {
  }

  public doPut(ending: string, body: Object): Promise<any> {
    return this.sendBody("put", ending, body);
  }

  public doPost(ending: string, body: Object): Promise<any> {
    return this.sendBody("post", ending, body);
  }

  public doPatch(ending: string, body: Object): Promise<any> {
    return this.sendBody("patch", ending, body);
  }

  public doDelete(ending: string, body?: Object, queries?: Object): Promise<any> {
    return this.sendBody("delete", ending, body, queries);
  }

  public doGet(ending: string, queries?: Object, options?: FineoRequestOptions): Promise<any> {
    if (queries === undefined || queries == null) { queries = {}; }
    var request = {
      verb: 'get'.toUpperCase(),
      path: this.exec.pathComponent + ending,
      headers: {},
      queryParams: queries,
      body: {},
    }
    return this.doCall(request, options);
  }

  private sendBody(method: string, path: string, body?: Object, queries?: Object): Promise<any> {
    if (body === undefined || body == null) { body = {} };
    if (queries === undefined || queries == null) { queries = {}; }
    var request = {
      verb: method.toUpperCase(),
      path: this.exec.pathComponent + path,
      headers: {},
      queryParams: queries,
      body: body
    }
    return this.doCall(request);
  }

  private doCall(request: Object, options?: FineoRequestOptions): Promise<any> {
    let api = this;
    return new Promise(function(resolve, reject) {
      api.exec.makeCall({
        doWithClient: function(apiGatewayClient) {
          let promise = api.ensureApiKey(options);
          promise.then(function(apikey) {
            let response = apiGatewayClient.makeRequest(request, 'AWS_IAM', {}, apikey);
            response.then(result => {
              // handle the internal request. It may be that we got a 200 response, but
              // the deployed function is actually returning an error message (e.g function
              // was WAY wrong configured).
              let data = result.data;
              if (data === undefined) {
                resolve({});
              }
              else if (data.errorMessage != undefined) {
                console.log("rejecting result - it has an error message!")
                reject(data);
              } else {
                resolve(data);
              }
            }).catch(error => {
              console.log("Error: ", error);
              reject({
                request: request,
                error: error
              });
            });
          }).catch(err => {
            console.log("Failed loading the api key! -- ", JSON.stringify(err));
            reject(err);
          });
        },
        // couldn't get client, fail!
        failBeforeClient: function(reason) {
          reject(reason);
        }
      });
    });
  }

  private ensureApiKey(options): Promise<string> {
    if (this.apiKey != null) {
      return Promise.resolve(this.apiKey);
    }

    if (options != null && options.skipApiKey) {
      console.log("Skipping api key lookup.");
      return Promise.resolve("");
    }

    return this.lookup.getApiKey();
  }
}