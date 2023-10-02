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
  UIComponent
} from 'codx-core';
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { groupBy } from '../../../utils';
import { IAcctTran } from '../../salesinvoices/interfaces/IAcctTran.interface';
import { CashtransfersService } from '../cashtransfers.service';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';

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

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private cashTransferService: CashtransfersService
  ) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
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
  onClickMF(e, data): void {
    this.cashTransferService.onClickMF(
      e,
      data,
      this.functionName,
      this.formModel,
      this.dataService
    );
  }

  onShowLessClick(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
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
  //#endregion
}
