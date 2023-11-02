import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { AnimationModel, ProgressBar } from '@syncfusion/ej2-angular-progressbar';
import { AuthStore, ButtonModel, DataRequest, DialogModel, FormModel, NotificationsService, PageLink, PageTitleService, SidebarModel, TenantStore, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { CashreceiptsAddComponent } from './cashreceipts-add/cashreceipts-add.component';
import { JournalService } from '../../journals/journals.service';

@Component({
  selector: 'lib-cashreceipts',
  templateUrl: './cashreceipts.component.html',
  styleUrls: ['./cashreceipts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashreceiptsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
  @ViewChild('elementTabDetail') elementTabDetail: TabComponent; //? element object các tab detail (hạch toán,thông tin hóa đơn,hóa đơn GTGT)
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
          this.detectorRef.detectChanges();
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
      case 'ACT040104':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT040105':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT040103':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT040106':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT040107':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT040108':
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
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
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
            CashreceiptsAddComponent,
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
        res.isEdit = true;
        let data = {
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res }, //?  data của cashpayment
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
          legalName: this.legalName, //? tên company
        };
        let dialog = this.callfc.openSide(
          CashreceiptsAddComponent,
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
    this.view.dataService.dataSelected = dataCopy;
    this.view.dataService
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
                  legalName: this.legalName, //? tên company
                };
                let dialog = this.callfc.openSide(
                  CashreceiptsAddComponent,
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
    this.view.dataService.delete([dataDelete], true).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {});
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
    this.acService.changeMFCashReceipt(event,data,type,this.journal,this.view.formModel);
    // let arrBookmark = event.filter(
    //   // danh sách các morefunction
    //   (x: { functionID: string }) =>
    //     x.functionID == 'ACT040106' || // MF ghi sổ (PT)
    //     x.functionID == 'ACT042905' || // MF ghi sổ (UNC)
    //     x.functionID == 'ACT040104' || // MF gửi duyệt (PT)
    //     x.functionID == 'ACT042903' || // MF gửi duyệt (UNC)
    //     x.functionID == 'ACT040105' || // MF hủy yêu cầu duyệt (PT)
    //     x.functionID == 'ACT042904' || // MF hủy yêu cầu duyệt (UNC)
    //     x.functionID == 'ACT040107' || // Mf khôi phục (PT)
    //     x.functionID == 'ACT042906' || // Mf khôi phục (UNC)
    //     x.functionID == 'ACT042901' || // Mf chuyển tiền điện tử
    //     x.functionID == 'ACT040108' || // Mf in (PT)
    //     x.functionID == 'ACT042907' || // Mf in (UNC)
    //     x.functionID == 'ACT040103' || // MF kiểm tra tính hợp lệ (PT)
    //     x.functionID == 'ACT042902'    // MF kiểm tra tính hợp lệ (UNC)
    // );
    // if (arrBookmark.length > 0) {
    //   if (type == 'viewgrid') {
    //     arrBookmark.forEach((element) => {
    //       element.isbookmark = false;
    //     });
    //   }
    //   switch (data?.status) {
    //     case '7':
    //       arrBookmark.forEach((element) => {
    //         if ((element.functionID == 'ACT040103' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042902' || element.functionID == 'ACT042907')) {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '1':
    //       if (this.journal.approvalControl == '0') {
    //         arrBookmark.forEach((element) => {
    //           if ((element.functionID == 'ACT040106' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
    //             element.disabled = false;
    //           } else {
    //             element.disabled = true;
    //           }
    //         });
    //       } else {
    //         arrBookmark.forEach((element) => {
    //           if ((element.functionID == 'ACT040104' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042903' || element.functionID == 'ACT042907')) {
    //             element.disabled = false;
    //           } else {
    //             element.disabled = true;
    //           }
    //         });
    //       }
    //       break;
    //     case '3':
    //       arrBookmark.forEach((element) => {
    //         if ((element.functionID == 'ACT040105' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042904' || element.functionID == 'ACT042907')) {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '5':
    //       arrBookmark.forEach((element) => {
    //         if ((element.functionID == 'ACT040106' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '6':
    //       arrBookmark.forEach((element) => {
    //         if ((element.functionID == 'ACT040107' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042906' || element.functionID == 'ACT042907')) {
    //           element.disabled = false;
    //         } else {
    //           element.disabled = true;
    //         }
    //       });
    //       break;
    //     case '9':
    //       arrBookmark.forEach((element) => {
    //         if ((element.functionID == 'ACT040106' || element.functionID == 'ACT040108') || (element.functionID == 'ACT042905' || element.functionID == 'ACT042907')) {
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
                    this.itemSelected = res.update.data;
                    this.detectorRef.detectChanges();
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
                this.itemSelected = res.update.data;
                this.detectorRef.detectChanges();
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
      .exec('AC', 'CashReceiptsBusiness', 'ValidateVourcherAsync', [data.recID])
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
      .exec('AC', 'CashReceiptsBusiness', 'PostVourcherAsync', [data.recID])
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
      .exec('AC', 'CashReceiptsBusiness', 'UnPostVourcherAsync', [data.recID])
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
          this.journal = res[0]; // data journal
          this.hideFields = res[1]; // array field ẩn từ sổ nhật kí
          this.detectorRef.detectChanges();
        }
      });
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data:any,action: any = '') {
    return this.api.exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      action
    ]);
  }

  /**
   * *Hàm in chứng từ (xử lí cho MF In)
   * @param data 
   * @param reportID 
   * @param reportType 
   */
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    let params = {
      Recs:data?.recID,
    }
    this.shareService.printReport(reportID,reportType,params,this.view?.formModel);    
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
}
