import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SalesInvoiceService {
  constructor(private api: ApiHttpService) {}

  deleteLinesByTransID(transId: string): void {
    this.api
      .exec('SM', 'SalesInvoicesLinesBusiness', 'DeleteByTransIDAsync', transId)
      .pipe(tap((t) => console.log(t)))
      .subscribe();
  }
}
