import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatEnum',
})
export class FormatEnumPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(/_/g, ' ');
  }

}
