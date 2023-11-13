import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, DataRequest, NotificationsService, SidebarModel, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { JournalService } from '../../journals/journals.service';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { WarehouseTransfersAddComponent } from './warehouse-transfers-add/warehouse-transfers-add.component';

@Component({
  selector: 'lib-warehouse-transfers',
  templateUrl: './warehouse-transfers.component.html',
  styleUrls: ['./warehouse-transfers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseTransfersComponent extends UIComponent {
  //#region Contrucstor
  views: Array<ViewModel> = []; // model view
  @ViewChild('templateDetailLeft') templateDetailLeft?: TemplateRef<any>; //? template view danh sách chi tiết (trái)
  @ViewChild('templateDetailRight') templateDetailRight: TemplateRef<any>; //? template view danh sách chi tiết (phải)
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>; //? template view danh sách
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>; //? template view lưới
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
  button: ButtonModel = {
    //? nút thêm phiếu
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  };
  optionSidebar: SidebarModel = new SidebarModel();
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private authStore: AuthStore,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    private tenant: TenantStore,
    private journalService: JournalService
  ) {
    super(inject);
    this.cache
      .companySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.baseCurr = res[0].baseCurr; //? get đồng tiền hạch toán
        }
      });
    this.router.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo; //? get số journal từ router
      });
  }
  //#endregion Contrucstor

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
          collapsed: true,
          widthLeft:'25%',
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
    this.journalService.setChildLinks(this.journalNo);

    this.optionSidebar.DataService = this.view?.dataService;
    this.optionSidebar.FormModel = this.view?.formModel;
    this.optionSidebar.isFull = true;
    console.log(this.view.dataService.data)
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
    if(this.view?.views){
      let view = this.view?.views.find(x => x.type == 1);
      if (view && view.active == true) return;
    }
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
            journal: { ...this.journal }, //?  data journal
            oData: { ...res }, //?  data của cashpayment
            hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
            baseCurr: this.baseCurr, //?  đồng tiền hạch toán
          };
          let dialog = this.callfc.openSide(
            WarehouseTransfersAddComponent,
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
    this.view.dataService.dataSelected = dataEdit;
    this.view.dataService
      .edit(dataEdit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        res.isEdit = true;
        let data = {
          headerText: this.headerText, //? tiêu đề voucher
          journal: { ...this.journal }, //?  data journal
          oData: { ...res },
          hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
          baseCurr: this.baseCurr, //?  đồng tiền hạch toán
        };
        let dialog = this.callfc.openSide(
          WarehouseTransfersAddComponent,
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
    // this.view.dataService.dataSelected = dataCopy;
    // this.view.dataService
    //   .copy((o) => this.setDefault(dataCopy, 'copy'))
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     if (res != null) {
    //       res.isCopy = true;
    //       let datas = { ...res };
    //       this.view.dataService
    //         .saveAs(datas)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe((res) => {
    //           if (res) {
    //             let data = {
    //               headerText: this.headerText, //? tiêu đề voucher
    //               journal: { ...this.journal }, //?  data journal
    //               oData: { ...datas }, //?  data của cashpayment
    //               hideFields: [...this.hideFields], //? array các field ẩn từ sổ nhật ký
    //               baseCurr: this.baseCurr, //?  đồng tiền hạch toán
    //               legalName: this.legalName, //? tên company
    //             };
    //             let dialog = this.callfc.openSide(
    //               CashPaymentAddComponent,
    //               data,
    //               this.optionSidebar,
    //               this.view.funcID
    //             );
    //             this.view.dataService
    //               .add(datas)
    //               .pipe(takeUntil(this.destroy$))
    //               .subscribe();
    //           }
    //         });
    //     }
    //   });
  }

  /**
   * *Hàm xóa chứng từ
   * @param dataDelete : data xóa
   */
  deleteVoucher(dataDelete) {
    this.view?.currentView?.dataService
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
  changeMFDetail(event: any, data: any, type: any = '') {
    this.acService.changeMFCashPayment(event,data,type,this.journal,this.view.formModel);
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
      .exec('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data,text])
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
   * *Hàm ghi sổ chứng từ (xử lí cho MF ghi sổ)
   * @param data
   */
  postVoucher(text: any, data: any) {
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'PostVourcherAsync', [data,text])
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
      .exec('AC', 'CashPaymentsBusiness', 'UnPostVourcherAsync', [data,text])
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
        }
      });
  }

  /**
   * *Hàm call set default data khi thêm mới chứng từ
   * @returns
   */
  setDefault(data: any, action: any = '') {
    return this.api.exec('IV', 'TransfersBusiness', 'SetDefaultAsync', [
      data,
      this.journal,
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
      Recs:data?.recID,
    }
    this.shareService.printReport(reportID,reportType,params,this.view?.formModel);
  }
  //#endregion Function
}
