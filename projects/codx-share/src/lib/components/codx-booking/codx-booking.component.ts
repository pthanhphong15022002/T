declare var window: any;
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
} from 'codx-core';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
// import { codxEpService } from '../../codx-ep.service';
// import { PopupAddAttendeesComponent } from './popup-add-attendees/popup-add-attendees.component';
// import { PopupAddBookingRoomComponent } from './popup-add-booking-room/popup-add-booking-room.component';
// import { PopupRescheduleBookingComponent } from './popup-reschedule-booking/popup-reschedule-booking.component';

@Component({
  selector: 'codx-booking',
  templateUrl: 'codx-booking.component.html',
  styleUrls: ['codx-booking.component.scss'],
})
export class CodxBookingComponent extends UIComponent implements AfterViewInit {
  //Input
  @Input() funcID: string;
  @Input() queryParams: any;
  @Input() resourceType ='1';
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
  @ViewChild('gridHost') gridHost: TemplateRef<any>;
  @ViewChild('gridMF') gridMF: TemplateRef<any>;
  @ViewChild('gridBookingOn') gridBookingOn: TemplateRef<any>;
  @ViewChild('gridStartDate') gridStartDate: TemplateRef<any>;
  @ViewChild('gridEndDate') gridEndDate: TemplateRef<any>;
  @ViewChild('gridNote') gridNote: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;

  //---------------------------------------------------------------------------------//
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';

  //---------------------------------------------------------------------------------//
  viewType = ViewType;
  formModel: FormModel;
  grView: any;
  scheduleHeader?: ResourceModel;
  scheduleEvent?: ResourceModel;
  dialog: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  columnGrids = [];
  scheduleEvtModel: any;
  scheduleHeaderModel: any;
  //---------------------------------------------------------------------------------//
  popupTitle = '';
  itemDetail: any;
  funcIDName;
  optionalData;
  navigated = false;
  isAdmin = false;
  isAfterRender = false;

  constructor(
    injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    super(injector);
    if (this.funcID == null) {
      this.funcID = this.activatedRoute.snapshot.params['funcID'];
    }
    if (this.queryParams == null) {
      this.queryParams = this.router.snapshot.queryParams;
    }
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.funcIDName = res.customName.toString().toLowerCase();
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.roleCheck();
    this.getSchedule();

    this.buttons = {
      id: 'btnAdd',
    };
  }

  onLoading(evt: any) {
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
        .subscribe((grv) => {
          if (grv) {
            this.grView = Util.camelizekeyObj(grv);
            this.columnGrids = [
              {
                field: 'bookingOn',
                template: this.gridBookingOn,
                headerText: this.grView?.bookingOn?.headerText,
              },
              {
                field: 'resourceID',
                template: this.gridResourceName,
                headerText: this.grView?.resourceID?.headerText,
              },
              {
                field: 'title',
                headerText: this.grView?.title?.headerText,
              },
              {
                field: 'title',
                template: this.gridHost,
                headerText: 'Người chủ trì',
              },
              {
                field: 'startDate',
                template: this.gridStartDate,
                headerText: this.grView?.startDate?.headerText,
              },
              {
                field: 'endDate',
                template: this.gridEndDate,
                headerText: this.grView?.endDate?.headerText,
              },
              {
                field: 'requester',
                headerText: this.grView?.requester?.headerText,
              },
              {
                field: '',
                headerText: '',
                width: 120,
                template: this.gridMF,
                textAlign: 'center',
              },
            ];
            this.views = [
              {
                sameData: false,
                type: ViewType.schedule,
                active: true,
                request2: this.scheduleHeader,
                request: this.scheduleEvent,
                toolbarTemplate: this.footerButton,
                showSearchBar: false,
                showFilter: false,
                model: {
                  //panelLeftRef:this.panelLeft,
                  eventModel: this.scheduleEvtModel,
                  resourceModel: this.scheduleHeaderModel, //resource
                  template: this.cardTemplate,
                  template4: this.resourceHeader,
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
              {
                sameData: true,
                type: ViewType.grid,
                active: false,
                model: {
                  resources: this.columnGrids,
                  template2: this.mfButton,
                  hideMoreFunc: true,
                },
              },
            ];
            this.navigateSchedule();
            this.detectorRef.detectChanges();
          }
        });

      this.detectorRef.detectChanges();
    }
  }

  ngAfterViewInit(): void {}

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getSchedule() {
    //lấy list booking để vẽ schedule
    this.scheduleEvent = new ResourceModel();
    this.scheduleEvent.assemblyName = 'EP';
    this.scheduleEvent.className = 'BookingsBusiness';
    this.scheduleEvent.service = 'EP';
    this.scheduleEvent.method = 'GetListBookingAsync';
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
      resourceId: { name: 'resourceID' },
      status: 'approveStatus',
    };

    this.scheduleHeaderModel = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID',
      TextField: 'resourceName',
      Title: 'Resources',
    };
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
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
      this.popupTitle = this.buttons.text + ' ' + this.funcIDName;
      this.addNew(event.data);
    }
    if (event.type == 'doubleClick' || event.type == 'edit') {
      if (event?.data.approveStatus == '1') {
        if (
          !this.codxEpService.checkRole(
            this.authService.userValue,
            event?.data?.createdBy,
            this.isAdmin
          )
        ) {
          this.notificationsService.notifyCode('TM052');
          return;
        } else {
          this.edit(event.data);
        }
      }
    }
  }

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
    }
  }

  changeDataMF(event, data: any) {
    if (event != null && data != null) {
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
      } else if (data.approveStatus == EPCONST.A_STATUS.Approved) {
        //Đã duyệt
        event.forEach((func) => {
          if (
            // Hiện: Mời - dời - Chép
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.R_Invite ||
            func.functionID == EPCONST.MFUNCID.R_Reschedule
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - duyệt - hủy
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.R_Release ||
            func.functionID == EPCONST.MFUNCID.C_Release ||
            func.functionID == EPCONST.MFUNCID.S_Release ||
            func.functionID == EPCONST.MFUNCID.R_Cancel ||
            func.functionID == EPCONST.MFUNCID.C_Cancel ||
            func.functionID == EPCONST.MFUNCID.S_Cancel
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
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  roleCheck() {
    //Kiểm tra quyền admin
    this.codxEpService.roleCheck().subscribe((res) => {
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
      this.codxEpService
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
        if (
          (window.ng.getComponent(ele) as CodxScheduleComponent).scheduleObj
            .first.element.id == 'Schedule'
        ) {
          (
            window.ng.getComponent(ele) as CodxScheduleComponent
          ).scheduleObj.first.selectedDate = new Date(date);
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
  }

  setPopupTitleOption(mfunc) {
    this.popupTitle = mfunc;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  release(data: any) {
    if (this.authService.userValue.userID != data?.createdBy) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    if (data.approval != '0') {
      this.codxEpService
        .getCategoryByEntityName(this.formModel.entityName)
        .subscribe((res: any) => {
          this.codxEpService
            .release(data, res?.processID, 'EP_Bookings', this.funcID)
            .subscribe((res) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notificationsService.notifyCode('ES007');
                data.approveStatus = EPCONST.A_STATUS.Released;
                data.write = false;
                data.delete = false;
                this.view.dataService.update(data).subscribe();
              } else {
                this.notificationsService.notifyCode(res?.msgCodeError);
              }
            });
        });
    } else {
      data.approveStatus = EPCONST.A_STATUS.Approved;
      data.write = false;
      data.delete = false;
      this.view.dataService.update(data).subscribe();
      this.notificationsService.notifyCode('ES007');
      this.codxEpService
        .afterApprovedManual(this.formModel.entityName, data.recID, EPCONST.A_STATUS.Approved)
        .subscribe();
    }
  }

  cancel(data: any) {
    if (
      !this.codxEpService.checkRole(
        this.authService.userValue,
        data?.createdBy,
        this.isAdmin
      )
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    this.codxEpService
      .cancel(data?.recID, '', this.formModel.entityName)
      .subscribe((res: any) => {
        if (res && res?.msgCodeError == null) {
          this.notificationsService.notifyCode(EPCONST.MES_CODE.Success); //đã hủy gửi duyệt
          data.approveStatus = EPCONST.A_STATUS.Cancel;
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }
  reschedule(data: any) {
    let host: any;
    if (data?.resources != null) {
      host = data?.resources.filter((res) => res.roleType == '1');
    }
    if (
      !this.codxEpService.checkRoleHost(
        this.authService.userValue,
        host[0].userID,
        this.isAdmin
      )
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    // let dialogReschedule = this.callfc.openForm(
    //   PopupRescheduleBookingComponent,
    //   '',
    //   550,
    //   400,
    //   this.funcID,
    //   [data, this.formModel, this.popupTitle]
    // );
    // dialogReschedule.closed.subscribe((x) => {
    //   this.popupClosed = true;
    //   if (!x.event) this.view.dataService.clear();
    //   if (x.event == null && this.view.dataService.hasSaved)
    //     this.view.dataService
    //       .delete([this.view.dataService.dataSelected])
    //       .subscribe((x) => {
    //         this.detectorRef.detectChanges();
    //       });
    //   else if (x.event) {
    //     x.event.modifiedOn = new Date();
    //     this.view.dataService.update(x.event).subscribe();
    //   }
    // });
  }
  invite(data: any) {
    let host: any;
    if (data?.resources != null) {
      host = data?.resources.filter((res) => res.roleType == '1');
    }
    if (
      !this.codxEpService.checkRoleHost(
        this.authService.userValue,
        host[0].userID,
        this.isAdmin
      )
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    // let dialogInvite = this.callfc.openForm(
    //   PopupAddAttendeesComponent,
    //   '',
    //   800,
    //   500,
    //   this.funcID,
    //   [data, this.formModel, this.popupTitle]
    // );
    // dialogInvite.closed.subscribe((x) => {
    //   if (!x.event) this.view.dataService.clear();
    //   if (x.event == null && this.view.dataService.hasSaved)
    //     this.view.dataService
    //       .delete([this.view.dataService.dataSelected])
    //       .subscribe((x) => {
    //         this.detectorRef.detectChanges();
    //       });
    //   else if (x.event) {
    //     x.event.modifiedOn = new Date();

    //     this.view.dataService.update(x.event).subscribe();
    //   }
    // });
  }

  addNew(evt?) {
    if (evt != null) {
      this.optionalData = evt;
    } else {
      this.optionalData = null;
    }
    if (true) {
      this.view.dataService.addNew().subscribe(() => {
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        // let dialog = this.callFuncService.openSide(
        //   PopupAddBookingRoomComponent,
        //   [this.dataSelected, true, this.popupTitle, this.optionalData],
        //   option
        // );
        // dialog.closed.subscribe((returnData) => {
        //   this.popupClosed = true;
        //   if (!returnData.event) {
        //     this.view.dataService.clear();
        //   }
        // });
      });
    }
  }

  edit(evt?) {
    if (evt) {
      if (
        !this.codxEpService.checkRole(
          this.authService.userValue,
          evt?.createdBy,
          this.isAdmin
        )
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
      if (true) {
        this.codxEpService
          .getBookingByRecID(evt?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.edit(booking).subscribe(() => {
                let option = new SidebarModel();
                option.Width = '800px';
                this.view.dataService.dataSelected = booking;
                option.DataService = this.view?.dataService;
                option.FormModel = this.formModel;
                // this.dialog = this.callFuncService.openSide(
                //   PopupAddBookingRoomComponent,
                //   [this.view.dataService.dataSelected, false, this.popupTitle],
                //   option
                // );
                // this.dialog.closed.subscribe((returnData) => {
                //   this.popupClosed = true;
                //   if (!returnData.event) this.view.dataService.clear();
                // });
              });
            }
          });
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (true) {
        this.codxEpService
          .getBookingByRecID(evt?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.dataSelected = booking;
              this.view.dataService.copy().subscribe((res) => {
                if (res) {
                  let option = new SidebarModel();
                  option.Width = '800px';
                  option.DataService = this.view?.dataService;
                  option.FormModel = this.formModel;
                  // let dialogCopy = this.callFuncService.openSide(
                  //   PopupAddBookingRoomComponent,
                  //   [
                  //     res,
                  //     true,
                  //     this.popupTitle,
                  //     null,
                  //     true,
                  //   ],
                  //   option
                  // );
                  // dialogCopy.closed.subscribe((returnData) => {
                  //   this.popupClosed = true;
                  //   if (!returnData.event) this.view.dataService.clear();
                  // });
                }
              });
            }
          });
      }
    }
  }

  delete(evt?) {
    this.view.dataService.methodDelete = 'DeleteBookingAsync';
    let deleteItem = this.view.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
      if (
        !this.codxEpService.checkRole(
          this.authService.userValue,
          deleteItem?.createdBy,
          this.isAdmin
        )
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
    }
    this.view.dataService.delete([deleteItem]).subscribe(() => {});
  }

  connectToMeeting(
    meetingTitle: string,
    meetingDescription: string,
    meetingDuration: number,
    meetingPassword: string,
    userName: string,
    isManager: boolean,
    meetingUrl?: string,
    meetingStartDate?: string,
    meetingStartTime?: string
  ) {
    this.codxEpService
      .connectMeetingNow(
        meetingTitle,
        meetingDescription,
        meetingDuration,
        meetingPassword,
        userName,
        '@',
        isManager,
        meetingUrl,
        meetingStartDate,
        meetingStartTime
      )
      .then((url) => {
        if (url) {
          window.open(url, '_blank');
        }
      });
  }
}
