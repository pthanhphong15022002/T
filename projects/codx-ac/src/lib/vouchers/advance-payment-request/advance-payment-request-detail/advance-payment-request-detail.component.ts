import { ChangeDetectionStrategy, Component, Injector, Input, SimpleChange, ViewEncapsulation } from '@angular/core';
import { AuthStore, DialogModel, NotificationsService, TenantStore, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AdvancePaymentRequestAddComponent } from '../advance-payment-request-add/advance-payment-request-add.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'advance-payment-request-detail',
  templateUrl: './advance-payment-request-detail.component.html',
  styleUrls: ['./advance-payment-request-detail.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancePaymentRequestDetailComponent extends UIComponent {
  //#region Constructor
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() headerText: any;
  @Input() gridViewSetup: any;

  itemSelected: any;
  dataCategory: any; //? data của category
  optionSidebar: DialogModel = new DialogModel();
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
    private codxCommonService: CodxCommonService,
    private notification: NotificationsService,
    private tenant: TenantStore
  ) {
    super(inject);
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.dataService;
    this.optionSidebar.FormModel = this.formModel;
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
      case 'WSAC010101':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'WSAC010102':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'WSAC010103':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm chỉnh sửa tài khoản
   * @param e 
   * @param dataEdit 
   */
  editVoucher(dataEdit) {
    if (dataEdit) this.dataService.dataSelected = dataEdit;
    this.dataService
      .edit(dataEdit)
      .subscribe((res: any) => {
        if (res) {
          res.isEdit = true;
          let data = {
            headerText: this.headerText,
            dataDefault:{...res},
          };
          let dialog = this.callfc.openForm(
            AdvancePaymentRequestAddComponent,
            '',
            null,
            null,
            '',
            data,
            '',
            this.optionSidebar
          );
          dialog.beforeClose.subscribe((res) => {
            if (res && res?.closedBy.toLowerCase() === 'escape') {
              res.cancel = true;
              return;
            }
          })
        }
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
      .copy()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res != null) {
          res.isCopy = true;
          let datas = { ...res };
          this.dataService
            .saveAs(datas)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res) {
                let data = {
                  headerText: this.headerText, //? tiêu đề voucher
                  dataDefault: { ...datas }, //?  data của cashpayment
                };
                let dialog = this.callfc.openForm(
                  AdvancePaymentRequestAddComponent,
                  '',
                  null,
                  null,
                  '',
                  data,
                  '',
                  this.optionSidebar
                );
                dialog.beforeClose.subscribe((res) => {
                  if (res && res?.closedBy.toLowerCase() === 'escape') {
                    res.cancel = true;
                    return;
                  }
                })
                this.dataService
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
    this.view.dataService
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
      .getCategoryByEntityName(this.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.codxCommonService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.formModel.entityName,
            this.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result: any) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              data.status = result?.returnStatus;
              this.dataService.updateDatas.set(data['_uuid'], data);
              this.dataService
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
    this.codxCommonService
      .codxCancel('AC', data?.recID, this.formModel.entityName, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          data.status = result?.returnStatus;
          this.dataService.updateDatas.set(data['_uuid'], data);
          this.dataService
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
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data
   * @param reportID
   * @param reportType
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    
  }
  
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem, recID) {
    this.api
      .exec('AC', 'AdvancedPaymentBusiness', 'GetDataDetailAsync', [
        dataItem,
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        console.log(this.itemSelected);
        this.detectorRef.detectChanges();
      });
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any, type: any = '') {
    let array = ['SYS02','SYS03','SYS04','WSAC010101','WSAC010102','WSAC010103'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
        if(item != null) arrBookmark.push(item);
      }
    });
    switch (data?.status) {
      case '1': //? trường hợp trạng thái là tạo mới => ẩn more hủy yêu cầu duyệt
        arrBookmark.forEach(element => {
          if (element.functionID == 'WSAC010102') {
            element.disabled = true;
          }else{
            element.disabled = false;
          }
        });
        break;
      case '3': //? trường hợp trạng thái là chờ duyệt => ẩn more gửi yêu cầu duyệt
        arrBookmark.forEach(element => {
          if (element.functionID == 'WSAC010101') {
            element.disabled = true;
          }else{
            element.disabled = false;
          }
        });
        break;
      default: //? còn lai => ẩn tất cả trừ chỉnh sửa sao chép xóa
          arrBookmark.forEach((element) => {
            if (element.functionID == 'SYS02' || element.functionID == 'SYS03' || element.functionID == 'SYS04') {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        break;
    }
  }
}
