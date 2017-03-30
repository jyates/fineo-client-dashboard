import { Injectable } from '@angular/core';

import { FineoApi, Schema } from './fineo.service';
import { RETRY_TIMEOUT } from '../environment'

@Injectable()
export class SchemaService {

  public static SCHEMA_CHANGE_STATE: string = "fineo.schema.change";

  private schemaApi: Schema;
  constructor(fineo: FineoApi) {
    this.schemaApi = fineo.schema;
  }

  private schemaProperties: SchemaMetaInfo[] = null;

  /**
  * @return a list of SchemaMetaInfo - information about the schema ids and user-visible name
  */
  public schemas(): Promise<SchemaMetaInfo[]> {
    let schemas = this;
    let p = this.schemaApi.getMetrics();
    p = p.catch(err => {
      // there are no more possible results, something is wrong in the credentials
      if (err.credentials) {
        return err;
      }
      // retry!
      console.log("Waiting", RETRY_TIMEOUT, "ms after failure. Error:", err);
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          schemas.schemaApi.getMetrics().then(result => {
            resolve(result);
          }).catch(err => {
            reject(err)
          });
        }, RETRY_TIMEOUT);
      });
    });
    return p.then(result => {
      let p = SchemaService.rejectEmptyData(result);
      if (p != null) {
        return p;
      }

      // set to an empty array to start with
      let data = result.idToMetricName;
      schemas.schemaProperties = [];
      Object.keys(data).forEach((key, index) => {
        schemas.schemaProperties.push(new SchemaMetaInfo(key, data[key]));
      });

      return schemas.schemaProperties;
    });
  }

  private static rejectEmptyData(result): Promise<any> {
    let data = result.data;
    if (data == "") {
      return Promise.reject("Failed to load data!");
    }
    return null;
  }
  // Get the schema information for the given schema id (i.e. canonical name)
  public getSchema(id: string): Promise<SchemaInfo> {
    var promise = null;
    let self = this;
    // we didn't load the data before, so load it now.
    if (this.schemaProperties == null) {
      promise = this.schemas().then((success) => {
        return self.getSchemaInfo(id);
      })
    } else {
      return this.getSchemaInfo(id);
    }
  }

  private getSchemaInfo(id: string): Promise<SchemaInfo> {
    let meta = this.getSchemaProperties(id);
    if (meta == null) {
      return Promise.reject("No schema found for id " + id);
    }
    let name = meta.name;
    return this.schemaApi.getMetric(name).then(result => {
      let p = SchemaService.rejectEmptyData(result);
      if (p != null) { return p; }

      let data = result;
      let schemaInfo = new SchemaInfo(data.name, data.aliases);
      var index = 0;
      data.fields.forEach(field => {
        index++;
        // there is always a timestamp field
        if (field.name == "timestamp") {
          schemaInfo.fields.push(new TimestampFieldInfo(index.toString(), field.name, field.aliases, field.type, data.timestampPatterns));
        } else {
          schemaInfo.fields.push(new FieldInfo(index.toString(), field.name, field.aliases, field.type));
        }
      });
      return schemaInfo;
    });
  }

  // get the 'schema-level' properties for a given schema id
  public getSchemaProperties(id: string): SchemaMetaInfo {
    let meta = this.schemaProperties.filter(elem => elem.id == id);
    if (meta.length == 0) {
      return null;
    }
    return meta[0];
  }

  /**
  * Delete the schema for the given id
  * @param id - id of the schema to delete
  */
  public delete_schema(id: string): Promise<any> {
    console.log("Deleteing schema: " + id);
    let meta = this.getSchemaProperties(id);
    if (meta == null) { return Promise.reject("No schema known with id: " + id) }
    return this.schemaApi.deleteMetric(meta.name);
  }

  /*
  * Create a schema with the given name.
  * Returns: ID (canonical name) of the schema
  */
  public createSchema(name: string, aliases: string[]): Promise<string> {
    let self = this;
    console.log("Creating schema...")
    return this.schemaApi.createMetric({
      metricName: name,
      aliases: aliases
    }).then(() => {
      return self.schemas().then(() => {
        return self.getSchemaPropertiesForName(name).id;
      });
    });
  }

  /*
  * Set the timestamp patterns for a metric
  */
  public setMetricAliasesAndTimestampPatterns(name: string, aliases: string[], patterns: string[]): Promise<any> {
    return this.schemaApi.updateMetric({
      metricName: name,
      aliases: aliases,
      timestampPatterns: patterns
    });
  }


  /*
  * Set the aliases for the timestmap field in a metric
  */
  public setTimestampAliases(name: string, aliases: string[]): Promise<any> {
    return this.schemaApi.updateField({
      metricName: name,
      fieldName: "timestamp",
      aliases: aliases
    });
  }

  public setSchemaMetadata(oldName: string, displayname: string, aliases: string[], timestampPatterns: string): Promise<any> {
    return this.schemaApi.updateMetric({
      metricName: oldName,
      newDisplayName: displayname,
      aliases: aliases,
      timestampPatterns: timestampPatterns
    });
  }

  /*
  * Add a field to a schema
  */
  public addField(schema_name: string, name: string, type: string, aliases: string[]): Promise<any> {
    let info = this.getSchemaPropertiesForName(schema_name);
    if (info == null) { return Promise.reject("No schema found with name: " + schema_name) }
    return this.schemaApi.createField({
      metricName: schema_name,
      fieldName: name,
      fieldType: type,
      aliases: aliases
    });
  }

  public getSchemaPropertiesForName(name: string): SchemaMetaInfo {
    let meta = this.schemaProperties.filter(elem => elem.name == name);
    if (meta.length == 0) {
      return null;
    }
    return meta[0];
  }

  public updateField(schema: string, field: string, displayName: string, aliases: string[]): Promise<any> {
    return this.schemaApi.updateField({
      metricName: schema,
      fieldName: field,
      newDisplayName: displayName,
      aliases: aliases
    });
  }
}

export class SchemaMetaInfo {
  constructor(public id: string,
    public name: string) { }
}

export class SchemaInfo {
  public fields: FieldInfo[] = [];
  constructor(public name: string,
    public aliases: string[]) { }
}

export class FieldInfo {
  constructor(public id: string,
    public name: string,
    public aliases: string[],
    public type: string) { }
}

export class TimestampFieldInfo extends FieldInfo {
  constructor(id, name, aliases, type, public formats: string[]) {
    super(id, name, aliases, type);
  }
}