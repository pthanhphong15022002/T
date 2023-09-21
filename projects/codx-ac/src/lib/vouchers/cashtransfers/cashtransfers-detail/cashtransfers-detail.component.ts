import {
  AfterViewChecked,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { groupBy, toCamelCase } from '../../../utils';
import { IAcctTran } from '../../salesinvoices/interfaces/IAcctTran.interface';
import { CashtransferAddComponent } from '../cashtransfers-add/cashtransfers-add.component';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-cashtransfers-detail',
  templateUrl: './cashtransfers-detail.component.html',
  styleUrls: ['./cashtransfers-detail.component.scss'],
})
export class CashtransfersDetailComponent
  extends UIComponent
  implements AfterViewChecked, OnChanges
{
  //#region Constructor
  @ViewChild('memo', { read: ElementRef }) memo: ElementRef<HTMLElement>;

  @Input() data: ICashTransfer;
  @Input() recID: string;
  @Input() formModel: FormModel; // required
  @Input() dataService: CRUDService; // optional

  viewData: ICashTransfer;
  overflowed: boolean = false;
  expanding: boolean = false;
  loading: boolean = false;

  lines: IAcctTran[][] = [[]];

  functionName: string;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(private injector: Injector, private acService: CodxAcService) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.functionName = toCamelCase(res.defaultName);
    });
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memo?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dataService && changes.formModel?.currentValue) {
      this.cache.gridView(this.formModel.gridViewName).subscribe((gridView) => {
        this.dataService = this.acService.createCRUDService(
          this.injector,
          this.formModel,
          'AC',
          gridView
        );
      });
    }

    if (changes.data?.currentValue) {
      this.viewData = this.data;
      this.loadDetailData();
    } else if (changes.recID?.currentValue) {
      const options = new DataRequest();
      options.entityName = 'AC_CashTranfers';
      options.predicates = 'RecID=@0';
      options.dataValues = this.recID;
      options.pageLoading = false;
      this.lines = [];
      this.loading = true;
      this.acService.loadData$('AC', options).subscribe((data: any[]) => {
        this.viewData = data[0];
        this.loadDetailData();
      });
    }
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

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  edit(data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.dataService.dataSelected = copiedData;
    this.dataService.edit(copiedData).subscribe((res: any) => {
      console.log({ res });

      let options = new SidebarModel();
      options.DataService = this.dataService;
      options.FormModel = this.formModel;
      options.isFull = true;

      this.callfc.openSide(
        CashtransferAddComponent,
        {
          formType: 'edit',
          formTitle: `${this.functionName}`,
        },
        options,
        this.formModel.funcID
      );
    });
  }

  copy(data): void {
    console.log('copy', { data });

    this.dataService.dataSelected = data;
    this.dataService.copy().subscribe((res) => {
      console.log(res);

      let options = new SidebarModel();
      options.DataService = this.dataService;
      options.FormModel = this.formModel;
      options.isFull = true;

      this.callfc.openSide(
        CashtransferAddComponent,
        {
          formType: 'add',
          formTitle: `${this.functionName}`,
        },
        options,
        this.formModel.funcID
      );
    });
  }

  delete(data): void {
    this.dataService.delete([data]).subscribe();
  }

  loadDetailData(): void {
    if (!this.viewData) {
      return;
    }

    this.expanding = false;
    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'AC',
        'AcctTransBusiness',
        'GetAccountingAsync',
        '8dfddc85-4d44-11ee-8552-d880839a843e'
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res) {
          this.lines = groupBy(res, 'entryID');
        }

        this.loading = false;
      });
  }
  //#endregion

  //#region Function
  export(data): void {
    const gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
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
