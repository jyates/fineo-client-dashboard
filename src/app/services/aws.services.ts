import {Injectable} from "@angular/core";

declare var AWS:any;
declare var AMA:any;

@Injectable()
export class AwsUtil {
  public static firstLogin:boolean = false;
  public static runningInit:boolean = false;

  constructor() {
    AWS.config.region = 'us-east-1';
  }

  public log():void{
    console.log(AWS.config);
  }
}