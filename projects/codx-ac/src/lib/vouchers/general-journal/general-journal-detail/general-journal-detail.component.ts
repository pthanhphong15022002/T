import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange } from '@angular/core';
import { AuthStore, NotificationsService, SidebarModel, TenantStore, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { GeneralJournalAddComponent } from '../general-journal-add/general-journal-add.component';

@Component({
  selector: 'general-journal-detail',
  templateUrl: './general-journal-detail.component.html',
  styleUrls: ['./general-journal-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralJournalDetailComponent extends UIComponent {

  //#region Constructor
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() baseCurr: any;
  @Input() journal: any;
  @Input() headerText: any;
  @Input() hideFields: any;
  @Input() dataDefault: any;
  @Input() gridViewSetup: any;
  itemSelected: any;
  dataCategory: any; //? data của category
  optionSidebar: SidebarModel = new SidebarModel();
  tabInfo: TabModel[] = [
    //? danh sách các tab footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    //this.userID = this.authStore.get().userID; //? get tên user đăng nhập
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.dataService;
    this.optionSidebar.FormModel = this.formModel;
    this.optionSidebar.isFull = true;
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnChanges(value: SimpleChange) {
    this.getDataDetail(this.dataItem, this.recID);
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event
  /**
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMoreFunction(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteVoucher(data); //? xóa chứng từ
        break;
      case 'SYS03':
        this.editVoucher(data); //? sửa chứng từ
        break;
      case 'SYS04':
        this.copyVoucher(data); //? sao chép chứng từ
        break;
      case 'SYS002':
        //this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT090102':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT090103':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT090101':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT090104':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT090105':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT090106':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    this.dataService.dataSelected = dataEdit;
    this.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        let data = {
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res }, //?  data của cashpayment
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
        };
        let dialog = this.callfc.openSide(
          GeneralJournalAddComponent,
          data,
          this.optionSidebar,
          this.funcID
        );
      });
  }

  /**
   * *Hàm sao chép chứng từ
   * @param event
   * @param dataCopy : data chứng từ sao chép
   */
  copyVoucher(dataCopy) {
    this.dataService.dataSelected = dataCopy;
    this.dataService
      .copy((o) => this.setDefault(dataCopy, 'copy'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res != null) {
          res.isCopy = true;
          let datas = { ...res };
          this.view.dataService
            .saveAs(datas)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                let data = {
                  headerText: this.headerText, //? tiêu đề voucher
                  journal: { ...this.journal }, //?  data journal
                  oData: { ...datas }, //?  data của cashpayment
                  hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
                  baseCurr: this.baseCurr, //?  đồng tiền hạch toán
                };
                let dialog = this.callfc.openSide(
                  GeneralJournalAddComponent,
                  data,
                  this.optionSidebar,
                  this.view.funcID
                );
                this.view.dataService
                  .add(datas)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe();
              }
            });
        }
      });
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.view?.currentView?.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  /**
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data
   */
  releaseVoucher(text: any, data: any) {
    this.acService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result: any) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              data.status = result?.returnStatus;
              this.view.dataService.updateDatas.set(data['_uuid'], data);
              this.view.dataService
                .save(null, 0, '', '', false)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res && !res.update.error) {
                    this.notification.notifyCode('AC0029', 0, text);
                  }
                });
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data
   */
  cancelReleaseVoucher(text: any, data: any) {
    this.shareService
      .codxCancel('AC', data?.recID, this.view.formModel.entityName, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          data.status = result?.returnStatus;
          this.view.dataService.updateDatas.set(data['_uuid'], data);
          this.view.dataService
            .save(null, 0, '', '', false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res && !res.update.error) {
                this.notification.notifyCode('AC0029', 0, text);
              }
            });
        } else this.notification.notifyCode(result?.msgCodeError);
      });
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    this.api
      .exec('AC', 'GeneralJournalsBusiness', 'ValidateVourcherAsync', [data.recID, text])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.dataService.update(this.itemSelected).subscribe();
          //this.getDatadetail(this.itemSelected);
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'GeneralJournalsBusiness', 'PostVourcherAsync', [data.recID, text])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.dataService.update(this.itemSelected).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'GeneralJournalsBusiness', 'UnPostVourcherAsync', [data.recID, text])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.dataService.update(this.itemSelected).subscribe();
          //this.getDatadetail(this.itemSelected);
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data
   * @param reportID
   * @param reportType
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    let params = {
      Recs: data?.recID,
    };
    this.shareService.printReport(
      reportID,
      reportType,
      params,
      this.formModel
    );
  }
  
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem, recID) {
    if (dataItem) {
      this.itemSelected = dataItem;
      this.detectorRef.detectChanges();
    }else{
      this.api
      .exec('AC', 'GeneralJournalsBusiness', 'GetDataDetailAsync', [
        dataItem,
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.detectorRef.detectChanges();
      });
    } 
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any, type: any = '') {
    this.acService.changeMFGeneralJournal(
      event,
      data,
      type,
      this.journal,
      this.formModel
    );
  }
  
  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'GeneralJournalsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      action,
    ]);
  }
  //#endregion Function

}
