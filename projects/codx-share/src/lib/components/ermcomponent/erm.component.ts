
import { Injectable, Injector, Input } from '@angular/core';
import { environment } from "src/environments/environment";
import { ActivatedRoute, Router } from '@angular/router';
import { ApiHttpService, CacheService } from 'codx-core';

@Injectable()
export abstract class ErmComponent {
  private route: ActivatedRoute;
  protected router: Router;
  protected env = environment;
  protected api: ApiHttpService;
  protected cache: CacheService;
  @Input() funcId: string;
  @Input() entityName: string;
  @Input() entityPer: string;
  @Input() gridViewName: string;
  @Input() predicate: string;
  @Input() dataValue: string;
  @Input() parentField: string;
  @Input() parentValue: string;
  @Input() defaultField: string;
  @Input() defaultValue: string;
  function: any;

  constructor(injector: Injector) {
    this.route = injector.get(ActivatedRoute);
    this.api = injector.get(ApiHttpService);
    this.cache = injector.get(CacheService);

    this.funcId = this.route.snapshot.params.id;
    if (this.funcId) {
      this.cache.functionList(this.funcId).subscribe(f => {
        if (f) {
          this.function = f;
          this.entityName = f.entityName;
          this.entityPer = f.entityName;
          this.gridViewName = f.gridViewName;
          this.predicate = f.predicate;
          this.dataValue = f.dataValue;

          if (!this.gridViewName) {
            const arr = this.entityName.split('_');
            this.gridViewName = 'grv_' + (arr.length > 0 ? arr[1] : arr[0]);
          }
        }
      });
    }
  }
}

