import { Injectable } from '@angular/core';
import { ViewsComponent } from 'codx-core';

@Injectable({
  providedIn: 'any',
})
export class DynamicSettingService {
  view!: ViewsComponent;
  setting: any = {};
  constructor() {}
}
