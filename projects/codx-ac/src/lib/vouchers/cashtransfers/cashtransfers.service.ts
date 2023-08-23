import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxService, FormModel } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CashtransfersService {
  fmVATInvoice: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  fgVatInvoice: FormGroup;

  constructor(codxService: CodxService) {
    this.fgVatInvoice = codxService.buildFormGroup(
      this.fmVATInvoice.formName,
      this.fmVATInvoice.gridViewName,
      this.fmVATInvoice.entityName
    );
  }
}
