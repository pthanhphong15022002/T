import { Component, Injector } from '@angular/core';
import { environment } from "src/environments/environment";
import { ApiHttpService } from "@core/services";
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

