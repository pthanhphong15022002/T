import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe for human readable file size representation.
 */
@Pipe({
  name: 'filesize',
})
export class FileSizePipe implements PipeTransform {
  /**
   * Transform a file size from bytes (as number) to formatted string.
   * @param value File size in bytes to transform
   * @param precision The precision of transformed filesize
   * @returns A string which represents a human readable version of file size expressed in bytes.
   */
  transform(value: any, precision: number = 1): any {
    let bytes: number = value ? value : 0;
    let exp: number = (Math.log(bytes) / Math.log(1024)) | 0;
    let result: string = (bytes / Math.pow(1024, exp)).toFixed(precision);

    result = result.replace(/\.(0)+$/, '');

    return result + ' ' + (exp == 0 ? 'B' : 'KMGTPEZY'[exp - 1] + 'B');
  }
}
