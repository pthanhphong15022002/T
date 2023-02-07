import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxSmService {
  constructor(private cache: CacheService, private api: ApiHttpService) {}

  loadData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }
  addData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }
  checkDataContactAddress(
    assemblyName: any,
    className: any,
    methodName: any,
    data: any
  ) {
    return this.api.exec(assemblyName, className, methodName, data);
  }
}
