import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, ButtonModel, DialogModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { JournalService } from '../../journals/journals.service';
import { PaymentOrderAddComponent } from './payment-order-add/payment-order-add.component';

@Component({
  selector: 'lib-payment-order',
  templateUrl: './payment-order.component.html',
  styleUrls: ['./payment-order.component.css','../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOrderComponent extends UIComponent {
  //#region Constructor
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới

  views: Array<ViewModel> = []; // model view
  headerText: any; //? tên tiêu đề truyền cho form thêm mới
  itemSelected: any; //? data của view danh sách chi tiết khi được chọn
  dataCategory: any; //? data của category
  dataDefault: any; //? data default của phiếu
  button: ButtonModel = {
    //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  };
  optionSidebar: DialogModel = new DialogModel();
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private journalService: JournalService
  ) {
    super(inject);
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {}

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.headerText = res?.defaultName; //? lấy tên chứng từ (Phiếu chi)
        }
      });

    this.views = [
      {
        type: ViewType.listdetail, //? thiết lập view danh sách chi tiết
        active: true,
        sameData: true,
        model: {
          template: this.templateDetailLeft,
          panelRightRef: this.templateDetailRight,
          collapsed: true,
          widthLeft:'25%'
          //separatorSize:3
        },
      },
      {
        type: ViewType.list, //? thiết lập view danh sách
        active: true,
        sameData: true,
        model: {
          template: this.listTemplate,
        },
      },
      {
        type: ViewType.grid, //? thiết lập view lưới
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event
  /**
   * * Hàm xử lí click toolbar
   * @param event
   */
  toolbarClick(event) {
    switch (event.id) {
      case 'btnAdd':
        this.addNewVoucher(); //? thêm mới chứng từ
        break;
    }
  }

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

  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event
   * @returns
   */
  onSelectedItem(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        this.itemSelected = event?.data;
        this.detectorRef.detectChanges();
      }
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
          if (this.dataDefault == null) this.dataDefault = { ...res };
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            dataDefault: { ...res }, //?  data của cashpayment
          };
          let dialog = this.callfc.openForm(
            PaymentOrderAddComponent,
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
   * *Hàm chỉnh sửa tài khoản
   * @param e 
   * @param dataEdit 
   */
  editVoucher(dataEdit) {
    if (dataEdit) this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .subscribe((res: any) => {
        if (res) {
          res.isEdit = true;
          let data = {
            headerText: this.headerText,
            dataDefault:{...res},
          };
          let dialog = this.callfc.openForm(
            PaymentOrderAddComponent,
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
    this.view.dataService.dataSelected = dataCopy;
    this.view.dataService
      .copy()
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
                  dataDefault: { ...datas }, //?  data của cashpayment
                };
                let dialog = this.callfc.openForm(
                  PaymentOrderAddComponent,
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
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data
   * @param reportID
   * @param reportType
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {

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
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (element.functionID == 'WSAC010101' || element.functionID == 'WSAC010102' || element.functionID == 'WSAC010103') {
            element.isbookmark = true;
          }else{
            element.isbookmark = false;
          }
        }
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
  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync', [
      data,
      action,
    ]);
  }
  //#endregion Function

}
