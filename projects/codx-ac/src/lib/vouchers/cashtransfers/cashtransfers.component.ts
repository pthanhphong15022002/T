import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, CRUDService, DataRequest, DialogModel, FormModel, NotificationsService, SidebarModel, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmJournal, fmVATInvoices } from '../../codx-ac.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CashtransfersAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { FormGroup } from '@angular/forms';
import { NewvoucherComponent } from '../../share/add-newvoucher/newvoucher.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { JournalsAddComponent } from '../../journals/journals-add/journals-add.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransfersComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>;
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  headerText: any;
  runmode: any;
  journalNo: string;
  itemSelected: any;
  userID: any;
  dataCategory: any;
  journal: any;
  baseCurr: any;
  dataDefault: any;
  hideFields: Array<any> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  }];
  viewActive:number = ViewType.listdetail;
  ViewType = ViewType;
  fgVATInvoice: FormGroup;
  fmVATInvoice : FormModel = fmVATInvoices;
  VATInvoiceSV:CRUDService;
  fmJournal:FormModel =  fmJournal;
  journalSV:CRUDService;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private codxCommonService: CodxCommonService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private ngxLoader: NgxUiLoaderService,
  ) {
    super(inject);
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(map((data) => data.filter((f) => f.category === '1')?.[0]))
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        this.baseCurr = dataValue?.BaseCurr || '';
      })
    this.router.params
      .subscribe((params) => {
        this.journalNo = params?.journalNo;
      });
    this.VATInvoiceSV = this.acService.createCRUDService(
      inject,
      this.fmVATInvoice,
      'AC'
    );
    this.journalSV = this.acService.createCRUDService(
      inject,
      this.fmJournal,
      'AC'
    );
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    if(!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache
    .functionList(this.funcID)
    .subscribe((res) => {
      if (res) {
        this.headerText = res?.defaultName || res?.customName;
        this.runmode = res?.runMode;
      }
    });
    this.fgVATInvoice = this.codxService.buildFormGroup(
      this.fmVATInvoice.formName,
      this.fmVATInvoice.gridViewName,
      this.fmVATInvoice.entityName
    );
    this.getJournal();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit() {
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
          //separatorSize:3
        },
      },
      // {
      //   type: ViewType.list, //? thiết lập view danh sách
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template: this.listTemplate,
      //   },
      // },
      {
        type: ViewType.grid, //? thiết lập view lưới
        active: false,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
      // {
      //   type: ViewType.grid_detail, //? thiết lập view lưới
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template2: this.templateGrid,

      //   },

      //   request:{service:'AC'},
      //   subModel:{
      //     entityName:'AC_CashPaymentsLines',
      //     formName:'CashPaymentsLines',
      //     gridviewName:'grvCashPaymentsLines',
      //     parentField:'TransID',
      //     parentNameField:'Memo',
      //     hideMoreFunc:true,
      //     request:{
      //       service: 'AC',
      //     },
      //     idField:'recID'
      //   }
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
      case 'ACT042202':
        this.releaseVoucher(e.text, data); //? gửi duyệt chứng từ
        break;
      case 'ACT042203':
        this.cancelReleaseVoucher(e.text, data); //? hủy yêu cầu duyệt chứng từ
        break;
      case 'ACT042201':
        this.validateVourcher(e.text, data); //? kiểm tra tính hợp lệ chứng từ
        break;
      case 'ACT042204':
        this.postVoucher(e.text, data); //? ghi sổ chứng từ
        break;
      case 'ACT042205':
        this.unPostVoucher(e.text, data); //? khôi phục chứng từ
        break;
      case 'ACT042206':
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
    if(view && view?.view?.type == this.viewActive) return;
    this.viewActive = view?.view?.type;
    this.detectorRef.detectChanges();
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thêm mới chứng từ
   */
  addNewVoucher() {
    this.ngxLoader.start();
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res != null) {
            res.isAdd = true;
            if (this.dataDefault == null) this.dataDefault = { ...res };
            let data = {
              headerText: this.headerText,
              journal: { ...this.journal },
              oData: { ...this.dataDefault }, 
              hideFields: [...this.hideFields],
              baseCurr: this.baseCurr,
              fgVATInvoice : this.fgVATInvoice,
              fmVATInvoice : this.fmVATInvoice,
              VATInvoiceSV: this.VATInvoiceSV
            };
            let optionSidebar = new SidebarModel();
            optionSidebar.DataService = this.view?.dataService;
            optionSidebar.FormModel = this.view?.formModel;
            let dialog = this.callfc.openSide(
              CashtransfersAddComponent,
              data,
              optionSidebar,
              this.view.funcID
            );
            dialog.closed.subscribe((res) => {
              if (res && res?.event) {
                if (res?.event?.type === 'discard') {
                  if(this.view.dataService.data.length == 0){
                    this.itemSelected = undefined;
                    this.detectorRef.detectChanges();
                  } 
                }
              }
            })
          }
          
        },
        complete:()=>{
          this.ngxLoader.stop();
          this.onDestroy();
        }
      });
  }

  /**
   * *Hàm chỉnh sửa chứng từ
   * @param dataEdit : data chứng từ chỉnh sửa
   */
  editVoucher(dataEdit) {
    this.view.dataService.dataSelected = dataEdit;
    this.ngxLoader.start();
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if(res){
            res.isEdit = true;
            let data = {
              headerText: this.headerText,
              journal: { ...this.journal },
              oData: { ...res }, 
              hideFields: [...this.hideFields],
              baseCurr: this.baseCurr,
              fgVATInvoice : this.fgVATInvoice,
              fmVATInvoice : this.fmVATInvoice,
              VATInvoiceSV: this.VATInvoiceSV
            };
            let optionSidebar = new SidebarModel();
            optionSidebar.DataService = this.view?.dataService;
            optionSidebar.FormModel = this.view?.formModel;
            let dialog = this.callfc.openSide(
              CashtransfersAddComponent,
              data,
              optionSidebar,
              this.view.funcID
            );
            dialog.closed.subscribe((res) => {
              if (res && res?.event) {
                if (res?.event?.type === 'discard') {
                  if(this.view.dataService.data.length == 0){
                    this.itemSelected = undefined;
                    this.detectorRef.detectChanges();
                  } 
                }
              }
            })
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          this.onDestroy();
        }
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
          this.ngxLoader.start();
          this.view.dataService
            .copy((o) => this.setDefault({ ...newdataCopy }, 'copy'))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next:(res:any)=>{
                if (res != null) {
                  res.isCopy = true;
                  let data = {
                    headerText: this.headerText,
                    journal: { ...this.journal },
                    oData: { ...res }, 
                    hideFields: [...this.hideFields],
                    baseCurr: this.baseCurr,
                    fgVATInvoice : this.fgVATInvoice,
                    fmVATInvoice : this.fmVATInvoice,
                    VATInvoiceSV: this.VATInvoiceSV
                  };
                  let optionSidebar = new SidebarModel();
                  optionSidebar.DataService = this.view?.dataService;
                  optionSidebar.FormModel = this.view?.formModel;
                  let dialog = this.callfc.openSide(
                    CashtransfersAddComponent,
                    data,
                    optionSidebar,
                    this.view.funcID
                  );
                  dialog.closed.subscribe((res) => {
                    if (res && res?.event) {
                      if (res?.event?.type === 'discard') {
                        if(this.view.dataService.data.length == 0){
                          this.itemSelected = undefined;
                          this.detectorRef.detectChanges();
                        } 
                      }
                    }
                  })
                }
              },
              complete:()=>{
                this.ngxLoader.stop();
                this.onDestroy();
              }
            });
        }
      });
    } else {
      this.ngxLoader.start();
      this.view.dataService
        .copy((o) => this.setDefault({ ...newdataCopy }, 'copy'))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:(res:any)=>{
            if (res != null) {
              res.isCopy = true;
              let data = {
                headerText: this.headerText,
                journal: { ...this.journal },
                oData: { ...res }, 
                hideFields: [...this.hideFields],
                baseCurr: this.baseCurr,
                fgVATInvoice : this.fgVATInvoice,
                fmVATInvoice : this.fmVATInvoice,
                VATInvoiceSV: this.VATInvoiceSV
              };
              let optionSidebar = new SidebarModel();
              optionSidebar.DataService = this.view?.dataService;
              optionSidebar.FormModel = this.view?.formModel;
              let dialog = this.callfc.openSide(
                CashtransfersAddComponent,
                data,
                optionSidebar,
                this.view.funcID
              );
              dialog.closed.subscribe((res) => {
                if (res && res?.event) {
                  if (res?.event?.type === 'discard') {
                    if(this.view.dataService.data.length == 0){
                      this.itemSelected = undefined;
                      this.detectorRef.detectChanges();
                    } 
                  }
                }
              })
            }
          },
          complete:()=>{
            this.ngxLoader.stop();
            this.onDestroy();
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
          if(this.view.dataService.data.length == 0){
            this.itemSelected = undefined;
            this.detectorRef.detectChanges();
          } 
        }
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
   * *Hàm gửi duyệt chứng từ (xử lí cho MF gửi duyệt)
   * @param data
   */
  releaseVoucher(text: any, data: any) {
    data = {...this.itemSelected};
    if (data) {
      this.ngxLoader.start();
      this.acService
        .getCategoryByEntityName(this.view.formModel.entityName)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res) {
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
              .subscribe({
                next: (result: any) => {
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
                },
                complete: () => {
                  this.ngxLoader.stop();
                  this.onDestroy();
                }
              });
          } else {
            this.ngxLoader.stop();
            this.onDestroy();
          }
        }); 
    }
  }

  /**
   * *Hàm hủy gửi duyệt chứng từ (xử lí cho MF hủy yêu cầu duyệt)
   * @param data
   */
  cancelReleaseVoucher(text: any, data: any) {
    data = {...this.itemSelected};
    if (data) {
      this.ngxLoader.start();
      this.codxCommonService
        .codxCancel('AC', data?.recID, this.view.formModel.entityName, null, null)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: any) => {
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
            } else {
              this.notification.notifyCode(result?.msgCodeError);
            }
          },
          complete: () => {
            this.ngxLoader.stop();
            this.onDestroy();
          }
        }); 
    }
  }

  /**
   * *Hàm kiểm tra tính hợp lệ của chứng từ (xử lí cho MF kiểm tra tính hợp lệ)
   * @param data
   */
  validateVourcher(text: any, data: any) {
    data = {...this.itemSelected};
    if (data) {
      this.ngxLoader.start();
      this.api
      .exec('AC', 'CashTranfersBusiness', 'ValidateVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res[1]) {
            this.itemSelected = res[0];
            this.view.dataService.update(this.itemSelected).subscribe();
            this.notification.notifyCode('AC0029', 0, text);
            this.detectorRef.detectChanges();
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          this.onDestroy();
        }
      });
    }
  }

  /**
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    data = {...this.itemSelected};
    if (data) {
      this.ngxLoader.start();
      this.api
      .exec('AC', 'CashTranfersBusiness', 'PostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res[1]) {
            this.itemSelected = res[0];
            this.view.dataService.update(this.itemSelected).subscribe();
            this.notification.notifyCode('AC0029', 0, text);
            this.detectorRef.detectChanges();
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          this.onDestroy();
        }
      });
    }
    
  }

  /**
   * *Hàm khôi phục chứng từ (xử lí cho MF khôi phục)
   * @param data
   */
  unPostVoucher(text: any, data: any) {
    data = {...this.itemSelected};
    if (data) {
      this.ngxLoader.start();
      this.api
      .exec('AC', 'CashTranfersBusiness', 'UnPostVourcherAsync', [data, text])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res[1]) {
            this.itemSelected = res[0];
            this.view.dataService.update(this.itemSelected).subscribe();
            this.notification.notifyCode('AC0029', 0, text);
            this.detectorRef.detectChanges();
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          this.onDestroy();
        }
      });
    }
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
        }
      });
  }

  /**
   * *Hàm ẩn hiện các morefunction của từng chứng từ ( trên view danh sách và danh sách chi tiết)
   * @param event : danh sách morefunction
   * @param data
   * @returns
   */
  changeMFDetail(event: any,type: any = '') {
    let data = this.view?.dataService?.dataSelected;
    if (this.runmode == '1') {
      this.shareService.changeMFApproval(event, data.unbounds);
    } else {
      this.acService.changeMFCashTranfers(event,data,type,this.journal,this.view.formModel);
    }
  }

  changeMFGrid(event: any, type: any,data:any) {
    if (this.runmode == '1') {
      this.shareService.changeMFApproval(event, data.unbounds);
    } else {
      this.acService.changeMFCashTranfers(event,data,type,this.journal,this.view.formModel);
      this.detectorRef.detectChanges();
    }
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
      this.journalNo,
      action,
    ]);
  }
  //#endregion Function
}
