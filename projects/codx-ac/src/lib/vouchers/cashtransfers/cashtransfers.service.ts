import { Injectable } from '@angular/core';
import { CodxService, FormModel } from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';

export const fmVATInvoice: FormModel = {
  entityName: 'AC_VATInvoices',
  formName: 'VATInvoices',
  gridViewName: 'grvVATInvoices',
  entityPer: 'AC_VATInvoices',
  currentData: {},
};

@Injectable({
  providedIn: 'root',
})
export class CashtransfersService {
  journal: IJournal;

  constructor(codxService: CodxService) {}
}
