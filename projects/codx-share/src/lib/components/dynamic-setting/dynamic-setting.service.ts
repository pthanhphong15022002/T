import { Injectable } from '@angular/core';
import { ViewsComponent } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class DynamicSettingService {
  function: any = {};
  setting: any = {};
  constructor() {}
}

export const UrlUpload: string = 'http://172.16.1.210:8011';
