import { Injectable } from '@angular/core';

@Injectable()
export class SchemaService {

  schema_infos = {
    "1234": {
      fields: [
        {
          name: "timestamp",
          aliases: ["ts"],
          type: "long",
          formats: ["uuuu-MM-dd hh:mm:ss @ UTC"]
        },
        {
          name: "cpu",
          aliases: ["cpu_usage"],
          type: "double"
        }
      ]
    },
    "5555": {
      fields: [
        {
          name: "timestamp",
          aliases: ["ts", "time"],
          type: "long",
          formats: ["uuuu-MM-dd hh:mm:ss @ UTC"]
        },
        {
          name: "memory",
          aliases: ["memory_usage", "mem"],
          type: "integer"
        },
        {
          name: "energy",
          aliases: [],
          type: "varchar"
        }
      ]
    }
  }

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
    return this.schema_infos[id];
  }
}