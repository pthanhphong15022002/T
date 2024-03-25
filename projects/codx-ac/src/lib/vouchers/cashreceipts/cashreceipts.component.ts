import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import {
  AuthStore,
  ButtonModel,
  CRUDService,
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
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmJournal } from '../../codx-ac.service';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { CashreceiptsAddComponent } from './cashreceipts-add/cashreceipts-add.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { NewvoucherComponent } from '../../share/add-newvoucher/newvoucher.component';
import { JournalsAddComponent } from '../../journals/journals-add/journals-add.component';

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
  dataDefault: any; //? data default của phiếu
  hideFields: Array<any> = []; //? array field được ẩn lấy từ journal
  button: ButtonModel[] = [
    {
      //? nút thêm phiếu
      id: 'btnAdd',
      icon: 'icon-i-file-earmark-plus',
    },
  ];
  viewActive: number = ViewType.listdetail;
  ViewType = ViewType;
  fmJournal:FormModel =  fmJournal;
  journalSV:CRUDService;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private codxCommonService: CodxCommonService,
    private tenant: TenantStore
  ) {
    super(inject);
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(map((data) => data.filter((f) => f.category === '1')?.[0]))
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        this.baseCurr = dataValue?.BaseCurr || '';
      })
      
    this.router.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.journalNo = params?.journalNo; //? get số journal từ router
    });

    this.router.data.subscribe((res: any) => {
      if (res && res['runMode'] && res['runMode'] == '1') {
        this.runmode = res.runMode;
      }
    });
    this.journalSV = this.acService.createCRUDService(
      inject,
      this.fmJournal,
      'AC'
    );
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
          this.headerText = res?.defaultName || res?.customName;
          this.runmode = res?.runMode; //? lấy runmode
          if (!this.runmode) this.runmode = res?.runMode;
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
          widthLeft: '23%',
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
      {
        type: ViewType.grid_detail,
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },

        request: { service: 'AC' },
        subModel: {
          entityName: 'AC_CashReceiptsLines',
          formName: 'CashReceiptsLines',
          gridviewName: 'grvCashReceiptsLines',
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
  //#endregion

  //#region Event
  /**
   * * Hàm click button thêm mới
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
      case 'SYS05':
        this.viewVoucher(data); //? sao chép chứng từ
        break;
      case 'SYS002':
        this.exportVoucher(data); //? xuất dữ liệu chứng từ
        break;
      case 'ACT040104':
      case 'ACT042802':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT040105':
      case 'ACT042803':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT040103':
      case 'ACT042801':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT040106':
      case 'ACT042804':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT040107':
      case 'ACT042805':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT040108':
      case 'ACT042806':
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
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res != null) {
          res.isAdd = true;
          if (this.dataDefault == null) this.dataDefault = { ...res };
          let data = {
            headerText: this.headerText, //? tiêu đề voucher
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
          };
          let optionSidebar = new SidebarModel();
          optionSidebar.DataService = this.view?.dataService;
          optionSidebar.FormModel = this.view?.formModel;
          let dialog = this.callfc.openSide(
            CashreceiptsAddComponent,
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
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res }, //?  data của cashpayment
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.view?.formModel;
        let dialog = this.callfc.openSide(
          CashreceiptsAddComponent,
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
    this.view.dataService.dataSelected = dataCopy;
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
                      };
                      let optionSidebar = new SidebarModel();
                      optionSidebar.DataService = this.view?.dataService;
                      optionSidebar.FormModel = this.view?.formModel;
                      let dialog2 = this.callfc.openSide(
                        CashreceiptsAddComponent,
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
                      this.onDestroy();
                    }
                  });
              }
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
                  };
                  let optionSidebar = new SidebarModel();
                  optionSidebar.DataService = this.view?.dataService;
                  optionSidebar.FormModel = this.view?.formModel;
                  let dialog2 = this.callfc.openSide(
                    CashreceiptsAddComponent,
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
                this.onDestroy();
              });
          }
        });
    }
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

  editJournal(){
    this.journalSV
      .edit(this.journal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        this.cache.gridViewSetup(this.fmJournal.formName,this.fmJournal.gridViewName).subscribe((o)=>{
          let data = {
            headerText: ('Chỉnh sửa sổ nhật kí').toUpperCase(),
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
        })
        this.onDestroy();
      });
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
    };
    let optionSidebar = new SidebarModel();
    optionSidebar.DataService = this.view?.dataService;
    optionSidebar.FormModel = this.view?.formModel;
    let dialog = this.callfc.openSide(
      CashreceiptsAddComponent,
      data,
      optionSidebar,
      this.view.funcID
    );
    dialog.closed.subscribe((res) => {});
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
    let data = this.view.dataService.dataSelected;
    if (this.runmode == '1') {
      this.shareService.changeMFApproval(event, data.unbounds);
    } else {
      this.acService.changeMFCashReceipt(
        event,
        data,
        type,
        this.journal,
        this.view.formModel
      );
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
                    this.itemSelected = res.update.data;
                    this.detectorRef.detectChanges();
                  }
                  this.onDestroy();
                });
            } else{
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
                this.itemSelected = res.update.data;
                this.detectorRef.detectChanges();
              }
              this.onDestroy();
            });
        } else{
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
      .exec('AC', 'CashReceiptsBusiness', 'ValidateVourcherAsync', [data, text])
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
      .exec('AC', 'CashReceiptsBusiness', 'PostVourcherAsync', [data, text])
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
      .exec('AC', 'CashReceiptsBusiness', 'UnPostVourcherAsync', [data, text])
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
      .pipe(map((r) => r?.[0] ?? [])).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        this.journal = res[0]; 
      })
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
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
}
