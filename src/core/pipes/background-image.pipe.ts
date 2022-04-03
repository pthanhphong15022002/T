import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FilesService } from 'codx-core';

@Pipe({
  name: 'backgroundImage'
})
export class BackgroundImagePipe implements PipeTransform {
  constructor(private fileSv: FilesService,
    private sanitizer: DomSanitizer,
    private df: ChangeDetectorRef) {

  }
  transform(value: string, data: any): any {
    if (value) {
      let json = JSON.parse(value);
      var bytes = this.fileSv.base64ToArrayBuffer(json);
      let blob = new Blob([bytes], { type: '.png' });
      let url = window.URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(`url(${url})`);
    } else {
      return data;
    }
  }

}
