import { CodxEpService } from './../../../../../codx-ep/src/lib/codx-ep.service';
import { filter } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  AfterViewInit,
  Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  DialogRef,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
  FormModel,
  NotificationsService,
  AuthService,
  CodxScheduleComponent,
  Util,
  DialogModel,
  AuthStore,
} from 'codx-core';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { CodxAddBookingCarComponent } from './codx-add-booking-car/codx-add-booking-car.component';
import { CodxAddBookingRoomComponent } from './codx-add-booking-room/codx-add-booking-room.component';
import { CodxAddBookingStationeryComponent } from './codx-add-booking-stationery/codx-add-booking-stationery.component';
import { CodxRescheduleBookingRoomComponent } from './codx-reschedule-booking-room/codx-reschedule-booking-room.component';
import { CodxInviteRoomAttendeesComponent } from './codx-invite-room-attendees/codx-invite-room-attendees.component';
import { ɵglobal as global } from '@angular/core';
import { CodxBookingService } from './codx-booking.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { GridColumn } from '@syncfusion/ej2-angular-grids';
import { Approver, ResponseModel } from '../../models/ApproveProcess.model';
import { EP_BookingInputParam } from './codx-booking.model';
import { PopupAdjustedAllocationComponent } from 'projects/codx-ep/src/lib/approval/popup-adjusted-allocation/popup-adjusted-allocation.component';
import { AddReceiptResourceComponent } from 'projects/codx-ep/src/lib/receipt/add-receipt-resource/add-receipt-resource.component';

@Component({
  selector: 'codx-booking',
  templateUrl: 'codx-booking.component.html',
  styleUrls: ['codx-booking.component.scss'],
})
export class CodxBookingComponent extends UIComponent implements AfterViewInit {
  //Input
  //list view
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  //schedule view
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  //grid view
  @ViewChild('gridResourceName') gridResourceName: TemplateRef<any>;
  @ViewChild('gridOwner') gridOwner: TemplateRef<any>;
  @ViewChild('gridMF') gridMF: TemplateRef<any>;
  @ViewChild('gridBookingOn') gridBookingOn: TemplateRef<any>;
  @ViewChild('gridStartDate') gridStartDate: TemplateRef<any>;
  @ViewChild('gridEndDate') gridEndDate: TemplateRef<any>;
  @ViewChild('gridNote') gridNote: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  ngCmp: any = global;
  //---------------------------------------------------------------------------------//
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  //---------------------------------------------------------------------------------//
  queryParams: any;
  resourceType: any;

  viewType = ViewType;
  formModel: FormModel;
  grView: any;
  scheduleHeader?: ResourceModel;
  scheduleEvent?: ResourceModel;
  dialog: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel[];
  moreFunc: Array<ButtonModel> = [];
  columnGrids = [];
  scheduleEvtModel: any;
  scheduleHeaderModel: any;
  popupBookingComponent: any;
  curUser: import('codx-core').UserModel;
  //---------------------------------------------------------------------------------//
  navigated = false;
  isAdmin = false;
  isAfterRender = false;
  isAllocateStationery = false;
  allocateFuncID = EPCONST.FUNCID.S_Allocate;
  //---------------------------------------------------------------------------------//
  lstWarehourse = [];
  lstResourceOwner = [];
  resourceOwner = null;
  //---------------------------------------------------------------------------------//
  optionalData: any;
  itemDetail: any;
  //---------------------------------------------------------------------------------//
  crrViewMode: any;
  popupTitle = '';
  funcIDName = '';
  categoryIDProcess = '';
  categoryID = '';
  runMode: any;
  allocateStatus: string;
  approvalRule = EPCONST.APPROVALRULE.Haved;
  autoComfirm = EPCONST.APPROVALRULE.NotHaved;
  stationeryAR = EPCONST.APPROVALRULE.Haved;
  autoApproveItem = EPCONST.APPROVALRULE.Haved;
  crrEntityName = EPCONST.ENTITY.R_Bookings;
  adjustedAllocation="0";
  constructor(
    injector: Injector,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private codxBookingService: CodxBookingService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private authStore: AuthStore
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
        this.runMode = funcList?.runMode;
        this.crrEntityName = funcList?.entityName;
      }
    });
    this.curUser = this.authStore.get();
    if (this.curUser == null) {
      this.curUser = this.authService?.userValue;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getBaseVariable();
    this.roleCheck();
    this.getCache();
    this.buttons = [{
      id: 'btnAdd',
    }];
  }

  onLoading(evt: any) {
    if (this.formModel) {
      if (
        this.crrEntityName == EPCONST.ENTITY.S_Bookings ||
        this.crrEntityName == EPCONST.ENTITY.S_Distribution
      ) {
        this.crrViewMode = this.viewType.listdetail;
        this.views = [
          {
            type: ViewType.listdetail,
            sameData: true,
            active: true,
            model: {
              template: this.itemTemplate,
              panelRightRef: this.panelRight,
            },
          },
        ];
        this.detectorRef.detectChanges();
      } else {

        this.getSchedule();
        this.crrViewMode = this.viewType.schedule;
        this.views = [
          {
            sameData: false,
            type: ViewType.schedule,
            active: true,
            request2: this.scheduleHeader, //request lấy data cho resource schedule
            request: this.scheduleEvent, //request lấy data cho event schedule
            toolbarTemplate: this.footerButton,
            showSearchBar: false,
            showFilter: false,
            model: {
              //panelLeftRef:this.panelLeft,
              eventModel: this.scheduleEvtModel, // mapping của event schedule
              resourceModel: this.scheduleHeaderModel, // mapping của resource schedule
              template: this.cardTemplate, //template của event schedule
              template4: this.resourceHeader, //template của resource schedule
              //template5: this.resourceTootip,//tooltip
              template6: this.mfButton, //header
              template8: this.contentTmp, //content
              //template7: this.footerButton,//footer
              statusColorRef: 'EP022',
            },
          },
          {
            type: ViewType.listdetail,
            sameData: true,
            active: false,
            model: {
              template: this.itemTemplate,
              panelRightRef: this.panelRight,
            },
          },
        ];
        this.navigateSchedule();
        this.cache
          .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
          .subscribe((grv) => {
            if (grv) {
              this.grView = Util.camelizekeyObj(grv);
              if (
                this.crrEntityName == EPCONST.ENTITY.R_Bookings ||
                this.crrEntityName == EPCONST.ENTITY.C_Bookings
              ) {
                this.columnGrids = [
                  {
                    field: 'bookingOn',
                    template: this.gridBookingOn,
                    headerText:
                      this.grView?.bookingOn?.headerText || 'BookingOn',
                    isVisible: this.grView?.bookingOn?.isVisible,
                  },
                  {
                    field: 'resourceID',
                    template: this.gridResourceName,
                    headerText:
                      this.grView?.resourceID?.headerText || 'ResourceID',
                    isVisible: this.grView?.resourceID?.isVisible,
                  },
                  {
                    field: 'title',
                    headerText: this.grView?.title?.headerText || 'Title',
                    isVisible: this.grView?.title?.isVisible,
                  },
                  {
                    field: 'owner',
                    template: this.gridOwner,
                    headerText: this.grView?.owner?.headerText || 'Owner',
                    isVisible: this.grView?.owner?.isVisible,
                  },

                  {
                    field: 'startDate',
                    template: this.gridStartDate,
                    headerText:
                      this.grView?.startDate?.headerText || 'StartDate',
                    isVisible: this.grView?.startDate?.isVisible,
                  },
                  {
                    field: 'endDate',
                    template: this.gridEndDate,
                    headerText: this.grView?.endDate?.headerText || 'EndDate',
                    isVisible: this.grView?.endDate?.isVisible,
                  },
                  {
                    field: 'requester',
                    headerText:
                      this.grView?.requester?.headerText || 'Requester',
                    isVisible: this.grView?.requester?.isVisible,
                  },
                  {
                    field: '',
                    headerText: '',
                    width: 120,
                    template: this.gridMF,
                    textAlign: 'center',
                    isVisible: true,
                  },
                ];
                let grid = {
                  sameData: true,
                  type: ViewType.grid,
                  active: false,
                  model: {
                    resources: this.columnGrids,
                    template2: this.mfButton,
                    hideMoreFunc: true,
                  },
                };
                this.views.push(grid)
              }
              this.detectorRef.detectChanges();
            }
          });

        this.detectorRef.detectChanges();
      }
    }
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteAsync';
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCache() {
    this.codxBookingService.getListWarehouse().subscribe((res: any) => {
      if (res) {
        this.lstWarehourse = res;
      }
    });
    this.codxBookingService.getListRO().subscribe((res: any) => {
      if (res) {
        this.lstResourceOwner = res;
      }
    });
  }
  getBaseVariable() {
    this.funcID = this.funcID || this.view?.funcID;
    this.queryParams = this.router?.snapshot?.queryParams;
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.crrEntityName = funcList?.entityName;
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
        this.runMode = funcList?.runMode;
        this.detectorRef.detectChanges();
        this.codxBookingService.getFormModel(this.funcID).then((res) => {
          if (res) {
            this.formModel = res;
          }
        });
        switch (this.crrEntityName) {
          case EPCONST.ENTITY.R_Bookings:
            this.resourceType = EPCONST.VLL.ResourceType.Room;
            this.categoryIDProcess = 'ES_EP001';
            break;
          case EPCONST.ENTITY.C_Bookings:
            this.resourceType = EPCONST.VLL.ResourceType.Car;
            this.categoryIDProcess = 'ES_EP002';
            break;

          case EPCONST.ENTITY.S_Bookings:
            this.resourceType = EPCONST.VLL.ResourceType.Stationery;
            this.categoryIDProcess = 'ES_EP003';
            break;
          case EPCONST.ENTITY.S_Distribution:
            this.resourceType = EPCONST.VLL.ResourceType.Stationery;
            this.categoryIDProcess = 'ES_EP003';
            this.isAllocateStationery = true;
            break;
        }
        this.codxShareService
          .getSettingValueWithOption('F', 'EPParameters')
          .subscribe((res) => {
            if (res) {
              let listSetting = res;
              let stationerySetting_1 = listSetting.filter(
                (x) =>
                  x.category == '1' &&
                  x.transType == EPCONST.PARAM.EPStationeryParameters
              );
              if (stationerySetting_1?.length > 0) {
                let setting = JSON.parse(stationerySetting_1[0]?.dataValue);
                //this.autoComfirm = setting?.AutoConfirm != null ? setting?.AutoConfirm : EPCONST.APPROVALRULE.NotHaved;//KTra tự duyệt và cấp phát VPP
                this.autoApproveItem =
                  setting?.AutoApproveItem != null
                    ? setting?.AutoApproveItem
                    : EPCONST.APPROVALRULE.NotHaved; //KTra tự duyệt và cấp phát VPP khi đặt phòng
                    this.adjustedAllocation =
                  setting?.AdjustedAllocation== "1" ? "1" :'0'
              }
              let epSetting_4 = listSetting.filter(
                (x) => x.category == '4' && x.tranType == null
              );
              if (epSetting_4?.length > 0) {
                let listEPSetting = JSON.parse(epSetting_4[0]?.dataValue);
                let roomSetting_4 = listEPSetting.filter(
                  (x) => x.FieldName == EPCONST.ES_CategoryID.Room
                );
                let carSetting_4 = listEPSetting.filter(
                  (x) => x.FieldName == EPCONST.ES_CategoryID.Car
                );
                let stationerySetting_4 = listEPSetting.filter(
                  (x) => x.FieldName == EPCONST.ES_CategoryID.Stationery
                );
                this.stationeryAR =
                  stationerySetting_4?.length > 0 &&
                  stationerySetting_4[0]?.ApprovalRule != null
                    ? stationerySetting_4[0]?.ApprovalRule
                    : EPCONST.APPROVALRULE.Haved;
                switch (this.resourceType) {
                  case EPCONST.VLL.ResourceType.Room:
                    if (roomSetting_4?.length > 0) {
                      this.approvalRule =
                        roomSetting_4[0]?.ApprovalRule != null
                          ? roomSetting_4[0]?.ApprovalRule
                          : EPCONST.APPROVALRULE.Haved;
                    }
                    break;
                  case EPCONST.VLL.ResourceType.Car:
                    if (carSetting_4?.length > 0) {
                      this.approvalRule =
                        carSetting_4[0]?.ApprovalRule != null
                          ? carSetting_4[0]?.ApprovalRule
                          : EPCONST.APPROVALRULE.Haved;
                    }
                    break;
                  case EPCONST.VLL.ResourceType.Stationery:
                    if (stationerySetting_4?.length > 0) {
                      this.approvalRule =
                        stationerySetting_4[0]?.ApprovalRule != null
                          ? stationerySetting_4[0]?.ApprovalRule
                          : EPCONST.APPROVALRULE.Haved;
                    }
                    break;
                }
              }
            }
          });
        if (this.resourceType == '1') {
          this.popupBookingComponent = CodxAddBookingRoomComponent;
        } else if (this.resourceType == '2') {
          this.popupBookingComponent = CodxAddBookingCarComponent;
        } else if (this.resourceType == '6') {
          this.popupBookingComponent = CodxAddBookingStationeryComponent;
        }
      }
    });

  }

  getSchedule() {
    //lấy list booking để vẽ schedule
    this.scheduleEvent = new ResourceModel();
    this.scheduleEvent.assemblyName = 'EP';
    this.scheduleEvent.className = 'BookingsBusiness';
    this.scheduleEvent.service = 'EP';
    //this.scheduleEvent.method = 'GetListBookingAsync';
    this.scheduleEvent.method = 'GetListBookingScheduleAsync';
    this.scheduleEvent.predicate = 'ResourceType=@0';
    this.scheduleEvent.dataValue = this.resourceType;
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.scheduleEvent.predicate = this.queryParams?.predicate;
      this.scheduleEvent.dataValue = this.queryParams?.dataValue;
    }
    this.scheduleEvent.idField = 'recID';
    //lấy list resource vẽ header schedule
    this.scheduleHeader = new ResourceModel();
    this.scheduleHeader.assemblyName = 'EP';
    this.scheduleHeader.className = 'BookingsBusiness';
    this.scheduleHeader.service = 'EP';
    this.scheduleHeader.method = 'GetResourceAsync';
    this.scheduleHeader.predicate = 'ResourceType=@0 ';
    this.scheduleHeader.dataValue = this.resourceType;

    this.scheduleEvtModel = {
      id: 'recID',
      subject: { name: 'title' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'resourceID' }, // field mapping vs resource Schedule
      status: 'approveStatus',
    };

    this.scheduleHeaderModel = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID', // field mapping vs event Schedule
      TextField: 'resourceName',
      Title: 'Resources',
    };
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.crrEntityName = funcList?.entityName;
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
        this.runMode = funcList?.runMode;
        this.detectorRef.detectChanges();
        this.getBaseVariable();
      }
    });
    //this.onLoading(evt);
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        // let dModel = new DialogModel();
        // dModel.FormModel = this.formModel;
        // dModel.DataService = this.view?.dataService;
        // let dialogStationery = this.callfc.openForm(
        //   FormSettingComponent,
        //   '',
        //   1024,
        //   768,
        //   null,
        //   [ EPCONST.MFUNCID.Add, this.popupTitle],
        //   '',
        //   dModel
        // );
        this.addNew();
        break;
      default:
        let event = evt?.data;
        let data = evt?.model;
        if (!data) data = this.view?.dataService?.dataSelected;
        this.codxShareService.defaultMoreFunc(
          event,
          data,
          null,
          this.view?.formModel,
          this.view?.dataService,
          this
        );
        break;
    }
  }

  changeItemDetail(event) {
    let recID = '';
    if (event?.data) {
      recID = event.data.recID;
      this.itemDetail = event?.data;
    } else if (event?.recID) {
      recID = event.recID;
      this.itemDetail = event;
    }
  }

  onActionClick(event?) {
    if (event.type == 'add' && event.data?.resourceId != null) {
      this.popupTitle = this.buttons[0].text + ' ' + this.funcIDName;
      this.addNew(event.data);
    }
    if (event.type == 'doubleClick' || event.type == 'edit') {
      this.viewDetail(event.data);
    }
  }

  clickMF(event, item) {
    if(!item) item = this.view?.dataService?.dataSelected;
    if(!item && this.view?.dataService?.data?.length>0) {
      item = this.view?.dataService?.data[0];
      this.view.dataService.dataSelected = item;
    }
    this.codxBookingService.getBookingByID(item?.recID).subscribe((data) => {
      if (data) {
        this.popupTitle = event?.text + ' ' + this.funcIDName;
        switch (event?.functionID) {
          //System MF
          case EPCONST.MFUNCID.Delete:
            this.delete(data);
            break;
          case EPCONST.MFUNCID.Edit:
            this.edit(data);
            break;
          case EPCONST.MFUNCID.Copy:
            this.copy(data);
            break;
            
          case EPCONST.MFUNCID.View:
            this.viewDetail(data);
            break;
          // Aproval Trans
          case EPCONST.MFUNCID.R_Release: //Gửi duyệt
          case EPCONST.MFUNCID.C_Release:
          case EPCONST.MFUNCID.S_Release:
            this.release(data);
            break;
          case EPCONST.MFUNCID.R_Cancel: //Hủy gửi duyệt
          case EPCONST.MFUNCID.C_Cancel:
          case EPCONST.MFUNCID.S_Cancel:
            this.cancel(data);
            break;

          //Room
          case EPCONST.MFUNCID.R_Reschedule: //Dời
            this.popupTitle = event?.text;
            this.reschedule(data);
            break;
          case EPCONST.MFUNCID.R_Invite: //Mời
            this.popupTitle = event?.text;
            this.invite(data);
            break;

          //Car

          //Stationery
          case EPCONST.MFUNCID.S_Allocate:
            this.allocateStatus = '5';
            this.allocate(data);
            break;
          case EPCONST.MFUNCID.S_UnAllocate:
            this.allocateStatus = '4';
            this.allocate(data);
            break;
          default:
            //Biến động , tự custom
            
            // var customData = {
            //   refID: '',
            //   refType: this.view?.formModel?.entityName,
            //   dataSource: data,
            // };

            this.codxShareService.defaultMoreFunc(
              event,
              data,
              null,
              this.view?.formModel,
              this.view?.dataService,
              this,
              //customData
            );
            break;
        }
      }
    });
  }

  changeDataMF(event, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else {
      if (
        event != null &&
        data != null &&
        this.crrEntityName != EPCONST.ENTITY.S_Distribution
      ) {
        if (data.approveStatus == EPCONST.A_STATUS.New) {
          //Mới tạo
          event.forEach((func) => {
            if (
              // Hiện: sửa - xóa - chép - gửi duyệt -
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: dời - mời - hủy
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == EPCONST.A_STATUS.Released) {
          //Gửi duyệt
          event.forEach((func) => {
            if (
              //Hiện: dời - mời - chép - hủy
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - gửi duyệt

              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == EPCONST.A_STATUS.Rejected) {
          //Từ chối
          event.forEach((func) => {
            if (
              //Hiện: chép
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Copy
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: còn lại
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule
            ) {
              func.disabled = true;
            }
          });
        } else if (data?.approveStatus == EPCONST.A_STATUS.Approved) {
          //Đã duyệt
          event.forEach((func) => {
            if (
              // Hiện: Mời - dời - Chép
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule ||
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - duyệt - hủy
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release
            ) {
              func.disabled = true;
            }
          });
        } else {
          event.forEach((func) => {
            if (
              //Hiện: chép
              func.functionID == EPCONST.MFUNCID.View ||
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: còn lại
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule
            ) {
              func.disabled = true;
            }
          });
        }
      } else if (
        event != null &&
        data != null &&
        this.crrEntityName == EPCONST.ENTITY.S_Distribution
      ) {
        event.forEach((func) => {
          if (
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.Copy
          ) {
            func.disabled = true;
          }
          if (
            data?.issueStatus == '1' &&
            data?.approveStatus == '5' &&
            (func.functionID == EPCONST.MFUNCID.S_Allocate ||
              func.functionID == EPCONST.MFUNCID.S_UnAllocate)
          ) {
            func.disabled = false;
          } else if (
            (data?.issueStatus != '1' || data?.approveStatus != '5') &&
            (func.functionID == EPCONST.MFUNCID.S_Allocate ||
              func.functionID == EPCONST.MFUNCID.S_UnAllocate)
          ) {
            func.disabled = true;
          }
          if( func.functionID == EPCONST.MFUNCID.View ){
            
            func.disabled = false;
          }
        });
      }
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  roleCheck() {
    //Kiểm tra quyền admin
    this.codxBookingService.roleCheck().subscribe((res) => {
      if (res == true) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  navigateSchedule() {
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.codxBookingService
        .getBookingByRecID(this.queryParams?.dataValue)
        .subscribe((res: any) => {
          if (res) {
            setInterval(() => this.navigate(res.startDate), 2000);
          }
        });
    }
  }
  navigate(date) {
    if (!this.navigated) {
      let ele = document.getElementsByTagName('codx-schedule')[0];
      if (ele) {
        let scheduleEle = ele.querySelector('ejs-schedule');
        if ((scheduleEle as any).ej2_instances[0]) {
          (scheduleEle as any).ej2_instances[0].selectedDate = new Date(date);
          this.navigated = true;
        }
      }
    }
  }
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
    this.detectorRef.detectChanges();
  }

  setPopupTitleOption(mfunc) {
    this.popupTitle = mfunc;
    this.detectorRef.detectChanges();
  }

  setAllocateStatus(status: string) {
    this.allocateStatus = status;
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  release(data: any) {
    if (this.curUser?.userID == data?.createdBy ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)) {
      if (
        this.resourceType == EPCONST.VLL.ResourceType.Room ||
        this.resourceType == EPCONST.VLL.ResourceType.Car
      ) {
        this.resourceOwner = null;
        let curRes = this.lstResourceOwner.filter(
          (x) => x.resourceID == data.resourceID
        );
        if (curRes?.length > 0) {
          this.resourceOwner = new Approver();
          this.resourceOwner.approver = curRes[0]?.owner;
          this.resourceOwner.roleType = "RO";
        }
      } else {
        this.resourceOwner = null;
        let curWarehourse = this.lstWarehourse.filter(
          (x) => x.warehouseID == data?.warehouseID
        );
        if (curWarehourse?.length > 0) {
          this.resourceOwner = new Approver();
          this.resourceOwner.approver = curWarehourse[0]?.owner;
          this.resourceOwner.roleType = "RO";
        } else {
          curWarehourse = this.lstWarehourse.filter((x) => x.isSystem == true);
          if (curWarehourse?.length > 0) {
            this.resourceOwner = new Approver();
            this.resourceOwner.approver = curWarehourse[0]?.owner;
            this.resourceOwner.roleType = "RO";
          }
        }
      }
      let autoRelease = false;
      // if(data?.resourceType== EPCONST.VLL.ResourceType.Stationery){
      //   if(this.autoComfirm==EPCONST.APPROVALRULE.Haved){
      //     autoRelease=true;
      //   }
      //   else{
      //     if(this.approvalRule==EPCONST.APPROVALRULE.NotHaved){
      //       autoRelease=true;
      //     }
      //   }
      // }
      // else{
      //   if(this.approvalRule==EPCONST.APPROVALRULE.NotHaved){
      //     autoRelease=true;
      //   }
      // }
      if (this.approvalRule == EPCONST.APPROVALRULE.NotHaved) {
        autoRelease = true;
      }
      if (!autoRelease) {
        this.codxBookingService
          .getProcessByCategoryID(this.categoryIDProcess)
          .subscribe((category: any) => {
            this.codxCommonService.codxReleaseDynamic(
              'EP',
              data,
              category,
              this.formModel.entityName,
              this.formModel?.funcID,
              data?.title,
              (res: ResponseModel) => {
                if (res?.msgCodeError == null && res?.rowCount) {
                  data.approveStatus =
                    res.returnStatus ?? EPCONST.A_STATUS.Released;
                  data.write = false;
                  data.delete = false;
                  this.view.dataService.update(data,true).subscribe();
                  this.notificationsService.notifyCode('SYS034');
                  if (
                    data?.approveStatus == EPCONST.A_STATUS.Approved &&
                    data.items?.length > 0 &&
                    data?.resourceType == EPCONST.VLL.ResourceType.Room
                  ) {
                    //Xử lý cấp phát VPP cho phòng họp trường hợp tự duyệt
                    if (
                      this.autoApproveItem == '1' ||
                      this.stationeryAR == '0'
                    ) {
                      this.codxBookingService
                        .autoApproveStationery(null, data.recID)
                        .subscribe((result) => {});
                    } else {
                      this.codxBookingService
                        .releaseStationeryOfRoom(null, data.recID, null)
                        .subscribe((result) => {});
                    }
                  }
                } else {
                  this.notificationsService.notifyCode(res?.msgCodeError);
                }
              },
              data?.createdBy,
              [this.resourceOwner],
              null
            );
          });
      } else {
        this.codxBookingService
          .approvedManual(data?.recID)
          .subscribe((approveData: any) => {
            if (approveData != null) {
              data.approveStatus = approveData?.approveStatus;
              data.write = false;
              data.delete = false;
              this.view.dataService.update(data,true).subscribe();
              this.notificationsService.notifyCode('SYS034');
            } else {
              return;
            }
          });
      }
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }

  cancel(data: any) {
    if (
      this.curUser?.userID == data?.createdBy ||this.curUser?.userID == data?.owner ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      this.codxCommonService
        .codxCancel('EP', data?.recID, this.formModel.entityName, null, null)
        .subscribe((res: any) => {
          if (res && res?.msgCodeError == null) {
            this.notificationsService.notifyCode(EPCONST.MES_CODE.Success); //đã hủy gửi duyệt
            data.approveStatus = EPCONST.A_STATUS.Cancel;
            this.view.dataService.update(data,true).subscribe();
          } else {
            this.notificationsService.notifyCode(res?.msgCodeError);
          }
        });
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }

  reschedule(data: any) {
    if (
      this.curUser?.userID == data?.owner ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      let dialogReschedule = this.callfc.openForm(
        CodxRescheduleBookingRoomComponent,
        '',
        550,
        400,
        this.funcID,
        [data, this.formModel, this.popupTitle]
      );
      dialogReschedule.closed.subscribe((x) => {
        if (!x.event) this.view.dataService.clear();
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.detectorRef.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event,true).subscribe();
        }
      });
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }

  invite(data: any) {
    if (
      this.curUser?.userID == data?.owner ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      let dialogInvite = this.callfc.openForm(
        CodxInviteRoomAttendeesComponent,
        '',
        800,
        500,
        this.funcID,
        [data, this.formModel, this.popupTitle]
      );
      dialogInvite.closed.subscribe((x) => {
        if (!x.event) this.view.dataService.clear();
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.detectorRef.detectChanges();
            });
        else if (x.event) {
          x.event.modifiedOn = new Date();
          this.view.dataService.update(x.event,true).subscribe();
        }
      });
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }

  addNew(evt?) {
    if (evt != null) {
      this.optionalData = evt;
    } else {
      this.optionalData = null;
    }
    if (true) {
      this.view.dataService.addNew().subscribe((res) => {
        if (this.resourceType == EPCONST.VLL.ResourceType.Stationery) {
          let dModel = new DialogModel();
          dModel.IsFull = true;
          dModel.FormModel = this.formModel;
          dModel.DataService = this.view?.dataService;
          let dialogStationery = this.callfc.openForm(
            this.popupBookingComponent,
            '',
            null,
            null,
            null,
            [res, EPCONST.MFUNCID.Add, this.popupTitle],
            '',
            dModel
          );
          dialogStationery.closed.subscribe((returnData) => {
            if (returnData?.event) {
              this.view?.dataService?.update(returnData?.event);
            } else {
              this.view.dataService.clear();
            }
          });
        } else {
          let option = new SidebarModel();
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          option.Width = '800px';
          let inputParam = new EP_BookingInputParam();
          inputParam.data = res;
          inputParam.funcType = EPCONST.MFUNCID.Add;
          inputParam.popupTitle = this.popupTitle;
          inputParam.optionalData = this.optionalData;
          let dialogAdd = this.callfc.openSide(
            this.popupBookingComponent,
            //inputParam,
            [res, EPCONST.MFUNCID.Add, this.popupTitle, this.optionalData],
            option
          );
          dialogAdd.closed.subscribe((returnData) => {
            if (returnData?.event) {
              //this.view?.dataService?.update(returnData?.event);
            } else {
              this.view.dataService.clear();
            }
          });
        }
      });
    }
  }

  edit(data?) {
    if (data) {
      if (
        this.curUser?.userID == data?.createdBy ||
        this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
      ) {
        this.view.dataService.edit(data).subscribe(() => {
          if (this.resourceType == EPCONST.VLL.ResourceType.Stationery) {
            let dModel = new DialogModel();
            dModel.IsFull = true;
            dModel.FormModel = this.formModel;
            dModel.DataService = this.view?.dataService;
            let dialogStationery = this.callfc.openForm(
              this.popupBookingComponent,
              '',
              null,
              null,
              null,
              [
                this.view.dataService.dataSelected,
                EPCONST.MFUNCID.Edit,
                this.popupTitle,
              ],
              '',
              dModel
            );
            dialogStationery.closed.subscribe((returnData) => {
              if (returnData?.event) {
                //this.updateData(returnData?.event);
              } else {
                this.view.dataService.clear();
              }
            });
          } else {
            let option = new SidebarModel();
            option.Width = '800px';
            this.view.dataService.dataSelected = data;
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let inputParam = new EP_BookingInputParam();
            inputParam.data = this.view.dataService.dataSelected;
            inputParam.funcType = EPCONST.MFUNCID.Edit;
            inputParam.popupTitle = this.popupTitle;
            let dialogEdit = this.callfc.openSide(
              this.popupBookingComponent,
              //inputParam,
              [
                this.view.dataService.dataSelected,
                EPCONST.MFUNCID.Edit,
                this.popupTitle,
              ],
              option
            );
            dialogEdit.closed.subscribe((returnData) => {
              if (returnData?.event) {
                //this.updateData(returnData?.event);
              } else {
                this.view.dataService.clear();
              }
            });
          }
        });
      } else {
        this.notificationsService.notifyCode('SYS032');
        return;
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (true) {        
        this.view.dataService.dataSelected = evt;
        this.view.dataService.copy().subscribe((res) => {
          if (res) {
            res.resources = res.resources ?? evt?.resources;
            res.items = res.items ?? evt?.items;
            if (this.resourceType == EPCONST.VLL.ResourceType.Stationery) {
              let dModel = new DialogModel();
              dModel.IsFull = true;
              dModel.FormModel = this.formModel;
              dModel.DataService = this.view?.dataService;
              let dialogStationery = this.callfc.openForm(
                this.popupBookingComponent,
                '',
                null,
                null,
                null,
                [res, EPCONST.MFUNCID.Copy, this.popupTitle],
                '',
                dModel
              );
              dialogStationery.closed.subscribe((returnData) => {
                if (returnData?.event) {
                  //this.updateData(returnData?.event);
                } else {
                  this.view.dataService.clear();
                }
              });
            } else {
              let option = new SidebarModel();
              option.Width = '800px';
              option.DataService = this.view?.dataService;
              option.FormModel = this.formModel;
              let inputParam = new EP_BookingInputParam();
              inputParam.data = res;
              inputParam.funcType = EPCONST.MFUNCID.Copy;
              inputParam.popupTitle = this.popupTitle;
              let dialogCopy = this.callfc.openSide(
                this.popupBookingComponent,
                //inputParam,
                [res, EPCONST.MFUNCID.Copy, this.popupTitle],
                option
              );
              dialogCopy.closed.subscribe((returnData) => {
                if (returnData?.event) {
                  //this.updateData(returnData?.event);
                } else {
                  this.view.dataService.clear();
                }
              });
            }
          }
        });
      }
    }
  }

  // updateData(data){
  //   this.codxBookingService.getBookingByRecID(data?.recID).subscribe(newData=>{
  //     if(newData){
  //       data=newData;
  //       this.view?.dataService.update(data).subscribe();
  //       this.detectorRef.detectChanges();
  //       if(this.approvalRule== EPCONST.APPROVALRULE.Haved && data?.resourceType==EPCONST.VLL.ResourceType.Room && data?.approveStatus==EPCONST.A_STATUS.Approved && data?.items?.length>0){
  //         //Trường hợp đặc biệt khi đặt phòng có theo quy trình duyệt nhưng được duyệt tự động(người gửi == người duyệt : VPP chưa kịp tạo ra khi gửi duyệt)
  //         if(this.autoApproveItem ==EPCONST.APPROVALRULE.Haved ){
  //           //Tự duyệt & cấp phát Vpp của phòng họp
  //           this.codxBookingService.autoApproveStationery(null,data?.recID).subscribe();
  //         }
  //         else{
  //           //Gửi duyệt Vpp của phòng họp
  //           this.codxBookingService.releaseStationeryOfRoom(null,data?.recID,null).subscribe();
  //         }
  //       }
  //     }
  //   })
  // }

  delete(data?) {
    if (
      this.curUser?.userID == data?.createdBy ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      let deleteItem = this.view.dataService.dataSelected;
      if (data) {
        deleteItem = data;
      }
      this.view.dataService.delete([deleteItem]).subscribe(() => {});
    } else {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
  }
  reloadData(data: any) {
    if (data != null) {
      this.view?.dataService.update(data,true).subscribe();
      this.detectorRef.detectChanges();
    }
  }

  viewDetail(data: any) {
    this.codxBookingService.getBookingByID(data?.recID).subscribe((res) => {
      data= res?? data;
    if (data.resourceType == EPCONST.VLL.ResourceType.Stationery) {
        let dModel = new DialogModel();
        dModel.IsFull = true;
        dModel.FormModel = this.formModel;
        dModel.DataService = this.view?.dataService;
        let dialogStationery = this.callfc.openForm(
          this.popupBookingComponent,
          '',
          null,
          null,
          null,
          [
            data,
            EPCONST.MFUNCID.View,
            this.popupTitle,
          ],
          '',
          dModel
        );
        dialogStationery.closed.subscribe((returnData) => {
          if (returnData?.event) {
            //this.updateData(returnData?.event);
          } else {
            this.view.dataService.clear();
          }
        });
      
    }
    else{
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.formModel;
      let inputParam = new EP_BookingInputParam();
      inputParam.data = data;
      inputParam.funcType = EPCONST.MFUNCID.View;
      inputParam.popupTitle = 'Xem chi tiết';
      inputParam.viewOnly = true;
      let dialogview = this.callfc.openSide(
        this.popupBookingComponent,
        //inputParam,
        [data, EPCONST.MFUNCID.View, 'Xem chi tiết', null, true],
        option
      );
    }
  });
  }


  allocate(data: any) {
    if (data?.issueBy != this.curUser?.userID) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (
      data.resourceType == '6' && this.adjustedAllocation == '1'
    ) {
      let dialogAllocate = this.callfc.openForm(
        PopupAdjustedAllocationComponent,
        '',
        700,
        600,
        '',
        { recID: data.recID }
      );
      dialogAllocate.closed.subscribe((res) => {
        if (res?.event) {
          this.startAllocate(data);
        }
      });
    } else {
      this.startAllocate(data);
    }
    
  }
  startAllocate(data){
    if (data?.approval == '1') {
      this.api
        .exec('ES', 'ApprovalTransBusiness', 'GetByTransIDAsync', [data?.recID])
        .subscribe((trans: any) => {
          trans.map((item: any) => {
            if (item?.stepType === 'I') {
              this.codxCommonService
                .codxApprove(item?.recID, this.allocateStatus, null, null, null)
                .subscribe((res: any) => {
                  if (res?.msgCodeError == null && res?.rowCount >= 0) {
                    this.notificationsService.notifyCode('SYS034'); //đã duyệt

                    data.issueStatus = this.allocateStatus == '5' ? '3' : '4';
                    this.view.dataService.update(data,true).subscribe();
                  } else {
                    this.notificationsService.notifyCode(res?.msgCodeError);
                  }
                });
            }
          });
        });
    } else {
      this.api
        .exec('EP', 'ResourceTransBusiness', 'AllocateAsync', [data.recID])
        .subscribe((dataItem: any) => {
          if (dataItem) {
            this.codxBookingService
              .getBookingByRecID(dataItem?.recID)
              .subscribe((booking) => {
                this.view.dataService.update(booking).subscribe((res) => {
                  if (res) {
                    this.notificationsService.notifyCode('SYS034');
                  }
                });
              });
            this.detectorRef.detectChanges();
          } else {
            this.notificationsService.notifyCode('SYS001');
          }
        });
    }
  }
}
