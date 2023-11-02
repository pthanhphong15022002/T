import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  TenantStore,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import {
  CodxAcService,
  fmPurchaseInvoicesLines,
} from '../../../codx-ac.service';
import { groupBy } from '../../../utils';
import { PurchaseInvoiceService } from '../purchaseinvoices.service';
import { Subject, reduce, takeUntil } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { PurchaseinvoicesAddComponent } from '../purchaseinvoices-add/purchaseinvoices-add.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';

@Component({
  selector: 'purchaseinvoices-detail',
  templateUrl: './purchaseinvoices-detail.component.html',
  styleUrls: ['./purchaseinvoices-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseinvoicesDetailComponent extends UIComponent {
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
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)

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
    private shareService: CodxShareService,
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
    this.optionSidebar.isFull = true;
  }

  ngOnChanges(value: SimpleChange) {
    this.getDataDetail(this.dataItem, this.recID);
  }

  /**
   * *Hàm khởi tạo các tab detail
   * @param e
   * @param ele
   */
  createTab(e: any, ele: TabComponent) {
    this.showHideTab(this.itemSelected?.subType, ele);
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
        this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT060102':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT060104':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT060106':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT060103':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT060105':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT060107':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }

  //#endregion

  //#region Function
  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res:any) => {
        if (res != null) {
          res.isAdd = true;
          if (this.dataDefault == null) this.dataDefault = { ...res };
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr //?  đồng tiền hạch toán
          };
          let dialog = this.callfc.openSide(
            PurchaseinvoicesAddComponent,
            data,
            this.optionSidebar,
            this.formModel.funcID
          );
        }
      });
  }

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
          PurchaseinvoicesAddComponent,
          data,
          this.optionSidebar,
          this.formModel.funcID
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
          this.dataService
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
                  PurchaseinvoicesAddComponent,
                  data,
                  this.optionSidebar,
                  this.formModel.funcID
                );
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
    this.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValidateVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.dataService.update(res?.data).subscribe();
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
      .exec('AC', 'PurchaseInvoicesBusiness', 'PostVourcherAsync', [data.recID])
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
      .exec('AC', 'PurchaseInvoicesBusiness', 'UnPostVourcherAsync', [data.recID])
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
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data
   */
  releaseVoucher(text: any, data: any) {
    this.acService
      .getCategoryByEntityName(this.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
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
    this.shareService
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
   * *Xuất file theo template(Excel,PDF,...)
   * @param data
   */
  exportVoucher(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
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

  /**
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data
   * @param reportID
   * @param reportType
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'GetListReportByIDandType',
        [reportID, reportType]
      )
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 1) {
            this.openFormReportVoucher(data, res);
          } else if (res.length == 1) {
            window.open(
              '/' +
                this.tenant.getName() +
                '/' +
                'ac/report/detail/' +
                `${res[0].recID}`
            );
          }
        }
      });
  }

   /**
   * *Hàm mở form báo cáo
   */
   openFormReportVoucher(data: any, reportList: any) {
    var obj = {
      data: data,
      reportList: reportList,
      url: 'ac/report/detail/',
      formModel: this.view.formModel,
    };
    let opt = new DialogModel();
    var dialog = this.callfc.openForm(
      CodxListReportsComponent,
      '',
      400,
      600,
      '',
      obj,
      '',
      opt
    );
  }
  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any, type: any = '') {
    this.acService.changeMFPur(event,data,type,this.journal,this.formModel);
    // let arrBookmark = event.filter(
    //   // danh sách các morefunction
    //   (x: { functionID: string }) =>
    //     x.functionID == 'ACT060103' || // MF ghi sổ
    //     x.functionID == 'ACT060102' || // MF gửi duyệt
    //     x.functionID == 'ACT060104' || // MF hủy yêu cầu duyệt
    //     x.functionID == 'ACT060105' || // Mf khôi phục
    //     x.functionID == 'ACT060107' || // Mf in
    //     x.functionID == 'ACT060106'// MF kiểm tra tính hợp lệ
    // );
    // if (arrBookmark.length > 0) {
    //   if (type == 'viewgrid') {
    //     arrBookmark.forEach((element) => {
    //       element.isbookmark = false;
    //     });
    //   }
    //   switch (data?.status) {
    //     case '1':
    //       if (this.journal.approvalControl == '0') {
    //         arrBookmark.forEach((element) => {
    //           if (element.functionID == 'ACT060103' || element.functionID == 'ACT060107') {
    //             element.disabled = false;
    //           } else {
    //             element.disabled = true;
    //           }
    //         });
    //       } else {
    //         arrBookmark.forEach((element) => {
    //           if (element.functionID == 'ACT060102' || element.functionID == 'ACT060107') {
    //             element.disabled = false;
    //           } else {
    //             element.disabled = true;
    //           }
    //         });
    //       }
    //       break;
    //     case '3':
    //       arrBookmark.forEach((element) => {
    //         if (element.functionID == 'ACT060104' || element.functionID == 'ACT060107') {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '5':
    //       arrBookmark.forEach((element) => {
    //         if (element.functionID == 'ACT060103' || element.functionID == 'ACT060107') {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '6':
    //       arrBookmark.forEach((element) => {
    //         if (element.functionID == 'ACT060105' || element.functionID == 'ACT060107') {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '2':
    //     case '7':
    //       arrBookmark.forEach((element) => {
    //         if (element.functionID == 'ACT060106' || element.functionID == 'ACT060107') {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '9':
    //       arrBookmark.forEach((element) => {
    //         if (element.functionID == 'ACT060103' || element.functionID == 'ACT060107') {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     default:
    //       arrBookmark.forEach((element) => {
    //         element.disabled = true;
    //       });
    //       break;
    //   }
    // }
    // return;
  }
  
  /**
   * *Hàm get data chi tiết
   * @param data
   */
  getDataDetail(dataItem, recID) {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'GetDataDetailAsync', [
        dataItem,
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.itemSelected = res;
        this.showHideTab(this.itemSelected?.subType); // ẩn hiện các tab detail
        this.detectorRef.detectChanges();
      });
  }

  /**
   * *Hàm ẩn hiện các tab khi thay đổi chứng từ theo loại chứng từ
   * @param event
   * @param ele
   */
  showHideTab(type: any, ele?: TabComponent) {
    ele = this.elementTabDetail;
    if (ele) {
      ele.hideTab(0, false);
      ele.select(0);
      switch (type) {
        case '2':
          ele.hideTab(0, false);
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          break;
        case '1':
        case '3':
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          ele.hideTab(2, true);
          break;
      }
    }
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      action,
    ]);
  }

  //#endregion
}
