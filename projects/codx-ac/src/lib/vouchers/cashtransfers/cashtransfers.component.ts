import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  DataRequest,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { JournalService } from '../../journals/journals.service';
import { CashtransferAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { CashtransfersService } from './cashtransfers.service';
import { ICashTransfer } from './interfaces/ICashTransfer.interface';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.scss'],
})
export class CashtransfersComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  master: ICashTransfer;
  functionName: string;
  journalNo: string;

  constructor(
    injector: Injector,
    private journalService: JournalService,
    cashTransferService: CashtransfersService // don't remove this, please
  ) {
    super(injector);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.journalService.setChildLinks(this.journalNo);
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.sider,
          panelRightRef: this.content,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
    });
  }
  //#endregion

  //#region Event
  onClickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  onSelectChange(e): void {
    if (e.data?.error?.isError) {
      return;
    }

    if (e.data?.data ?? e?.data) {
      this.master = e.data?.data ?? e?.data;
    }
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'GetDefaultAsync', [
          this.journalNo,
        ])
      )
      .subscribe((res: any) => {
        let options = new SidebarModel();
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;
        options.isFull = true;
        this.callfc.openSide(
          CashtransferAddComponent,
          {
            formType: 'add',
            formTitle: this.functionName,
          },
          options,
          this.view.funcID
        );
      });
  }
  //#endregion

  //#region Method
  edit(data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res: any) => {
      console.log({ res });

      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        CashtransferAddComponent,
        {
          formType: 'edit',
          formTitle: this.functionName,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(data): void {
    console.log('copy', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      console.log(res);

      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        CashtransferAddComponent,
        {
          formType: 'add',
          formTitle: this.functionName,
        },
        options,
        this.view.funcID
      );
    });
  }

  delete(data): void {
    this.view.dataService.delete([data]).subscribe();
  }
  //#endregion

  //#region Function
  export(data): void {
    const gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    gridModel.groupFields = 'createdBy'; //Chưa có group
    this.callfc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }
  //#endregion
}
