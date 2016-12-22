import { Injectable } from '@angular/core';

@Injectable()
export class SchemaService {

  public schemas(){
    return [{
      "id": "1234",
      "name": "server_stats",
      "aliases": []
    },{
      "id": "5555",
      "name": "demo-schema",
      "aliases": []
    }
    ]
  }

  // Get the schema information for the given schema id (i.e. canonical name)
  public getSchema(id:string):Object{
    return {
      id: id
    }
  }
}