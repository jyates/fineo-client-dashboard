import { Pipe, PipeTransform } from '@angular/core';
/*
 * Simplified stringify for when you have a circular reference
 */
@Pipe({name: 'stringify'})
export class StringifyPipe implements PipeTransform {
  transform(value: Object): string {
    var seen = [];

    return JSON.stringify(value, function(key, val) {
       if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    });
  }
}