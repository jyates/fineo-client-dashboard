
export class DataMassage {
  public apply(data: Array<any>): Array<any>{
    //transform the timestmap into something that we understand
    let m = data.map(elem => {
      // uyeah, its really the timestamp, so make it easier
      elem['timestamp'] = elem['handled_timestamp'];
      let date = new Date(elem["timestamp"]);
      let month = this.pre(date.getMonth());
      let day = this.pre(date.getDay());
      elem['ts_display'] = `${date.getFullYear()}-${month}-${day} ${this.pre(date.getHours())}:${this.pre(date.getMinutes())}:${this.pre(date.getSeconds())}.${date.getMilliseconds()}`
      return elem;
    });
    return m;
  }

  private pre(value:number):string{
    return value < 10 ? `0${value}` : `${value}`;
  }
}