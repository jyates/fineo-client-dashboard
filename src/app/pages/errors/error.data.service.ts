
import { Injectable } from '@angular/core';
import { DataReadService } from '../../services/data.read.service'

@Injectable()
export class DataService {
  private readonly testing: boolean = false;

  constructor(private service: DataReadService) { }

  public read(sql: string): Promise<Result> {
    console.log("Executing query: " + sql);
    if (this.testing) {
      return this.handleTest(sql);
    }
    return this.service.read(sql).then(data => {
      return Promise.resolve(new Result(data))
    });
  }

  private handleTest(sql: string): Promise<Result> {
    let len = TEST_DATA.length
    let next = REQUEST.count;
    REQUEST.count = REQUEST.count + 1;
    var ret = [];
    if (next < len) {
      ret = TEST_DATA[next];
    }
    console.log("Getting element: ", next, "Ret:", ret);
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve(new Result(ret)) }, 3000)
    })
  }
}

export class Result {
  constructor(public data: Array<any>, public error: string = null) { }
}

const REQUEST = {
  count: 0
}
const TEST_DATA: Array<Array<any>> = [[
  {
    "handled_timestamp": 1490143301000,
    "type": "error",
    "stage": "stream",
    "message": "Some error",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301002,
    "type": "error",
    "stage": "stream",
    "message": "Some error2",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301003,
    "type": "error",
    "stage": "stream",
    "message": "Some error3",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301004,
    "type": "error",
    "stage": "stream",
    "message": "Some error4",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301005,
    "type": "error",
    "stage": "stream",
    "message": "Some error5",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301006,
    "type": "malformed",
    "stage": "stream",
    "message": "Some error",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301007,
    "type": "malformed",
    "stage": "stream",
    "message": "Some error - m1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301008,
    "type": "malformed",
    "stage": "stream",
    "message": "Some error - m2",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301009,
    "type": "malformed",
    "stage": "stream",
    "message": "Some error - m3",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301010,
    "type": "malformed",
    "stage": "stream",
    "message": "Some error - m4",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301011,
    "type": "error",
    "stage": "raw",
    "message": "Some error - r0",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301012,
    "type": "error",
    "stage": "raw",
    "message": "Some error - r1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301013,
    "type": "error",
    "stage": "raw",
    "message": " Some err  - r2",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301014,
    "type": "error",
    "stage": "raw",
    "message": " Some err - r3",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301015,
    "type": "error",
    "stage": "raw",
    "message": " Some err - r4",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301016,
    "type": "malformed",
    "stage": "raw",
    "message": "Some error - mr1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301017,
    "type": "malformed",
    "stage": "raw",
    "message": "Some error - mr1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301018,
    "type": "malformed",
    "stage": "raw",
    "message": "Some error - mr1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301019,
    "type": "malformed",
    "stage": "raw",
    "message": "Some error - m1",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301020,
    "type": "error",
    "stage": "stream",
    "message": " Some err - stream raw",
    "event": "{\"key\":\"value\"}"
  },
  // {
  //   "handled_timestamp": 1490143301021,
  //   "type": "error",
  //   "stage": "raw",
  //   "message": " Some error - raw late"
  // },
  // {
  //   "handled_timestamp": 1490143301022,
  //   "type": "malformed",
  //   "stage": "stream",
  //   "message": " Some error - malfromed late"
  // },
],
// result 2
[
  {
    "handled_timestamp": 1490143301023,
    "type": "malformed",
    "stage": "raw",
    "message": "Some error - second batch",
    "event": "{\"key\":\"value\"}"
  },
  {
    "handled_timestamp": 1490143301024,
    "type": "error",
    "stage": "stream",
    "message": " Some err - stream raw = second batch",
    "event": "{\"key\":\"value\"}"
  },
],
// result 3
[]];