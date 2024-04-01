import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, DataRequest, DialogModel, NotificationsService, SidebarModel, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CashCountingsAddComponent } from './cash-countings-add/cash-countings-add.component';
import { NewvoucherComponent } from '../../share/add-newvoucher/newvoucher.component';

@Component({
  selector: 'lib-cash-countings',
  templateUrl: './cash-countings.component.html',
  styleUrls: ['./cash-countings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCountingsComponent extends UIComponent {
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
dataDefault: any;
hideFields: Array<any> = [];
button: ButtonModel[] = [
  {
    //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  },
];
predicate: string = 'JournalNo=@0';
viewActive: number = ViewType.listdetail;
ViewType = ViewType;
private destroy$ = new Subject<void>();
constructor(
  private inject: Injector,
  private acService: CodxAcService,
  private authStore: AuthStore,
  private codxCommonService: CodxCommonService,
  private shareService: CodxShareService,
  private notification: NotificationsService,
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
    this.journalNo = params?.journalNo;
  });

  this.router.data.subscribe((res: any) => {
    if (res && res['runMode'] && res['runMode'] == '1') {
      this.predicate = '';
      this.runmode = res.runMode;
    }
  });
}
//#endregion Constructor

//#region Init
onInit(): void {
  if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
  this.cache
    .functionList(this.funcID)
    .subscribe((res) => {
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
    // {
    //   type: ViewType.listdetail,
    //   active: true,
    //   sameData: true,
    //   model: {
    //     template: this.templateDetailLeft,
    //     panelRightRef: this.templateDetailRight,
    //     collapsed: true,
    //     widthLeft: '23%',
    //     //separatorSize:3
    //   },
    // },
    // {
    //   type: ViewType.list,
    //   active: false,
    //   sameData: true,
    //   model: {
    //     template: this.listTemplate,
    //   },
    // },
    {
      type: ViewType.grid,
      active: false,
      sameData: true,
      model: {
        template2: this.templateGrid,
      },
    },
    // {
    //   type: ViewType.grid_detail,
    //   active: false,
    //   sameData: true,
    //   model: {
    //     template2: this.templateGrid,
    //   },

    //   request: { service: 'AC' },
    //   subModel: {
    //     entityName: 'AC_CashPaymentsLines',
    //     formName: 'CashPaymentsLines',
    //     gridviewName: 'grvCashPaymentsLines',
    //     parentField: 'TransID',
    //     parentNameField: 'VoucherNo',
    //     hideMoreFunc: true,
    //     request: {
    //       service: 'AC',
    //     },
    //     idField: 'recID',
    //   },
    // },
  ];
  //this.acService.setChildLinks();
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
            headerText: this.headerText,
            journal: { ...this.journal },
            oData: { ...res },
            hideFields: [...this.hideFields],
          };
          let optionSidebar = new SidebarModel();
          optionSidebar.DataService = this.view?.dataService;
          optionSidebar.FormModel = this.view?.formModel;
          let dialog = this.callfc.openSide(
            CashCountingsAddComponent,
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
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.view?.formModel;
        let dialog = this.callfc.openSide(
          CashCountingsAddComponent,
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
                      };
                      let optionSidebar = new SidebarModel();
                      optionSidebar.DataService = this.view?.dataService;
                      optionSidebar.FormModel = this.view?.formModel;
                      let dialog2 = this.callfc.openSide(
                        CashCountingsAddComponent,
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
                    CashCountingsAddComponent,
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
    };
    let optionSidebar = new SidebarModel();
    optionSidebar.DataService = this.view?.dataService;
    optionSidebar.FormModel = this.view?.formModel;
    let dialog = this.callfc.openSide(
      CashCountingsAddComponent,
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
    // let data = this.view?.dataService?.dataSelected;
    // if (this.runmode == '1') {
    //   this.shareService.changeMFApproval(event, data.unbounds);
    // } else {
    //   this.acService.changeMFCashPayment(
    //     event,
    //     data,
    //     type,
    //     this.journal,
    //     this.view.formModel
    //   );
    // }
  }

  /**
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data
   */
  releaseVoucher(text: any, data: any) {
    // this.acService
    //   .getCategoryByEntityName(this.view.formModel.entityName)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res) => {
    //     this.dataCategory = res;
    //     this.codxCommonService
    //       .codxRelease(
    //         'AC',
    //         data.recID,
    //         this.dataCategory.processID,
    //         this.view.formModel.entityName,
    //         this.view.formModel.funcID,
    //         '',
    //         '',
    //         '',
    //         null,
    //         JSON.stringify({ ParentID: data.journalNo })
    //       )
    //       .pipe(takeUntil(this.destroy$))
    //       .subscribe((result: any) => {
    //         if (result?.msgCodeError == null && result?.rowCount) {
    //           data.status = result?.returnStatus;
    //           this.view.dataService.updateDatas.set(data['_uuid'], data);
    //           this.view.dataService
    //             .save(null, 0, '', '', false)
    //             .pipe(takeUntil(this.destroy$))
    //             .subscribe((res: any) => {
    //               if (res && !res.update.error) {
    //                 this.notification.notifyCode('AC0029', 0, text);
    //               }
    //             });
    //         } else this.notification.notifyCode(result?.msgCodeError);
    //       });
    //   });
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data
   */
  cancelReleaseVoucher(text: any, data: any) {
    // this.codxCommonService
    //   .codxCancel('AC', data?.recID, this.view.formModel.entityName, null, null)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((result: any) => {
    //     if (result && result?.msgCodeError == null) {
    //       data.status = result?.returnStatus;
    //       this.view.dataService.updateDatas.set(data['_uuid'], data);
    //       this.view.dataService
    //         .save(null, 0, '', '', false)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe((res: any) => {
    //           if (res && !res.update.error) {
    //             this.notification.notifyCode('AC0029', 0, text);
    //           }
    //         });
    //     } else this.notification.notifyCode(result?.msgCodeError);
    //   });
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    // this.api
    //   .exec('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data, text])
    //   .subscribe((res: any) => {
    //     if (res[1]) {
    //       this.itemSelected = res[0];
    //       this.view.dataService.update(this.itemSelected).subscribe();
    //       this.notification.notifyCode('AC0029', 0, text);
    //       this.detectorRef.detectChanges();
    //     }
    //   });
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    // this.api
    //   .exec('AC', 'CashPaymentsBusiness', 'PostVourcherAsync', [data, text])
    //   .subscribe((res: any) => {
    //     if (res[1]) {
    //       this.itemSelected = res[0];
    //       this.view.dataService.update(this.itemSelected).subscribe();
    //       this.notification.notifyCode('AC0029', 0, text);
    //       this.detectorRef.detectChanges();
    //     }
    //   });
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    // this.api
    //   .exec('AC', 'CashPaymentsBusiness', 'UnPostVourcherAsync', [data, text])
    //   .subscribe((res: any) => {
    //     if (res[1]) {
    //       this.itemSelected = res[0];
    //       this.view.dataService.update(this.itemSelected).subscribe();
    //       this.notification.notifyCode('AC0029', 0, text);
    //       this.detectorRef.detectChanges();
    //     }
    //   });
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
    return this.api.exec('AC', 'CountingsBusiness', 'SetDefaultAsync', [
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
    // let params = {
    //   Recs: data?.recID,
    // };
    // this.shareService.printReport(
    //   reportID,
    //   reportType,
    //   params,
    //   this.view?.formModel
    // );
  }

  //#endregion
}
