// Definition of a query to run against an AWS service
export class AwsQuery{
  public region:string = 'us-east-1';
  public service:string;
  public body: any;
  public path: string;
}