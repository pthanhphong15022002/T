import {
  fmAssetAcquisitionsJournal,
  fmAssetRevaluationsJournal,
  fmAssetLiquidationsJournal,
  fmCountingMembers,
  fmAssetTransfersJournal,
  fmAssetDepreciationsJournal,
  fmAssetCountingsJournal,
  fmJournal,
} from './../../codx-ac.service';
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
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { AssetJournalsAddComponent } from './asset-journals-add/asset-journals-add.component';
import { NewvoucherComponent } from '../../share/add-newvoucher/newvoucher.component';
import { JournalsAddComponent } from '../../journals/journals-add/journals-add.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';

@Component({
  selector: 'lib-asset-journals',
  templateUrl: './asset-journals.component.html',
  styleUrls: ['./asset-journals.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetJournalsComponent extends UIComponent {
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
      id: 'btnAdd',
      icon: 'icon-i-file-earmark-plus',
    },
  ];
  predicate: string = 'JournalNo=@0';
  viewActive: number = ViewType.listdetail;
  ViewType = ViewType;
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
      // case 'ACT042202':
      // case 'ACT042202':
      //   this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
      //   break;
      case 'ACT81108':
      case 'ACT82108':
      case 'ACT82308':
      case 'ACT83108':
      case 'ACT84108':
      case 'ACT87108':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT81101':
      case 'ACT82101':
      case 'ACT82301':
      case 'ACT83101':
      case 'ACT84101':
      case 'ACT87101':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT81106':
      case 'ACT82106':
      case 'ACT82306':
      case 'ACT83106':
      case 'ACT84106':
      case 'ACT87106':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT81107':
      case 'ACT82107':
      case 'ACT82307':
      case 'ACT83107':
      case 'ACT84107':
      case 'ACT87107':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT81102':
      case 'ACT82102':
      case 'ACT82302':
      case 'ACT83102':
      case 'ACT84102':
      case 'ACT87102':
        this.printVoucher(data, e.functionID); //? in chứng từ
        break;
    }
  }
  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any, type: any = '',data:any) {
    if (this.runmode == '1') {
      this.shareService.changeMFApproval(event, data.unbounds);
    } else {
      if (data) {
        this.acService.changeMFAsset(
          event,
          data,
          type,
          this.journal,
          this.view.formModel
        );
      }
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
            baseCurr: this.baseCurr,
          };
          let optionSidebar = new SidebarModel();
          optionSidebar.DataService = this.view?.dataService;
          optionSidebar.FormModel = this.view?.formModel;
          let dialog = this.callfc.openSide(
            AssetJournalsAddComponent,
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
        };
        let optionSidebar = new SidebarModel();
        optionSidebar.DataService = this.view?.dataService;
        optionSidebar.FormModel = this.view?.formModel;
        let dialog = this.callfc.openSide(
          AssetJournalsAddComponent,
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
                        AssetJournalsAddComponent,
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
                  };
                  let optionSidebar = new SidebarModel();
                  optionSidebar.DataService = this.view?.dataService;
                  optionSidebar.FormModel = this.view?.formModel;
                  let dialog2 = this.callfc.openSide(
                    AssetJournalsAddComponent,
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
      AssetJournalsAddComponent,
      data,
      optionSidebar,
      this.view.funcID
    );
    dialog.closed.subscribe((res) => {});
  }

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
      .exec('AM', 'AssetJournalsBusiness', 'ValidateVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected,true).subscribe();
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
      .exec('AM', 'AssetJournalsBusiness', 'PostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected,true).subscribe();
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
      .exec('AM', 'AssetJournalsBusiness', 'UnPostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res[1]) {
          this.itemSelected = res[0];
          this.view.dataService.update(this.itemSelected,true).subscribe();
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

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

  //#region Function
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
    return this.api.exec('AM', 'AssetJournalsBusiness', 'SetDefaultAsync', [
      data,
      this.journalNo,
      action,
    ]);
  }
  //#endregion
}
