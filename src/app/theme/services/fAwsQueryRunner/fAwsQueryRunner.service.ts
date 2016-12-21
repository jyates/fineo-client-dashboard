// Run an AWS query. Will load credentials as necessary, if not already loaded, for the user

import {Injectable} from '@angular/core';

TOKEN = "aws_token"
EXPIRY = "aws_token_expiry"

@Injectable()
export class AwsQueryRunner{

  constructor(private state:AppState){}

  public run(query:AwsQuery):void{
      token = ensure_token()
      // actually run the query
      return exec(query, token)
  }

  public ensure_token():string{
    token = state.get(TOKEN)
      // set the token, if one isn't set yet
      if (token == null){
        token = load_token()
        state.put(TOKEN, token)
      }
      expiry = state.get(EXPIRY)
      if(expiry == null || is_expired(expiry)){
        state.put(TOKEN, null)
        return ensure_token()
      }
      return token;
  }

  // actually execute the query with the token
  private exec(query:AwsQuery, token: string):any{
    // do some aws stuff
    return null;
  }

  private is_expired(date:number):boolean{
    // check to see if the token is expired
    return true;
  }

  private load_token():string{
    // do the work to load a token from aws for the current user credentials
    token = null;  
    // set the token in the state
    state.put(TOKEN, token);

    // as well as when that token expires
    state.put(EXPIRY, 0);
    return token;
  }
}