import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from "@angular/core";
import { AuthStore, ButtonModel, CallFuncService, CodxFormDynamicComponent, CRUDService, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, SidebarModel, UIComponent, Util, ViewModel, ViewsComponent, ViewType } from "codx-core";
import { AccessHistoryComponent } from "../dynamic-form/access-history/access-history.component";
import { OrderHistoryComponent } from "../dynamic-form/order-history/order-history.component";
import { UsingHistoryComponent } from "../dynamic-form/using-history/using-history.component";

@Component({
  selector: 'popup-view-content',
  templateUrl: './popup-view-content.component.html',
  styleUrls: ['./popup-view-content.component.scss'],
})
export class PopupViewContentComponent{
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  dialog:any;
  funcId:any='';
  formName:any='';
  gridviewName:any='';
  entityName:any='';
  parentField:any='';
  idField:any='';
  parentValue:any='';
  defaultField:any='';
  defaultValue:any='';
  predicate:any='';
  dataValue:any='';
  views: Array<ViewModel> = [];
  authStore:any=undefined;
  function:any;
  dataSelected:any;
  formModel:any;
  buttons: ButtonModel;
  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notifySvr: NotificationsService,
    private userStore: AuthStore,
    private detectorRef : ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
   // this.funcID = this.router.snapshot.params['funcID'];
    this.authStore = userStore.get();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.predicate = urlParams.get('predicate');
    this.dataValue = urlParams.get('dataValue');
    this.funcId = urlParams.get('funcId');
    this.formName = urlParams.get('formName');
    this.gridviewName = urlParams.get('gridviewName');
    this.entityName = urlParams.get('entityName');
    this.parentField = urlParams.get('parentField');
    this.parentValue = urlParams.get('parentValue');
    this.defaultField = urlParams.get('defaultField');
    this.defaultValue = urlParams.get('defaultValue');
    this.idField = urlParams.get('idField');
    this.dialog = dialog;
  }


  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: false,
        active: true,
        model: {
          //resources: this.columnsGrid,
          template2: this.morefunction,
          //frozenColumns: 1,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    this.function = evt;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  private addNew() {
    // this.viewBase.dataService.addNew().subscribe((res) => {
    //   this.dataSelected = this.viewBase.dataService.dataSelected;
    //   let option = new SidebarModel();
    //   option.Width = '550px';
    //   option.DataService = this.viewBase?.currentView?.dataService;
    //   option.FormModel = this.viewBase?.currentView?.formModel;
    //   var dialog = this.callfc.openSide(
    //     CodxFormDynamicComponent,
    //     {
    //       formModel: option.FormModel,
    //       data: this.dataSelected,
    //       function: this.function,
    //       dataService: this.viewBase.dataService,
    //       isAddMode: true,
    //       titleMore: 'Thêm',
    //     },
    //     option
    //   );
    //   //Xử lý riêng của OD
    //   if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21')
    //     dialog.closed.subscribe((item) => {
    //       var dt = item?.event?.save;
    //       if (dt && !dt?.error && dt?.data && dt?.data?.approval) {
    //         //Kiểm tra xem tồn tại hay không ? Nếu không có thì lưu ES_Category
    //         this.api
    //           .execSv('ES', 'ES', 'CategoriesBusiness', 'ExistAsync', [
    //             dt?.data,
    //             'ODS21',
    //           ])
    //           .subscribe();
    //       }
    //     });
    // });
  }

  changeDataMF(e: any, data) {
    if (data.isSystem) {
      let delMF = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS02'
      );
      if (delMF) {
        delMF[0].disabled = true;
      }
    }
  }
  clickMF(evt?: any, data?: any) {
    this.function = evt;
    switch (evt.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data, evt);
        break;
      case 'SYS04':
        this.copy(data, evt);
        break;
      //Export file
      case 'SYS002':
        this.export(data);
        break;
      //Quy trình chi tiết của OD
      case 'ODS2101':
        this.openFormEditCategory(data, evt);
        break;
      //Danh sách sử dụng

      case 'TNT0013': {
        this.openFormUsingHistory(data, evt); //done
        break;
      }
      //Danh sách đơn hàng
      case 'TNT0014': {
        this.openFormOrderHistory(data, evt); //done
        break;
      }
      //Lịch sử truy cập TN
      case 'TNT0011': {
        // this.openFormOrderHistory(data, evt); //done
        this.openFormAccessHistory(data, evt); //done
        break;
      }
      //form edit quy trinh by dong san pham
      case 'CMS0105_1':
        //this.openEditProcess(data, evt);
        break;
      default:
        break;
    }
  }

  //Form lịch sử đơn hàng
  openFormOrderHistory(data, evt) {
    let sendData = {
      tenant: data.tenantID,
      userID: data.createdBy,
    };
    let orderDialog = this.callfc.openForm(
      OrderHistoryComponent,
      '',
      650,
      900,
      '',
      sendData
    );
  }

  //Form lịch sử sử dụng
  openFormUsingHistory(data, e) {
    let usingForm = this.callfc.openForm(
      UsingHistoryComponent,
      '',
      900,
      900,
      '',
      data.tenantID
    );
  }

  //Form lịch sử truy cập TN
  openFormAccessHistory(data: any, e: any) {
    let usingForm = this.callfc.openForm(
      AccessHistoryComponent,
      '',
      900,
      900,
      '',
      data.tenantID
    );
  }

  //Form chỉnh sửa quy trình duyệt OD
  openFormEditCategory(data: any, e: any) {
    // this.api
    //   .execSv(
    //     'ES',
    //     'ES',
    //     'CategoriesBusiness',
    //     'GetByCategoryIDAsync',
    //     data?.categoryID
    //   )
    //   .subscribe((item) => {
    //     if (item) {
          // this.viewBase.dataService.dataSelected = item;
          // let option = new SidebarModel();
          // option.Width = '800px';
          // option.DataService = this.viewBase?.dataService;
          // option.FormModel = new FormModel();
          // option.FormModel.entityName = 'ES_Categories';
          // option.FormModel.entityPer = 'ES_ODCategoriesApproval';
          // option.FormModel.formName = 'ODCategoriesApproval';
          // option.FormModel.funcID = 'ODS24';
          // option.FormModel.gridViewName = 'grvODCategoriesApproval';
          // option.FormModel.userPermission =
          //   this.viewBase?.formModel?.userPermission;
          // let popupEdit = this.callfunc.openSide(
          //   PopupAddCategoryComponent,
          //   {
          //     disableCategoryID: '1',
          //     data: item,
          //     isAdd: false,
          //     headerText: e?.data?.customName,
          //   },
          //   option
          // );
          // popupEdit.closed.subscribe((res) => {
          //   if (res?.event == null) {
          //     //this.viewBase.dataService.dataSelected = evt.data;
          //     //this.viewBase.dataService.clear();
          //   } else {
          //     //this.viewBase.dataService.update(res.event).subscribe();
          //   }
          // });
        //}
      //});
  }
  private edit(evt?, mFunc?) {
    // if (evt) this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    // this.viewBase.dataService.edit(this.dataSelected).subscribe(() => {
    //   let option = new SidebarModel();
    //   option.Width = '550px';
    //   option.DataService = this.viewBase?.currentView?.dataService;
    //   option.FormModel = this.viewBase?.currentView?.formModel;
    //   this.dialog = this.callfc.openSide(
    //     CodxFormDynamicComponent,
    //     {
    //       formModel: option.FormModel,
    //       data: this.dataSelected,
    //       function: this.function,
    //       dataService: this.viewBase.dataService,
    //       isAddMode: false,
    //       titleMore: mFunc ? mFunc.text : '',
    //     },
    //     option
    //   );
    //   //Xử lý riêng của OD
    //   if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21')
    //     this.dialog.closed.subscribe((item) => {
    //       var dt = item?.event?.update?.data;
    //       if (dt && dt?.approval) {
    //         //Kiểm tra xem tồn tại hay không ? Nếu không có thì lưu ES_Category
    //         this.api
    //           .execSv('ES', 'ES', 'CategoriesBusiness', 'ExistAsync', [
    //             dt,
    //             'ODS21',
    //           ])
    //           .subscribe();
    //       }
    //     });
    // });
  }

  private copy(evt: any, mFunc?) {
    //this.dataSelected = this.viewBase.dataService.dataSelected;
    // if (evt) {
    //   this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    // }
    // (this.viewBase.dataService as CRUDService).copy().subscribe((res) => {
    //   let option = new SidebarModel();
    //   option.Width = '550px';
    //   option.DataService = this.viewBase.dataService;
    //   option.FormModel = this.viewBase?.currentView?.formModel;
    //   //this.dialog =
    //   this.callfc.openSide(
    //     CodxFormDynamicComponent,
    //     {
    //       formModel: option.FormModel,
    //       data: res,
    //       function: this.function,
    //       dataService: this.viewBase.dataService,
    //       titleMore: mFunc ? mFunc.text : '',
    //     },
    //     option
    //   );
    // });
  }

  private delete(evt?) {
    // if (evt) var delItem = (this.viewBase.dataService.dataSelected = evt);
    // //Xử lý riêng OD
    // if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21') {
    //   this.api
    //     .execSv(
    //       'OD',
    //       'OD',
    //       'DispatchesBusiness',
    //       'GetItemByCategoryIDAsync',
    //       delItem.categoryID
    //     )
    //     .subscribe((item) => {
    //       if (!item) {
    //         this.viewBase.dataService.delete([delItem]).subscribe((res) => {
    //           this.dataSelected = res;
    //         });
    //         this.api
    //           .execSv('ES', 'ES', 'CategoriesBusiness', 'DeleteCategoyAsync', [
    //             delItem?.categoryID,
    //           ])
    //           .subscribe();
    //       } else this.notifySvr.notifyCode('SYS002');
    //     });
    // } else {
    //   this.viewBase.dataService.delete([delItem]).subscribe((res) => {
    //     this.dataSelected = res;
    //   });
    // }
  }

  private export(evt: any) {
    var id = 'recID';
  //   this.cache.entity(this.viewBase.formModel.entityName).subscribe((res) => {
  //     if (res) {
  //       id = res.isPK;
  //     }
  //   });
  //   var gridModel = new DataRequest();
  //   gridModel.formName = this.viewBase.formModel.formName;
  //   gridModel.entityName = this.viewBase.formModel.entityName;
  //   gridModel.funcID = this.viewBase.formModel.funcID;
  //   gridModel.gridViewName = this.viewBase.formModel.gridViewName;
  //   gridModel.page = this.view.dataService.request.page;
  //   gridModel.pageSize = this.view.dataService.request.pageSize;
  //   gridModel.predicate = this.view.dataService.request.predicates;
  //   gridModel.dataValue = this.view.dataService.request.dataValues;
  //   gridModel.entityPermission = this.viewBase.formModel.entityPer;
  //   //Chưa có group
  //   gridModel.groupFields = 'createdBy';
  //   this.callfunc.openForm(
  //     CodxExportComponent,
  //     null,
  //     null,
  //     800,
  //     '',
  //     [gridModel, evt[id]],
  //     null
  //   );
  // }

  // //#region Edit process by dong san pham
  // async openEditProcess(data, evt) {
  //   var process = await firstValueFrom(
  //     this.api.execSv<any>(
  //       'DP',
  //       'ERM.Business.DP',
  //       'ProcessesBusiness',
  //       'GetAsync',
  //       [data?.processID]
  //     )
  //   );
  //   if (process) {
  //     this.api
  //       .execSv<any>(
  //         'DP',
  //         'ERM.Business.DP',
  //         'ProcessGroupsBusiness',
  //         'GetAsync'
  //       )
  //       .subscribe((groups) => {
  //         if (groups && groups.length > 0) {
  //           this.cache
  //             .gridViewSetup('DPProcesses', 'grvDPProcesses')
  //             .subscribe((res) => {
  //               let dialogModel = new DialogModel();
  //               dialogModel.IsFull = true;
  //               dialogModel.zIndex = 999;
  //               let formModel = new FormModel();
  //               formModel.entityName = 'DP_Processes';
  //               formModel.formName = 'DPProcesses';
  //               formModel.gridViewName = 'grvDPProcesses';
  //               formModel.funcID = 'DP01';
  //               // dialogModel.DataService = this.view?.dataService;
  //               dialogModel.FormModel = JSON.parse(JSON.stringify(formModel));
  //               if (res) {
  //                 var obj = {
  //                   action: 'edit',
  //                   titleAction: evt ? evt.text : '',
  //                   gridViewSetup: res,
  //                   lstGroup: groups,
  //                   systemProcess: '2',
  //                   data: process,
  //                 };
  //                 this.callfc.openForm(
  //                   PopupAddDynamicProcessComponent,
  //                   '',
  //                   Util.getViewPort().height - 100,
  //                   Util.getViewPort().width - 100,
  //                   '',
  //                   obj,
  //                   '',
  //                   dialogModel
  //                 );
  //               }
  //             });
  //         }
  //       });
    //}
  }
  //#endregion

  onActionEvent(e:any){
    console.log(e);

  }
}
