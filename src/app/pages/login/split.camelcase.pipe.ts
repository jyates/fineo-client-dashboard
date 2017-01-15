import { Pipe, PipeTransform } from '@angular/core';
/*
 * Simplified stringify for when you have a circular reference
 */
@Pipe({name: 'splitcamelcase'})
export class SplitCamelCase implements PipeTransform {
  transform(value: string): string {
    return value
        // add a space before uppercase letters
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function(str) {
          return str.toUpperCase();
        });
  }
}
