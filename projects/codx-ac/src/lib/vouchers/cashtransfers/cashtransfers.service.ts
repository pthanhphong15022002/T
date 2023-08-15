import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CashTransferService {
  constructor(private api: ApiHttpService) {}

  deleteVatInvoiceByTransID(transId: string): void {
    this.api
      .exec(
        'ERM.Business.AC',
        'VATInvoicesBusiness',
        'DeleteByTransIDAsync',
        transId
      )
      .pipe(tap((t) => console.log(t)))
      .subscribe();
  }
}
