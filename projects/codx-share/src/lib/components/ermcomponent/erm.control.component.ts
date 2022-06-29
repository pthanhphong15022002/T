import { Component, Injector } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { environment } from "src/environments/environment";
//import { AppInjector } from './app-injector';

@Component({
  selector: 'app-erm',
  template: ``,
  styleUrls: []
})
export abstract class ErmControlComponent {
  protected env = environment;
  protected api: ApiHttpService;

  constructor(injector: Injector) {
    this.api = injector.get(ApiHttpService);
  }
}

