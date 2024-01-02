import { firstValueFrom } from 'rxjs';
import { FormGroup } from '@angular/forms';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
  SidebarModel,
  DialogRef,
  CodxFormDynamicComponent,
  ButtonModel,
  CRUDService,
  DataRequest,
  CallFuncService,
  LayoutService,
  NotificationsService,
  FormModel,
  AuthStore,
  DialogModel,
  Util,
  PageTitleService,
} from 'codx-core';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { CodxExportComponent } from '../codx-export/codx-export.component';
import { ActivatedRoute } from '@angular/router';
import { TabModel } from '../codx-tabs/model/tabControl.model';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';

import { OrderHistoryComponent } from './order-history/order-history.component';
import { UsingHistoryComponent } from './using-history/using-history.component';
import { AccessHistoryComponent } from './access-history/access-history.component';
import { PopupAddDynamicProcessComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import { CodxShareService } from '../../codx-share.service';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  service: string;
  entityName: string;
  predicate: string;
  dataValue: string;
  views: Array<ViewModel> = [];
  columnsGrid = [];
  data = [];
  dialog: DialogRef;
  buttons: ButtonModel[];
  formGroup: FormGroup;
  idField: string = 'recID';
  dataSelected: any;
  function: any = {};
  tabs: TabModel[] = [];
  authStore;
  itemSelected: any;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private notifySvr: NotificationsService,
    private userStore: AuthStore,
    private pageTitle: PageTitleService,
    private shareService: CodxShareService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.authStore = userStore.get();
  }

  onInit(): void {
    this.layout.showIconBack = true;
    this.route.params.subscribe((routeParams) => {
      // this.layout.setLogo(null);
      // this.layout.setUrl(null);
      // var state = history.state;
      // if (state) {
      //   if (state.urlOld) this.layout.setUrl(state.urlOld);
      // }
    });
    this.buttons = [
      {
        id: 'btnAdd',
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          //resources: this.columnsGrid,
          template2: this.morefunction,
          //frozenColumns: 1,
        },
      },
    ];

    // console.log('view ne', this.views);
    // console.log('view base ne', this.viewBase);

    this.detectorRef.detectChanges();
  }

  viewChanged(evt: any, view: ViewsComponent) {

    // this.cache
    //   .gridViewSetup(view.function.formName, view.function.gridViewName)
    //   .subscribe(() => {});
    this.view = view;
    (this.view as any).pageTitle.showBreadcrumbs(false)
    //var formName = view.function!.formName;
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }

  changeDataMF(e: any, data: any) {
    if (!data) return;
    if (data.isSystem) {
      let delMF = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS02'
      );
      if (delMF) {
        delMF[0].disabled = true;
      }
    }
    if (data.isActive) {
      let sendMailActiveMF = e.filter(
        (x: { functionID: string }) => x.functionID == 'TNT0015'
      );

      if (sendMailActiveMF) {
        sendMailActiveMF[0].disabled = true;
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
        this.openEditProcess(data, evt, '1');
        break;
      case 'CMS0105_2':
        this.openEditProcess(data, evt, '4');
        break;
      //resend active tenant email
      case 'TNT0015': {
        this.sendActiveTenantEmail(data);
        break;
      }
      //drop tenant
      case 'TNT0016': {
        this.dropTenant(data);
        break;
      }
      default:
        break;
    }
  }

  //resend active tenant email
  sendActiveTenantEmail(data) {
    this.api
      .execSv(
        'Tenant',
        'Tenant',
        'PaymentsBusiness',
        'ReactiveTenantAsync',
        data.tenantID
      )
      .subscribe((res) => {});
  }

  dropTenant(data) {
    this.api
      .execSv(
        'Tenant',
        'Tenant',
        'TenantsBusiness',
        'DropTenantAsync',
        data.tenantID
      )
      .subscribe((res) => {
        if (res) {
          this.view.currentView.refesh();
        }
      });
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
    this.api
      .execSv(
        'ES',
        'ES',
        'CategoriesBusiness',
        'GetByCategoryIDAsync',
        data?.categoryID
      )
      .subscribe((item) => {
        if (item) {
          this.viewBase.dataService.dataSelected = item;
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = new FormModel();
          option.FormModel.entityName = 'ES_Categories';
          option.FormModel.entityPer = 'ES_ODCategoriesApproval';
          option.FormModel.formName = 'ODCategoriesApproval';
          option.FormModel.funcID = 'ODS24';
          option.FormModel.gridViewName = 'grvODCategoriesApproval';
          option.FormModel.userPermission =
            this.viewBase?.formModel?.userPermission;
          let popupEdit = this.callfunc.openSide(
            PopupAddCategoryComponent,
            {
              disableCategoryID: '1',
              data: item,
              isAdd: false,
              headerText: e?.data?.customName,
              showTemplateTab: false,
            },
            option
          );
          popupEdit.closed.subscribe((res) => {
            if (res?.event == null) {
              //this.viewBase.dataService.dataSelected = evt.data;
              //this.viewBase.dataService.clear();
            } else {
              //this.viewBase.dataService.update(res.event).subscribe();
            }
          });
        }
      });
  }

  gridviewSetup: any = {};
  width: any = '550px';
  click(evt: ButtonModel) {
    if (this.view && this.view.formModel) {
      let formName = this.view.formModel.formName;
      let gridViewName = this.view.formModel.gridViewName;
      this.cache.gridViewSetup(formName, gridViewName).subscribe((gv) => {
        if (gv) {
          let arrgv = Object.values(gv) as any[];
          let grvsetup = arrgv?.filter((x) => x.allowPopup == true);
          let lstTabs = grvsetup?.filter(
            (x: any) => x.controlType == 'TabControl'
          );
          if (lstTabs && lstTabs.length > 0) this.width = '800px';
        }
      });
    }
    this.function = evt;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      default:
        let f = evt.data;
        let data = evt.model;
        if (!data) data = this.viewBase.dataService.dataSelected;
        this.shareService.defaultMoreFunc(
          f,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  private addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = this.width;
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      debugger;

      var dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          function: this.function,
          dataService: this.viewBase.dataService,
          isAddMode: true,
          titleMore: 'Thêm',
        },
        option
      );
      //Xử lý riêng của OD
      if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21')
        dialog.closed.subscribe((item) => {
          var dt = item?.event?.save;
          dt.data.category = 'OD_Dispatches';
          if (dt && !dt?.error && dt?.data && dt?.data?.approval) {
            //Kiểm tra xem tồn tại hay không ? Nếu không có thì lưu ES_Category
            this.api
              .execSv('ES', 'ES', 'CategoriesBusiness', 'ExistAsync', [
                dt?.data,
                'ODS21',
              ])
              .subscribe();
          }
        });
    });
  }
  private edit(evt?, mFunc?) {
    if (evt) this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    this.viewBase.dataService.edit(this.dataSelected).subscribe(() => {
      let option = new SidebarModel();
      option.Width = this.width;
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          function: this.function,
          dataService: this.viewBase.dataService,
          isAddMode: false,
          titleMore: mFunc ? mFunc.text : '',
        },
        option
      );
      //Xử lý riêng của OD
      if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21')
        this.dialog.closed.subscribe((item) => {
          var dt = item?.event?.update?.data;
          dt.category = 'OD_Dispatches';
          if (dt && dt?.approval) {
            //Kiểm tra xem tồn tại hay không ? Nếu không có thì lưu ES_Category
            this.api
              .execSv('ES', 'ES', 'CategoriesBusiness', 'ExistAsync', [
                dt,
                'ODS21',
              ])
              .subscribe();
          }
        });
    });
  }

  private copy(evt: any, mFunc?) {
    //this.dataSelected = this.viewBase.dataService.dataSelected;
    if (evt) {
      this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    }
    (this.viewBase.dataService as CRUDService).copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = this.width;
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      //this.dialog =
      this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          function: this.function,
          dataService: this.viewBase.dataService,
          titleMore: mFunc ? mFunc.text : '',
        },
        option
      );
    });
  }

  private delete(evt?) {
    if (evt) var delItem = (this.viewBase.dataService.dataSelected = evt);
    //Xử lý riêng OD
    if (this.viewBase?.currentView?.formModel?.funcID == 'ODS21') {
      this.api
        .execSv(
          'OD',
          'OD',
          'DispatchesBusiness',
          'GetItemByCategoryIDAsync',
          delItem.categoryID
        )
        .subscribe((item) => {
          if (!item) {
            this.viewBase.dataService.delete([delItem]).subscribe((res) => {
              this.dataSelected = res;
            });
            this.api
              .execSv('ES', 'ES', 'CategoriesBusiness', 'DeleteCategoyAsync', [
                delItem?.categoryID,
              ])
              .subscribe();
          } else this.notifySvr.notifyCode('SYS002');
        });
    } else {
      this.viewBase.dataService.delete([delItem]).subscribe((res) => {
        this.dataSelected = res;
      });
    }
  }

  private export(evt: any) {
    var id = 'recID';
    this.cache.entity(this.viewBase.formModel.entityName).subscribe((res) => {
      if (res) {
        id = res.isPK;
      }
    });
    var gridModel = new DataRequest();
    gridModel.formName = this.viewBase.formModel.formName;
    gridModel.entityName = this.viewBase.formModel.entityName;
    gridModel.funcID = this.viewBase.formModel.funcID;
    gridModel.gridViewName = this.viewBase.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.viewBase.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, evt[id]],
      null
    );
  }

  //#region Edit process by dong san pham
  async openEditProcess(data, evt, applyFor) {
    //VTHAO-2/10/2023
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'ProcessesBusiness',
        'GetProcessSettingAsync',
        [applyFor == '1' ? data?.processID : data?.processContractID]
      )
      .subscribe((res) => {
        if (res && res?.length > 0) {
          let process = res[0];
          let grv = res[1];
          let groups = res[2];
          let action = res[3] ? 'edit' : 'add';
          if (
            process.businessLineID == null ||
            process.businessLineID?.trim() == ''
          )
            process.businessLineID = data.businessLineID;
          process.applyFor = applyFor;
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          let formModel = new FormModel();
          formModel.entityName = 'DP_Processes';
          formModel.formName = 'DPProcesses';
          formModel.gridViewName = 'grvDPProcesses';
          formModel.funcID = 'DP0204'; //DP01 đôi đi vì Khanh đã đổi func

          dialogModel.FormModel = JSON.parse(JSON.stringify(formModel));

          var obj = {
            action: action,
            titleAction: evt ? evt.text : '',
            gridViewSetup: grv,
            lstGroup: groups,
            systemProcess: '2',
            data: process,
          };
          let dialogProcess = this.callfc.openForm(
            PopupAddDynamicProcessComponent,
            '',
            Util.getViewPort().height - 100,
            Util.getViewPort().width - 100,
            '',
            obj,
            '',
            dialogModel
          );
          dialogProcess.closed.subscribe((e) => {
            if (e && e?.event && e?.event?.recID && action == 'add') {
              if (applyFor == '1') data.processID = e.event?.recID;
              if (applyFor == '4') data.processContractID = e.event?.recID;
              let updateData = JSON.parse(JSON.stringify(data));
              this.view.dataService.update(updateData, true).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        }
      });

    //code cu
    // var process = await firstValueFrom(
    // //   this.api.execSv<any>(
    // //     'DP',
    // //     'ERM.Business.DP',
    // //     'ProcessesBusiness',
    // //     'GetAsync',
    // //     [data?.processID]
    // //   )
    // );
    // if (process) {
    //   this.api
    //     .execSv<any>(
    //       'DP',
    //       'ERM.Business.DP',
    //       'ProcessGroupsBusiness',
    //       'GetAsync'
    //     )
    //     .subscribe((groups) => {
    //       if (groups && groups.length > 0) {
    //         this.cache
    //           .gridViewSetup('DPProcesses', 'grvDPProcesses')
    //           .subscribe((res) => {
    //             let dialogModel = new DialogModel();
    //             dialogModel.IsFull = true;
    //             dialogModel.zIndex = 999;
    //             let formModel = new FormModel();
    //             formModel.entityName = 'DP_Processes';
    //             formModel.formName = 'DPProcesses';
    //             formModel.gridViewName = 'grvDPProcesses';
    //             formModel.funcID = 'DP01';
    //             // dialogModel.DataService = this.view?.dataService;
    //             dialogModel.FormModel = JSON.parse(JSON.stringify(formModel));
    //             if (res) {
    //               var obj = {
    //                 action: 'edit',
    //                 titleAction: evt ? evt.text : '',
    //                 gridViewSetup: res,
    //                 lstGroup: groups,
    //                 systemProcess: '2',
    //                 data: process,
    //               };
    //               this.callfc.openForm(
    //                 PopupAddDynamicProcessComponent,
    //                 '',
    //                 Util.getViewPort().height - 100,
    //                 Util.getViewPort().width - 100,
    //                 '',
    //                 obj,
    //                 '',
    //                 dialogModel
    //               );
    //             }
    //           });
    //       }
    //     });
    // }
  }
  //#endregion

  selectedChange(e: any) {
    this.itemSelected = e?.data;
  }
}
