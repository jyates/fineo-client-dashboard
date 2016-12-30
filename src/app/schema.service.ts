import { Injectable } from '@angular/core';

@Injectable()
export class SchemaService {

  schema_infos = {
    "1234": {
      fields: [
        new TimestampFieldInfo("timestamp", "timestamp", ["ts"], "long",["uuuu-MM-dd hh:mm:ss @ UTC"]),
        new FieldInfo("f12345","cpu",["cpu_usage"],"double")
      ]
    },
    "5555": {
      fields: [
          new TimestampFieldInfo("timestamp", "timestamp", ["ts", "time"], "long", ["uuuu-MM-dd hh:mm:ss @ UTC"]),
          new FieldInfo("f12346","memory",["memory_usage", "mem"], "integer"),
          new FieldInfo("f12347", "energy", [], "varchar")
      ]
    }
  }

  schema_properties = [
    new SchemaMetaInfo("1234", "server_stats", []),
    new SchemaMetaInfo("5555", "demo_schema", ["ds"])
  ]

  public schemas(){
    return this.schema_properties;
  }

  // Get the schema information for the given schema id (i.e. canonical name)
  public getSchema(id:string):Object{
    return this.schema_infos[id];
  }

  // get the 'schema-level' properties for a given schema id
  public getSchemaProperties(id:string):SchemaMetaInfo{
    return this.schema_properties.filter(elem => elem.id == id)[0];
  }

  /*
  * Create a schema with the given name.
  * Returns: ID (canonical name) of the schema
  */
  public createSchema(name:string, aliases:string[]):string {
    return "5555";
  }

  /*
  * Set the aliases for the timestmap field for a metric
  */
  public setTimestampAliases(name:string, aliases:string[]):void {

  }

  /*
  * Set the timestamp patterns for a metric
  */
  public setMetricTimestampPatterns(name:string, patterns:string[]):void {

  }

  /*
  * Add a field to a schema
  */
  public addField(schema_name:string, name:string, type:string, aliases:string[]):void {

  }
}

export class SchemaMetaInfo{
  constructor(public id:string,
              public name:string,
              public aliases:string[]){}
}

export class FieldInfo{
  constructor(public id:string,
              public name:string,
              public aliases:string[],
              public type:string){}
}

export class TimestampFieldInfo extends FieldInfo {
  constructor(id, name, aliases, type, public formats:string[]){
    super(id,name, aliases, type);
  }
}