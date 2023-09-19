import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  PageLink,
  PageTitleService,
  SidebarModel,
  TenantStore,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CashPaymentAddComponent } from './cashpayments-add/cashpayments-add.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { Subject, takeUntil } from 'rxjs';
import { X } from '@angular/cdk/keycodes';
import { JournalService } from '../../journals/journals.service';
declare var jsBh: any;
@Component({
  selector: 'lib-cashpayments',
  templateUrl: './cashpayments.component.html',
  styleUrls: ['./cashpayments.component.css', '../../codx-ac.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
  @ViewChild('progressbarTable') progressbarTable: ProgressBar; //? progressBar của table
  headerText: any; //? tên tiêu đề truyền cho form thêm mới
  runmode: any;
  journalNo: string; //? số của sổ nhật kí
  itemSelected: any; //? data của view danh sách chi tiết khi được chọn
  userID: any; //?  tên user đăng nhập
  dataCategory: any; //? data của category
  journal: any; //? data sổ nhật kí
  baseCurr: any; //? đồng tiền hạch toán
  legalName: any; //? tên công ty
  dataDefault: any; //? data default của phiếu
  hideFields: Array<any> = []; //? array field được ẩn lấy từ journal
  button: ButtonModel = {
    //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  };
  bhLogin: boolean = false;
  optionSidebar: SidebarModel = new SidebarModel();
  bankPayID: any;
  bankNamePay: any;
  bankReceiveName: any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore,
    private journalService: JournalService,
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.userID = this.authStore.get().userID; //? get tên user đăng nhập
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr; //? get đồng tiền hạch toán
          this.legalName = res[0].legalName; //? get tên company
        }
      });
    this.router.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo; //? get số journal từ router
        
      });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.getJournal(); //? lấy data journal và các field ẩn từ sổ nhật kí
  }

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
          this.runmode = res?.runMode; //? lấy runmode
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
    this.journalService.setChildLinks(this.journalNo);

    //* thiết lập cấu hình sidebar
    this.optionSidebar.DataService = this.view.dataService;
    this.optionSidebar.FormModel = this.view.formModel;
    this.optionSidebar.isFull = true;

  }

  ngOnDestroy() {
    this.onDestroy();
  }

  //#endregion

  //#region Event

  /**
   * * Hàm click button thêm mới
   * @param event
   */
  btnAddClick(event) {
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
      case 'SYS002':
        this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT041002':
      case 'ACT042903':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT041004':
      case 'ACT042904':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT041009':
      case 'ACT042902':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT041003':
      case 'ACT042905':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT041008':
      case 'ACT042906':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT042901':
        this.call();
        break;
      case 'ACT041010':
      case 'ACT042907':
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

  //#endregion

  //#region Function

  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .subscribe((res) => {
        if (res != null) {
          if(this.dataDefault == null) this.dataDefault = {...res};
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
            legalName: this.legalName, //? tên company
          };
          let dialog = this.callfc.openSide(
            CashPaymentAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
        }
      });
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let data = {
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res }, //?  data của cashpayment
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
          legalName: this.legalName, //? tên company
        };
        let dialog = this.callfc.openSide(
          CashPaymentAddComponent,
          data,
          this.optionSidebar,
          this.view.funcID
        );
      });
  }

  /**
   * *Hàm sao chép chứng từ
   * @param event
   * @param dataCopy : data chứng từ sao chép
   */
  copyVoucher(dataCopy) {
    this.view.dataService
      .copy((o) => this.setDefault(dataCopy))
      .subscribe((res: any) => {
        if (res != null) {
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
            legalName: this.legalName, //? tên company
          };
          let dialog = this.callfc.openSide(
            CashPaymentAddComponent,
            data,
            this.optionSidebar,
            this.view.funcID
          );
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
   * *Xuất file theo template(Excel,PDF,...)
   * @param data
   */
  exportVoucher(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
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
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, data: any,type:any = '') {
    let arrBookmark = event.filter(
      // danh sách các morefunction
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // MF ghi sổ (PC)
        x.functionID == 'ACT042905' || // MF ghi sổ (UNC)
        x.functionID == 'ACT041002' || // MF gửi duyệt (PC)
        x.functionID == 'ACT042903' || // MF gửi duyệt (UNC)
        x.functionID == 'ACT041004' || // MF hủy yêu cầu duyệt (PC)
        x.functionID == 'ACT042904' || // MF hủy yêu cầu duyệt (UNC)
        x.functionID == 'ACT041008' || // Mf khôi phục (PC)
        x.functionID == 'ACT042906' || // Mf khôi phục (UNC)
        x.functionID == 'ACT042901' || // Mf chuyển tiền điện tử
        x.functionID == 'ACT041010' || // Mf in (PC)
        x.functionID == 'ACT042907' || // Mf in (UNC)
        x.functionID == 'ACT041009' || // MF kiểm tra tính hợp lệ (PC)
        x.functionID == 'ACT042902' || // MF kiểm tra tính hợp lệ (UNC)
        x.functionID == 'ACT042901' // MF chuyển tiền điện tử
    );
    if (arrBookmark.length > 0) {
      if (type == 'viewgrid') {
        arrBookmark.forEach((element) => {
          element.isbookmark = false;
        });
      }
      switch (data?.status) {
        case '7':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041009' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042902' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            arrBookmark.forEach((element) => {
              if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            arrBookmark.forEach((element) => {
              if ((element.functionID == 'ACT041002' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042903' || element.functionID == 'ACT042907') || (element.functionID == 'ACT042901' && this.view.funcID == 'ACT0429')) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '3':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041004' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042904' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041008' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042906' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          arrBookmark.forEach((element) => {
            if ((element.functionID == 'ACT041003' || element.functionID == 'ACT041010') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        default:
          arrBookmark.forEach((element) => {
            element.disabled = true;
          });
          break;
      }
    }
    return;
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
      .exec('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.view.dataService.update(this.itemSelected).subscribe();
          //this.getDatadetail(this.itemSelected);
          this.notification.notifyCode(
            'AC0029',
            0,
            text
          );
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
      .exec('AC', 'CashPaymentsBusiness', 'PostVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.view.dataService.update(this.itemSelected).subscribe();
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
      .exec('AC', 'CashPaymentsBusiness', 'UnPostVourcherAsync', [data.recID])
      .subscribe((res: any) => {
        if (res?.update) {
          this.itemSelected = res?.data;
          this.view.dataService.update(this.itemSelected).subscribe();
          //this.getDatadetail(this.itemSelected);
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm get data mặc định của chứng từ
   */
  getJournal() {
    this.api
      .exec('AC', 'ACBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.journal = res?.journal; // data journal
          this.hideFields = res?.hideFields; // array field ẩn từ sổ nhật kí
        }
      });
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
    ]);
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
      formModel:this.view.formModel
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
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Bankhub
  call() {
    jsBh.login('accNet', (o) => this.callback(o));
  }

  callback(o: any) {
    if (o) {
      this.bhLogin = true;
      localStorage.setItem('bh_tk', o);
      this.getbank();
    }
  }

  getbank() {
    this.acService
      .call_bank('banks', { bankId: '970448', requestId: Util.uid() })
      .subscribe((res) => {
        console.log(res);
      });
  }
  //#endregion
}
