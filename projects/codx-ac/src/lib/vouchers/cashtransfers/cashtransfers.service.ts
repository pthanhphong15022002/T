import { Injectable } from '@angular/core';
import { CRUDService, CallFuncService, DataRequest, FormModel, SidebarModel } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CashtransferAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { ICashTransfer } from './interfaces/ICashTransfer.interface';

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
  constructor(private callFuncService: CallFuncService) {}

  onClickMF(e: any, data: ICashTransfer, funcName: string, formModel: FormModel, dataService: CRUDService): void {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data, dataService);
        break;
      case 'SYS03':
        this.edit(data, funcName, formModel, dataService);
        break;
      case 'SYS04':
        this.copy(data, funcName, formModel, dataService);
        break;
      case 'SYS002':
        this.export(data, formModel, dataService);
        break;
    }
  }

  edit(data: ICashTransfer, funcName: string, formModel: FormModel, dataService: CRUDService): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    dataService.dataSelected = copiedData;
    dataService.edit(copiedData).subscribe((res: any) => {
      console.log({ res });

      let options = new SidebarModel();
      options.DataService = dataService;
      options.FormModel = formModel;
      options.isFull = true;

      this.callFuncService.openSide(
        CashtransferAddComponent,
        {
          formType: 'edit',
          formTitle: funcName,
        },
        options,
        formModel.funcID
      );
    });
  }

  copy(data: ICashTransfer, funcName: string, formModel: FormModel, dataService: CRUDService): void {
    console.log('copy', { data });

    dataService.dataSelected = data;
    dataService.copy().subscribe((res) => {
      console.log(res);

      let options = new SidebarModel();
      options.DataService = dataService;
      options.FormModel = formModel;
      options.isFull = true;

      this.callFuncService.openSide(
        CashtransferAddComponent,
        {
          formType: 'add',
          formTitle: funcName,
        },
        options,
        formModel.funcID
      );
    });
  }

  delete(data: ICashTransfer, dataService: CRUDService): void {
    dataService.delete([data]).subscribe();
  }

  export(data: ICashTransfer, formModel: FormModel, dataService: CRUDService): void {
    const gridModel = new DataRequest();
    gridModel.formName = formModel.formName;
    gridModel.entityName = formModel.entityName;
    gridModel.funcID = formModel.funcID;
    gridModel.gridViewName = formModel.gridViewName;
    gridModel.page = dataService.request.page;
    gridModel.pageSize = dataService.request.pageSize;
    gridModel.predicate = dataService.request.predicates;
    gridModel.dataValue = dataService.request.dataValues;
    gridModel.entityPermission = formModel.entityPer;
    gridModel.groupFields = 'createdBy'; //Chưa có group
    this.callFuncService.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }
}
