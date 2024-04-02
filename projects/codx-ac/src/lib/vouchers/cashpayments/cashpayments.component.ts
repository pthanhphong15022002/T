import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CRUDService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CashPaymentAddComponent } from './cashpayments-add/cashpayments-add.component';
import {
  CodxAcService,
  fmCashPaymentsLines,
  fmCashPaymentsLinesOneAccount,
  fmJournal,
  fmSettledInvoices,
  fmVATInvoices,
} from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { NewvoucherComponent } from '../../share/add-newvoucher/newvoucher.component';
import { JournalsAddComponent } from '../../journals/journals-add/journals-add.component';
import { PopupInfoTransferComponent } from '../../share/popup-info-transfer/popup-info-transfer.component';
declare var jsBh: any;
@Component({
  selector: 'lib-cashpayments',
  templateUrl: './cashpayments.component.html',
  styleUrls: ['./cashpayments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>;
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  headerText: any;
  runmode: string = '';
  journalNo: string;
  itemSelected: any;
  userID: any;
  dataCategory: any;
  journal: any;
  baseCurr: any;
  legalName: any;
  dataDefault: any;
  hideFields: Array<any> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
      icon: 'icon-i-file-earmark-plus',
    },
  ];
  bhLogin: boolean = false;
  bankPayID: any;
  bankNamePay: any;
  bankReceiveName: any;
  predicate: string = 'JournalNo=@0';
  viewActive: number = ViewType.listdetail;
  ViewType = ViewType;
  fmCashpaymentLine: FormModel = fmCashPaymentsLines;
  fmCashpaymentLineOne: FormModel = fmCashPaymentsLinesOneAccount;
  fmSettledInvoices: FormModel = fmSettledInvoices;
  fmVATInvoices: FormModel = fmVATInvoices;
  fmJournal: FormModel = fmJournal;
  journalSV: CRUDService;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private codxCommonService: CodxCommonService,
    private shareService: CodxShareService,
    private notification: NotificationsService
  ) {
    super(inject);
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.journalSV = this.acService.createCRUDService(
      inject,
      this.fmJournal,
      'AC'
    );
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.cache.companySetting().subscribe((res: any) => {
      if (res.length > 0) {
        this.legalName = res[0].legalName;
      }
    });

    this.cache
      .viewSettingValues('ACParameters')
      .pipe(map((data) => data.filter((f) => f.category === '1')?.[0]))
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        this.baseCurr = dataValue?.BaseCurr || '';
      });

    this.router.params.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });

    this.router.data.subscribe((res: any) => {
      if (res && res['runMode'] && res['runMode'] == '1') {
        this.predicate = '';
        this.runmode = res.runMode;
      }
      this.onDestroy();
    });

    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.headerText = res?.defaultName || res?.customName;
        if (!this.runmode) this.runmode = res?.runMode;
      }
    });
    this.getJournal();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateDetailLeft,
          panelRightRef: this.templateDetailRight,
          collapsed: true,
          widthLeft: '23%',
          //separatorSize:3
        },
      },
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.listTemplate,
        },
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
      {
        type: ViewType.grid_detail,
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },

        request: { service: 'AC' },
        subModel: {
          entityName: 'AC_CashPaymentsLines',
          formName: 'CashPaymentsLines',
          gridviewName: 'grvCashPaymentsLines',
          parentField: 'TransID',
          parentNameField: 'VoucherNo',
          hideMoreFunc: true,
          request: {
            service: 'AC',
          },
          idField: 'recID',
        },
      },
    ];
    this.acService.setChildLinks();
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
        this.addNewVoucher();
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
      case 'SYS05':
        this.viewVoucher(data); //? sao chép chứng từ
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
        this.transferToBank(e.text, data); //? chuyển tiền ngân hàng điện tử
        break;
      case 'ACT041010':
      case 'ACT042907':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
      case 'ACT041013':
        this.querytransfer(data);
        break;
    }
  }

  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event
   * @returns
   */
  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }

  viewChanged(view) {
    if (view && view?.view?.type == this.viewActive) return;
    this.viewActive = view?.view?.type;
    this.detectorRef.detectChanges();
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
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
            legalName: this.legalName, //? tên company
          };
          let optionSidebar = new SidebarModel();
          optionSidebar.DataService = this.view?.dataService;
          optionSidebar.FormModel = this.view?.formModel;
          let dialog = this.callfc.openSide(
            CashPaymentAddComponent,
            data,
            optionSidebar,
            this.view.funcID
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              if (res?.event?.type === 'discard') {
                if (this.view.dataService.data.length == 0) {
                  this.itemSelected = undefined;
                  this.detectorRef.detectChanges();
                }
              }
            }
          });
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    delete dataEdit.isReadOnly;
    this.view.dataService.dataSelected = { ...dataEdit };
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        let data = {
          headerText: this.headerText,
          journal: { ...this.journal },
          oData: { ...res },
          hideFields: [...this.hideFields],
          baseCurr: this.baseCurr,
          legalName: this.legalName,
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.view?.formModel;
        let dialog = this.callfc.openSide(
          CashPaymentAddComponent,
          data,
          optionSidebar,
          this.view.funcID
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event) {
            if (res?.event?.type === 'discard') {
              if (this.view.dataService.data.length == 0) {
                this.itemSelected = undefined;
                this.detectorRef.detectChanges();
              }
            }
          }
        });
        this.onDestroy();
      });
  }

  /**
   * *Hàm sao chép chứng từ
   * @param event
   * @param dataCopy : data chứng từ sao chép
   */
  copyVoucher(dataCopy) {
    let newdataCopy = { ...dataCopy };
    if (this.journal && this.journal.assignRule == '0') {
      let data = {
        journalType: this.journal.journalType,
        journalNo: this.journalNo,
      };
      let opt = new DialogModel();
      opt.FormModel = this.view.formModel;
      let dialog = this.callfc.openForm(
        NewvoucherComponent,
        'Nhập số chứng từ mới',
        null,
        null,
        '',
        data,
        '',
        opt
      );
      dialog.closed.subscribe((res) => {
        if (res && res?.event) {
          let newvoucherNo = res?.event;
          newdataCopy.voucherNo = newvoucherNo;
          this.view.dataService
            .copy((o) => this.setDefault({ ...newdataCopy }, 'copy'))
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
                        headerText: this.headerText,
                        journal: { ...this.journal },
                        oData: { ...datas },
                        hideFields: [...this.hideFields],
                        baseCurr: this.baseCurr,
                        legalName: this.legalName,
                      };
                      let optionSidebar = new SidebarModel();
                      optionSidebar.DataService = this.view?.dataService;
                      optionSidebar.FormModel = this.view?.formModel;
                      let dialog2 = this.callfc.openSide(
                        CashPaymentAddComponent,
                        data,
                        optionSidebar,
                        this.view.funcID
                      );
                      dialog2.closed.subscribe((res) => {
                        if (res && res?.event) {
                          if (res?.event?.type === 'discard') {
                            if (this.view.dataService.data.length == 0) {
                              this.itemSelected = undefined;
                              this.detectorRef.detectChanges();
                            }
                          }
                        }
                      });
                      this.view.dataService
                        .add(datas)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe();
                    }
                  });
              }
              this.onDestroy();
            });
        }
      });
    } else {
      this.view.dataService
        .copy((o) => this.setDefault({ ...newdataCopy }, 'copy'))
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
                    headerText: this.headerText,
                    journal: { ...this.journal },
                    oData: { ...datas },
                    hideFields: [...this.hideFields],
                    baseCurr: this.baseCurr,
                    legalName: this.legalName,
                  };
                  let optionSidebar = new SidebarModel();
                  optionSidebar.DataService = this.view?.dataService;
                  optionSidebar.FormModel = this.view?.formModel;
                  let dialog2 = this.callfc.openSide(
                    CashPaymentAddComponent,
                    data,
                    optionSidebar,
                    this.view.funcID
                  );
                  dialog2.closed.subscribe((res) => {
                    if (res && res?.event) {
                      if (res?.event?.type === 'discard') {
                        if (this.view.dataService.data.length == 0) {
                          this.itemSelected = undefined;
                          this.detectorRef.detectChanges();
                        }
                      }
                    }
                  });
                  this.view.dataService
                    .add(datas)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe();
                }
              });
          }
          this.onDestroy();
        });
    }
  }

  /**
   * *Hàm xem chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  viewVoucher(dataView) {
    delete dataView.isEdit;
    dataView.isReadOnly = true;
    let data = {
      headerText: this.headerText,
      journal: { ...this.journal },
      oData: { ...dataView },
      hideFields: [...this.hideFields],
      baseCurr: this.baseCurr,
      legalName: this.legalName,
    };
    let optionSidebar = new SidebarModel();
    optionSidebar.DataService = this.view?.dataService;
    optionSidebar.FormModel = this.view?.formModel;
    let dialog = this.callfc.openSide(
      CashPaymentAddComponent,
      data,
      optionSidebar,
      this.view.funcID
    );
    dialog.closed.subscribe((res) => {});
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && !res?.error) {
          if (this.view.dataService.data.length == 0) {
            this.itemSelected = undefined;
            this.detectorRef.detectChanges();
          }
        }
        this.onDestroy();
      });
  }

  editJournal() {
    this.journalSV
      .edit(this.journal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        this.cache
          .gridViewSetup(this.fmJournal.formName, this.fmJournal.gridViewName)
          .subscribe((o) => {
            let data = {
              headerText: 'Chỉnh sửa sổ nhật kí'.toUpperCase(),
              oData: { ...res },
            };
            let option = new SidebarModel();
            option.FormModel = this.fmJournal;
            option.DataService = this.journalSV;
            option.Width = '800px';
            let dialog = this.callfc.openSide(
              JournalsAddComponent,
              data,
              option,
              this.fmJournal.funcID
            );
            dialog.closed.subscribe((res) => {
              if (res && res.event) {
                this.getJournal();
              }
            });
          });
        this.onDestroy();
      });
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
  changeMFDetail(event: any, type: any = '') {
    let data = this.view?.dataService?.dataSelected;
    if (this.runmode == '1') {
      this.shareService.changeMFApproval(event, data.unbounds);
    } else {
      this.acService.changeMFCashPayment(
        event,
        data,
        type,
        this.journal,
        this.view.formModel
      );
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
        this.codxCommonService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            '',
            '',
            '',
            null,
            JSON.stringify({ ParentID: data.journalNo })
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
                  this.onDestroy();
                });
            } else {
              this.notification.notifyCode(result?.msgCodeError);
              this.onDestroy();
            }
          });
      });
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data
   */
  cancelReleaseVoucher(text: any, data: any) {
    this.codxCommonService
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
              this.onDestroy();
            });
        } else {
          this.notification.notifyCode(result?.msgCodeError);
          this.onDestroy();
        }
      });
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'PostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'UnPostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  /**
   * *Hàm get data mặc định của chứng từ
   */
  getJournal() {
    let options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.pageLoading = false;
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.journalNo;
    this.api
      .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? []))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.journal = res[0];
      });
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      data,
      this.journalNo,
      action,
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
      Recs: data?.recID,
    };
    this.shareService.printReport(
      reportID,
      reportType,
      params,
      this.view?.formModel
    );
  }

  //#endregion

  //#region Bankhub
  /**
   * *Hàm chuyển tiền ngân hàng điện tử
   * @param text
   * @param data
   */
  transferToBank(text, data) {
    const t = this;
    this.getBankCode(data).subscribe((res: any) => {
      if (res) {
        if (res.bankCode == '970422' || res.bankCode == '970448') {
          t.checkLogin(res.bankCode, 'test', data, (o) => {
            if (o) {
              let tk = jsBh.decodeCookie('bankhub');
              this.api
                .execSv<any>(
                  'AC',
                  'AC',
                  'CashPaymentsBusiness',
                  'TransferToBankAsync',
                  [data.recID, tk, 'test']
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res && !res?.error) {
                    data.status = '8';
                    this.view.dataService.update(data).subscribe();
                    this.notification.notifyCode('AC0029', 0, text);
                  } else {
                    this.notification.notify(
                      res?.data?.data?.result?.message ||
                        res?.data?.description ||
                        res?.error,
                      '2'
                    );
                  }
                  this.onDestroy();
                });
            }
          });
        } else {
          this.notification.notify('Chưa hỗ trợ chuyển tiền ngân hàng này');
        }
      }
    });
  }

  querytransfer(data) {
    const t = this;
    this.getBankCode(data).subscribe((res: any) => {
      if (res) {
        if (res.bankCode == '970422' || res.bankCode == '970448') {
          t.checkLogin(res.bankCode, 'test', data, (o) => {
            if (o) {
              let tk = jsBh.decodeCookie('bankhub');
              this.api
                .execSv<any>(
                  'AC',
                  'AC',
                  'CashPaymentsBusiness',
                  'QueryTransferAsync',
                  [data.recID, tk, 'test']
                )
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res && !res?.error) {
                    data.status = '8';
                    this.view.dataService.update(data).subscribe();
                    let opt = new DialogModel();
                    opt.FormModel = this.view.formModel;
                    let dialog = this.callfc.openForm(
                      PopupInfoTransferComponent,
                      'Thông tin lệnh chuyển',
                      null,
                      null,
                      '',
                      res.data.data,
                      '',
                      opt
                    );
                  } else {
                    this.notification.notify(
                      res?.data?.data?.result?.message ||
                        res?.data?.description ||
                        res?.error,
                      '2'
                    );
                  }
                  this.onDestroy();
                });
            }
          });
        } else {
          this.notification.notify('Chưa hỗ trợ cho ngân hàng này');
        }
      }
    });
  }

  getBankCode(data) {
    return this.api.exec(
      'AC',
      'CashBooksBusiness',
      'GetBankCodeAsync',
      data.cashBookID
    );
  }
  /**
   * *Hàm check đăng nhập
   */
  checkLogin(bankcode, partner, data, func: any) {
    return jsBh.login(bankcode, partner, data, (o) => {
      return func(o);
    });
  }

  afterLogin(o: any) {
    return true;
  }
  //#endregion
}
