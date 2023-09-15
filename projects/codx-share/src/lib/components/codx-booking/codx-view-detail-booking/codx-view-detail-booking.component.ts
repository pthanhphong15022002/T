import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  AuthStore,
  CallFuncService,
  DialogModel,
  DialogRef,
  NotificationsService,
  SidebarModel,
  UIComponent,
  UIDetailComponent,
  Util,
  ViewsComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import moment from 'moment';
import { CodxShareService } from '../../../codx-share.service';
import { CodxBookingService } from '../codx-booking.service';
import { Approver, ResponseModel } from '../../../models/ApproveProcess.model';
import { CodxRescheduleBookingRoomComponent } from '../codx-reschedule-booking-room/codx-reschedule-booking-room.component';
import { CodxInviteRoomAttendeesComponent } from '../codx-invite-room-attendees/codx-invite-room-attendees.component';
import { CodxAddBookingRoomComponent } from '../codx-add-booking-room/codx-add-booking-room.component';
import { CodxAddBookingCarComponent } from '../codx-add-booking-car/codx-add-booking-car.component';
import { CodxAddBookingStationeryComponent } from '../codx-add-booking-stationery/codx-add-booking-stationery.component';
@Component({
  selector: 'codx-view-detail-booking',
  templateUrl: 'codx-view-detail-booking.component.html',
  styleUrls: ['codx-view-detail-booking.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewDetailBookingComponent
  extends UIDetailComponent
  implements OnChanges
{
  //Input
  data: any;

  @Input() resourceType = '1'; //1:Phòng; 2:Xe; 6:VPP;
  @Input() formModel;
  @Input() crrEntityName = EPCONST.ENTITY.R_Bookings;
  @Input() view: ViewsComponent;
  @Input() viewMode = '1';
  @Input() transRecID;
  @Input() itemDetail;

  //Output
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Output('cardTrans') cardTrans: EventEmitter<any> = new EventEmitter();
  @Output('assignDriver') assignDriver: EventEmitter<any> = new EventEmitter();

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  //@ViewChild('codxBooking') codxBooking: CodxBookingComponent;
  //MFunction Booking  
  @ViewChild('reference') reference: TemplateRef<ElementRef>;

  firstLoad = true;
  id: string;
  active = 1;
  files = [];
  dialog!: DialogRef;
  routerRecID: any;
  listFilePermission = [];
  allowUploadFile = false;
  grView: any;
  loadedData: boolean;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  curUser: any;
  runMode: any;
  
  popupBookingComponent: any;
  
  funcIDName='';
  popupTitle='';
  allocateStatus: string;

  lstWarehourse = [];
  lstResourceOwner = [];
  resourceOwner = null;

  approvalRule = EPCONST.APPROVALRULE.Haved;
  categoryIDProcess: string;
  isAllocateStationery=false;
  
  stationeryAR = EPCONST.APPROVALRULE.Haved;
  autoApproveItem = EPCONST.APPROVALRULE.Haved;
  isAdmin: boolean;
  optionalData: any;
  
  loadPermission=true;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private codxBookingService: CodxBookingService,
    private codxShareService: CodxShareService,
    private callFuncService: CallFuncService,
    private notiService: NotificationsService,
    private authService: AuthService,
    private authStore: AuthStore
  ) {
    super(injector);
    this.funcID == this.funcID || this.view?.funcID;
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
        this.detectorRef.detectChanges();
      }
    });
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
    this.getCacheData();
    this.detectorRef.detectChanges();
    this.setHeight();
    if (this.resourceType == '1') {
      this.popupBookingComponent = CodxAddBookingRoomComponent;
    } else if (this.resourceType == '2') {
      this.popupBookingComponent = CodxAddBookingCarComponent;
    } else if (this.resourceType == '6') {
      this.popupBookingComponent = CodxAddBookingStationeryComponent;
    }
  }
  ngAfterViewInit(): void {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.recID) {
      
      this.getData(changes?.recID?.currentValue);

    }
    this.setHeight();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.funcID == this.funcID || this.view?.funcID;
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
        this.detectorRef.detectChanges();
      }
    });
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
          this.detectorRef.detectChanges();
        }
      });
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
      this.cache.viewSettingValues('EPParameters').subscribe((res) => {
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
          }
          let epSetting_4 = listSetting.filter(
            (x) => x.category == '4' && x.tranType == null
          );
          if (epSetting_4 != null) {
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
      this.roleCheck();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getData(recID) {
    this.recID = this.recID || recID;
    if (!this.recID) return;

    this.loadedData = false;
    if(this.itemDetail?.unbounds !=null){
      this.loadPermission=false;
    }
    if (this.runMode == '1') {
      this.codxEpService
        .getViewDetailBooking(this.recID, this.funcID, this.loadPermission)
        .subscribe((data) => {
          if (data) {
            this.data = data;
            this.refeshData(this.data);
            this.loadedData = true;
            this.detectorRef.detectChanges();
          }
        });
    } else {
      if (this.viewMode == '1') {
        this.codxEpService
          .getViewDetailBooking(this.recID, this.funcID, this.loadPermission)
          .subscribe((data) => {
            if (data) {
              this.data = data;
              this.refeshData(this.data);
              this.loadedData = true;
              this.detectorRef.detectChanges();
            }
          });
      } else if (this.viewMode == '2' && this.transRecID != null) {
        this.codxEpService
          .getApproveByRecID(this.transRecID)
          .subscribe((res) => {
            if (res) {
              this.data = res;
              this.refeshData(this.data);
              this.loadedData = true;
              this.detectorRef.detectChanges();
            }
          });
      }
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  // clickMF(event :any, data :any =null) {
  //   if(!data) data= this.data;
  //   if (this.viewMode == '1') {
  //     switch (event?.functionID) {
  //       //System MF
  //       case EPCONST.MFUNCID.Delete:
  //         this.delete.emit(data);
  //         break;

  //       case EPCONST.MFUNCID.Edit:
  //         this.setPopupTitle.emit(event?.text);
  //         this.edit.emit(data);
  //         break;

  //       case EPCONST.MFUNCID.Copy:
  //         this.setPopupTitle.emit(event?.text);
  //         this.copy.emit(data);
  //         break;

  //       // Aproval Trans
  //       case EPCONST.MFUNCID.R_Release: //Gửi duyệt
  //       case EPCONST.MFUNCID.C_Release:
  //       case EPCONST.MFUNCID.S_Release:
  //         this.release.emit(data);
  //         break;
  //       case EPCONST.MFUNCID.R_Cancel: //Hủy gửi duyệt
  //       case EPCONST.MFUNCID.C_Cancel:
  //       case EPCONST.MFUNCID.S_Cancel:
  //         this.cancel.emit(data);
  //         break;

  //       //Room
  //       case EPCONST.MFUNCID.R_Reschedule: //Dời
  //         this.setPopupTitleOption.emit(event?.text);
  //         this.reschedule.emit(data);
  //         break;
  //       case EPCONST.MFUNCID.R_Invite: //Mời
  //         this.setPopupTitleOption.emit(event?.text);
  //         this.invite.emit(data);
  //         break;

  //       //Car

  //       //Stationery
  //       case EPCONST.MFUNCID.S_Allocate:
  //         this.setAllocateStatus.emit(EPCONST.A_STATUS.Approved);
  //         this.allocate.emit(data);
  //         break;
  //       case EPCONST.MFUNCID.S_Allocate:
  //         this.setAllocateStatus.emit(EPCONST.A_STATUS.Rejected);
  //         this.allocate.emit(data);
  //         break;
  //         default:
  //       //Biến động , tự custom
  //       var customData =
  //       {
  //         refID : "",
  //         refType : this.formModel?.entityName,
  //         dataSource: data,
  //       }

  //       this.codxShareService.defaultMoreFunc(
  //         event,
  //         data,
  //         null,
  //         this.formModel,
  //         this.view.dataService,
  //         this,
  //         customData
  //       );
  //       break;
  //     }
  //   } else if (this.viewMode == '2') {
  //     let mfuncID = event?.functionID;
  //     switch (mfuncID) {
  //       case EPCONST.MFUNCID.R_Approval:
  //       case EPCONST.MFUNCID.C_Approval:
  //       case EPCONST.MFUNCID.S_Approval:
  //         {
  //           this.approve.emit(data);
  //         }
  //         break;
  //       case EPCONST.MFUNCID.R_Reject:
  //       case EPCONST.MFUNCID.C_Reject:
  //       case EPCONST.MFUNCID.S_Reject:
  //         {
  //           this.reject.emit(data);
  //         }
  //         break;
  //       case EPCONST.MFUNCID.R_Undo:
  //       case EPCONST.MFUNCID.C_Undo:
  //       case EPCONST.MFUNCID.S_Undo:
  //         {
  //           this.undo.emit(data);
  //         }
  //         break;

  //       //Car
  //       case EPCONST.MFUNCID.C_CardTrans:
  //         this.setPopupTitleOption.emit(event?.text);
  //         this.cardTrans.emit(data);
  //         break;
  //       case EPCONST.MFUNCID.C_DriverAssign:
  //         this.setPopupTitleOption.emit(event?.text);
  //         this.assignDriver.emit(data);
  //         break;
  //     }
  //   }
  // }
  clickMF(event, data) {
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
    }
  }
  changeDataMF(event, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else {
      if (this.viewMode == '1') {
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
          });
        }
      } else if (this.viewMode == '2') {
        event.forEach((func) => {
          if (
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.C_CardTrans ||
            func.functionID == EPCONST.MFUNCID.C_DriverAssign
          ) {
            func.disabled = true;
          }
        });
        if (data.approveStatus == '3') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo ||
              func.functionID == EPCONST.MFUNCID.C_DriverAssign
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '4') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject ||
              func.functionID == EPCONST.MFUNCID.C_DriverAssign
            ) {
              func.disabled = true;
            }
          });
        } else if (data?.approveStatus == '5' && data?.stepType != 'I') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = true;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = false;
            }
            if (func.functionID == EPCONST.MFUNCID.C_DriverAssign) {
              if (data?.resources) {
                let driver = Array.from(data?.resources).filter((item: any) => {
                  return item.roleType == '2';
                });
                if (
                  (driver != null && driver.length > 0) ||
                  data?.driverName != null
                ) {
                  func.disabled = true;
                } else {
                  func.disabled = false;
                }
              }
            }
          });
        }
        // Xử lí cấp phát VPP là bước duyệt cuối (stepType=='I')
        else if (
          data?.approveStatus == '5' &&
          data?.stepType == 'I' &&
          data?.issueStatus == '1'
        ) {
          //Chưa cấp phát
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = true;
            }
          });
        } else if (
          (data?.stepType == 'I' &&
            data?.approveStatus == '5' &&
            data?.issueStatus != '1') ||
          data?.approveStatus == '4'
        ) {
          //Đã cấp phát
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject ||
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = true;
            }
          });
        }
      }
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate -------------------------------------//
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
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  refeshData(res: any) {
    if(this.loadPermission){
      this.data.unbounds = this.itemDetail?.unbounds ?? this.data?.unbounds;
    }
    this.listFilePermission = [];
    if (this.resourceType == '6') {
      let tmpPer = new Permission();
      tmpPer.objectID = this.data.createdBy;
      tmpPer.objectType = 'U';
      tmpPer.read = true;
      tmpPer.share = true;
      tmpPer.download = true;
      tmpPer.isActive = true;
      this.listFilePermission.push(tmpPer);
    } else {
      if (res?.bookingAttendees != null && res?.bookingAttendees != '') {
        let listAttendees = res.bookingAttendees.split(';');
        listAttendees.forEach((item) => {
          if (item != '') {
            let tmpPer = new Permission();
            tmpPer.objectID = item; //
            tmpPer.objectType = 'U';
            tmpPer.read = true;
            tmpPer.share = true;
            tmpPer.download = true;
            tmpPer.isActive = true;
            this.listFilePermission.push(tmpPer);
          }
        });
      }
    }

    if (res?.listApprovers != null && res?.listApprovers.length > 0) {
      res.listApprovers.forEach((item) => {
        if (item != '') {
          let tmpPer = new Permission();
          tmpPer.objectID = item; //
          tmpPer.objectType = 'U';
          tmpPer.read = true;
          tmpPer.share = true;
          tmpPer.download = true;
          tmpPer.isActive = true;
          this.listFilePermission.push(tmpPer);
        }
      });
    }
    if (this.viewMode == '1') {
      this.allowUploadFile = false;
      if (this.resourceType == '6') {
        if (this.data?.createdBy == this.authService.userValue.userID) {
          this.allowUploadFile = true;
        }
      } else {
        for (let u of res.resources) {
          if (
            res?.createdBy == this.authService?.userValue?.userID ||
            this.authService?.userValue?.userID == u?.userID
          ) {
            this.allowUploadFile = true;
          }
        }
      }
    }

    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  sameDayCheck(sDate: any, eDate: any) {
    return moment(new Date(sDate)).isSame(new Date(eDate), 'day');
  }
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }

  meetingNow() {
    if (this.data?.onlineUrl != null) {
      let url =
        this.curUser?.userID == this.data?.createdBy ||
        this.curUser?.userID == this.data?.owner
          ? this.data?.onlineUrl2
          : this.data?.onlineUrl;
      window.open(url, '_blank');
    }
  }

  setHeight() {
    let main,
      header = 0;
    let ele = document.getElementsByClassName(
      'codx-detail-main'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      main = Array.from(ele)[0]?.offsetHeight;
    }

    let eleheader = document.getElementsByClassName(
      'codx-detail-header'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      header = Array.from(eleheader)[0]?.offsetHeight;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 65 + 'px';
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  release(data: any) {
    if (this.curUser?.userID == data?.createdBy) {
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
          this.resourceOwner.roleID = curRes[0]?.owner;
        }
      } else {
        this.resourceOwner = null;
        let curWarehourse = this.lstWarehourse.filter(
          (x) => x.warehouseID == data?.warehouseID
        );
        if (curWarehourse?.length > 0) {
          this.resourceOwner = new Approver();
          this.resourceOwner.roleID = curWarehourse[0]?.owner;
        } else {
          curWarehourse = this.lstWarehourse.filter((x) => x.isSystem == true);
          if (curWarehourse?.length > 0) {
            this.resourceOwner = new Approver();
            this.resourceOwner.roleID = curWarehourse[0]?.owner;
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
            this.codxShareService.codxReleaseDynamic(
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
                  this.view.dataService.update(data).subscribe();
                  this.notiService.notifyCode('SYS034');
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
                  this.notiService.notifyCode(res?.msgCodeError);
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
              this.view.dataService.update(data).subscribe();
              this.notiService.notifyCode('SYS034');
            } else {
              return;
            }
          });
      }
    } else {
      this.notiService.notifyCode('SYS032');
      return;
    }
  }

  cancel(data: any) {
    if (
      this.curUser?.userID == data?.createdBy ||
      this.codxBookingService.checkAdminRole(this.curUser, this.isAdmin)
    ) {
      this.codxShareService
        .codxCancel('EP', data?.recID, this.formModel.entityName, null, null)
        .subscribe((res: any) => {
          if (res && res?.msgCodeError == null) {
            this.notiService.notifyCode(EPCONST.MES_CODE.Success); //đã hủy gửi duyệt
            data.approveStatus = EPCONST.A_STATUS.Cancel;
            this.view.dataService.update(data).subscribe();
          } else {
            this.notiService.notifyCode(res?.msgCodeError);
          }
        });
    } else {
      this.notiService.notifyCode('SYS032');
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
          this.view.dataService.update(x.event).subscribe();
        }
      });
    } else {
      this.notiService.notifyCode('SYS032');
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
          this.view.dataService.update(x.event).subscribe();
        }
      });
    } else {
      this.notiService.notifyCode('SYS032');
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
              //this.updateData(returnData?.event);
            } else {
              this.view.dataService.clear();
            }
          });
        } else {
          let option = new SidebarModel();
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          option.Width = '800px';
          let dialogAdd = this.callfc.openSide(
            this.popupBookingComponent,
            [res, EPCONST.MFUNCID.Add, this.popupTitle, this.optionalData],
            option
          );
          dialogAdd.closed.subscribe((returnData) => {
            if (returnData?.event) {
              //this.updateData(returnData?.event);
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
        this.codxBookingService
          .getBookingByRecID(data?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.edit(booking).subscribe(() => {
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
                  this.view.dataService.dataSelected = booking;
                  option.DataService = this.view?.dataService;
                  option.FormModel = this.formModel;
                  let dialogEdit = this.callfc.openSide(
                    this.popupBookingComponent,
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
            }
          });
      } else {
        this.notiService.notifyCode('SYS032');
        return;
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (true) {
        this.codxBookingService
          .getBookingByRecID(evt?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.dataSelected = booking;
              this.view.dataService.copy().subscribe((res) => {
                if (res) {
                  if (
                    this.resourceType == EPCONST.VLL.ResourceType.Stationery
                  ) {
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
                    let dialogCopy = this.callfc.openSide(
                      this.popupBookingComponent,
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
          });
      }
    }
  }


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
      this.notiService.notifyCode('SYS032');
      return;
    }
  }
  reloadData(data: any) {
    if (data != null) {
      this.view?.dataService.update(data).subscribe();
      this.detectorRef.detectChanges();
    }
  }

  viewDetail(data: any) {
    if (data.resourceType == EPCONST.VLL.ResourceType.Stationery) {
      return;
    }
    let option = new SidebarModel();
    option.Width = '800px';
    option.DataService = this.view?.dataService;
    option.FormModel = this.formModel;
    let dialogview = this.callfc.openSide(
      this.popupBookingComponent,
      [data, EPCONST.MFUNCID.Edit, 'Xem chi tiết', null, true],
      option
    );
  }

  allocate(data: any) {
    if (data?.approverID != this.curUser?.userID) {
      this.notiService.notifyCode('SYS032');
      return;
    }
    if (data?.approval == '1') {
      this.api
        .exec('ES', 'ApprovalTransBusiness', 'GetByTransIDAsync', [data?.recID])
        .subscribe((trans: any) => {
          trans.map((item: any) => {
            if (item?.stepType === 'I') {
              this.codxShareService
                .codxApprove(item?.recID, this.allocateStatus, null, null, null)
                .subscribe((res: any) => {
                  if (res?.msgCodeError == null && res?.rowCount >= 0) {
                    this.notiService.notifyCode('SYS034'); //đã duyệt

                    data.issueStatus = this.allocateStatus == '5' ? '3' : '4';
                    this.view.dataService.update(data).subscribe();
                  } else {
                    this.notiService.notifyCode(res?.msgCodeError);
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
                    this.notiService.notifyCode('SYS034');
                  }
                });
              });
            this.detectorRef.detectChanges();
          } else {
            this.notiService.notifyCode('SYS001');
          }
        });
    }
  }
}
