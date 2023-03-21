declare var window: any;
import { title } from 'process';
import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  DataRequest,
  DialogModel,
  DialogRef,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  CallFuncService,
  ViewType,
  FormModel,
  NotificationsService,
  AuthService,
  CodxScheduleComponent,
  Util,
} from 'codx-core';
import { CodxReportViewerComponent } from 'projects/codx-report/src/lib/codx-report-viewer/codx-report-viewer.component';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddAttendeesComponent } from './popup-add-attendees/popup-add-attendees.component';
import { PopupAddBookingRoomComponent } from './popup-add-booking-room/popup-add-booking-room.component';
import { PopupRescheduleBookingComponent } from './popup-reschedule-booking/popup-reschedule-booking.component';

@Component({
  selector: 'booking-room',
  templateUrl: './booking-room.component.html',
  styleUrls: ['./booking-room.component.scss'],
})
export class BookingRoomComponent extends UIComponent implements AfterViewInit {
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('reportObj') reportObj: CodxReportViewerComponent;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('gridResourceName') gridResourceName: TemplateRef<any>;
  @ViewChild('gridHost') gridHost: TemplateRef<any>;
  @ViewChild('gridMF') gridMF: TemplateRef<any>;
  @ViewChild('gridBookingOn') gridBookingOn: TemplateRef<any>;
  @ViewChild('gridStartDate') gridStartDate: TemplateRef<any>;
  @ViewChild('gridEndDate') gridEndDate: TemplateRef<any>;
  @ViewChild('gridNote') gridNote: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  // Lấy dữ liệu cho view
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  viewType = ViewType;
  modelResource?: ResourceModel;
  request?: ResourceModel;
  model = new DataRequest();
  dataSelected: any;
  isAdd = true;
  isCollapsed = true;
  dialog!: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  fields: any;
  resourceField: any;
  funcID: string;
  popupTitle = '';
  lstPined: any = [];
  reportUUID: any = 'TMR01';
  itemDetail;
  funcIDName;
  optionalData;
  formModel: FormModel;
  popupClosed = true;
  listRoom = [];
  listReason = [];
  listAttendees = [];
  listItem = [];
  tempReasonName = '';
  tempRoomName = '';
  tempAttendees = '';
  selectBookingItems = [];
  selectBookingAttendees = '';
  queryParams: any;
  navigated = false;
  columnGrids = [];
  isAdmin = false;
  grView: any;
  isAfterRender = false;
  constructor(
    private injector: Injector,
    private callFuncService: CallFuncService,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.queryParams = this.router.snapshot.queryParams;
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

  onInit(): void {
    //Kiểm tra quyền admin
    this.codxEpService.roleCheck().subscribe((res) => {
      if (res == true) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });

    //lấy list booking để vẽ schedule
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetListBookingAsync';
    this.request.predicate = 'ResourceType=@0';
    this.request.dataValue = '1';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.request.predicate = this.queryParams?.predicate;
      this.request.dataValue = this.queryParams?.dataValue;
    }
    this.request.idField = 'recID';
    //lấy list resource vẽ header schedule
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0 ';
    this.modelResource.dataValue = '1';

    this.fields = {
      id: 'recID',
      subject: { name: 'title' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'resourceID' },
      status: 'approveStatus',
    };

    this.resourceField = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID',
      TextField: 'resourceName',
      Title: 'Resources',
    };

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
                field: '',
                headerText: '',
                width: 40,
                template: this.gridMF,
                textAlign: 'center',
              },
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
            ];
            this.views.push({
              sameData: true,
              type: ViewType.grid,
              active: false,
              model: {
                //resources: this.columnGrids,
                template2: this.mfButton,
              },
            });
          }
        });
    }
  }
  ngAfterViewInit(): void {
    this.columnGrids = [
      {
        field: '',
        headerText: '',
        width: 40,
        template: this.gridMF,
        textAlign: 'center',
      },
    ];

    this.views = [
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        toolbarTemplate: this.footerButton,
        showSearchBar: false,
        showFilter: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          resourceModel: this.resourceField, //resource
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
    ];
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.codxEpService
        .getBookingByRecID(this.queryParams?.dataValue)
        .subscribe((res: any) => {
          if (res) {
            setInterval(() => this.navigate(res.startDate), 2000);
          }
        });
    }
    this.detectorRef.detectChanges();
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

  changeValueDate(evt: any) {}

  valueChange(evt: any, a?: any, type?: any) {}

  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          //Mới tạo
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: dời - mời - hủy
            func.functionID == 'EP4T1102' /*MF sửa*/ ||
            func.functionID == 'EP4T1101' /*MF xóa*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '5') {
        event.forEach((func) => {
          //Đã duyệt
          if (
            // Hiện: Mời - dời - Chép
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - duyệt - hủy
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '3') {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: dời - mời - chép - hủy
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt

            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '4') {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: còn lại
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: còn lại
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
    }
  }
  onActionClick(event?) {
    if (event.type == 'add' && event.data?.resourceId != null) {
      this.popupTitle = this.buttons.text + ' ' + this.funcIDName;
      this.addNew(event.data);
    }
    if (event.type == 'doubleClick' || event.type == 'edit') {
      this.edit(event.data);
    }
  }
  clickMF(event, data) {
    this.popupTitle = event?.text + ' ' + this.funcIDName;
    switch (event?.functionID) {
      case 'SYS02': //Xoa
        this.delete(data);
        break;
      case 'SYS03': //Sua.
        this.edit(data);
        break;
      case 'SYS04': //copy.
        this.copy(data);
        break;
      case 'EP4T1101': //Dời
        this.popupTitle = event?.text;
        this.reschedule(data);
        break;
      case 'EP4T1102': //Mời
        this.popupTitle = event?.text;
        this.invite(data);
        break;
      case 'EP4T1103': //Gửi duyệt
        this.release(data);
        break;
      case 'EP4T1104': //Hủy gửi duyệt
        this.cancel(data);
        break;
    }
  }
  release(data: any) {
    if (this.authService.userValue.userID != data?.owner) {
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
                data.approveStatus = '3';
                data.write = false;
                data.delete = false;
                this.view.dataService.update(data).subscribe();
              } else {
                this.notificationsService.notifyCode(res?.msgCodeError);
              }
            });
        });
    } else {
      data.approveStatus = '5';
      data.write = false;
      data.delete = false;
      this.view.dataService.update(data).subscribe();
      this.notificationsService.notifyCode('ES007');
      this.codxEpService
        .afterApprovedManual(this.formModel.entityName, data.recID, '5')
        .subscribe();
    }
  }

  cancel(data: any) {
    if (
      !this.codxEpService.checkRole(
        this.authService.userValue,
        data?.owner,
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
          this.notificationsService.notifyCode('SYS034'); //đã hủy gửi duyệt
          data.approveStatus = '0';
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
    let dialogReschedule = this.callfc.openForm(
      PopupRescheduleBookingComponent,
      '',
      550,
      400,
      this.funcID,
      [data, this.formModel, this.popupTitle]
    );
    dialogReschedule.closed.subscribe((x) => {
      this.popupClosed = true;
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
  }
  invite(data: any) {
    let host: any;
    if (data?.resources != null) {
      host = data?.resources.filter((res) => res.roleType == '1');
    }
    if (
      !this.codxEpService.checkRole(
        this.authService.userValue,
        data?.owner,
        this.isAdmin,
        host[0].userID
      )
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    let dialogInvite = this.callfc.openForm(
      PopupAddAttendeesComponent,
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
  }
  setPopupTitle(mfunc) {
    this.popupTitle = mfunc + ' ' + this.funcIDName;
  }

  setPopupTitleOption(mfunc) {
    this.popupTitle = mfunc;
  }

  addNew(evt?) {
    if (evt != null) {
      this.optionalData = evt;
    } else {
      this.optionalData = null;
    }
    if (this.popupClosed) {
      this.view.dataService.addNew().subscribe((res) => {
        this.popupClosed = false;
        this.dataSelected = this.view.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.view?.dataService;
        option.FormModel = this.formModel;
        let dialog = this.callFuncService.openSide(
          PopupAddBookingRoomComponent,
          [this.dataSelected, true, this.popupTitle, this.optionalData],
          option
        );
        dialog.closed.subscribe((returnData) => {
          this.popupClosed = true;
          if (!returnData.event) {
            this.view.dataService.clear();
          }
        });
      });
    }
  }

  edit(evt?) {
    if (evt) {
      if (
        !this.codxEpService.checkRole(
          this.authService.userValue,
          evt?.owner,
          this.isAdmin
        )
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
      if (this.popupClosed) {
        this.codxEpService
          .getBookingByRecID(evt?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.edit(booking).subscribe((res) => {
                this.popupClosed = false;
                let option = new SidebarModel();
                option.Width = '800px';
                this.view.dataService.dataSelected = booking;
                option.DataService = this.view?.dataService;
                option.FormModel = this.formModel;
                this.dialog = this.callFuncService.openSide(
                  PopupAddBookingRoomComponent,
                  [this.view.dataService.dataSelected, false, this.popupTitle],
                  option
                );
                this.dialog.closed.subscribe((returnData) => {
                  this.popupClosed = true;
                  if (!returnData.event) this.view.dataService.clear();
                });
              });
            }
          });
      }
    }
  }

  copy(evt?) {
    if (evt) {
      if (this.popupClosed) {
        this.codxEpService
          .getBookingByRecID(evt?.recID)
          .subscribe((booking) => {
            if (booking) {
              this.view.dataService.copy(booking).subscribe((res) => {
                this.popupClosed = false;
                let option = new SidebarModel();
                option.Width = '800px';
                this.view.dataService.dataSelected = booking;
                option.DataService = this.view?.dataService;
                option.FormModel = this.formModel;
                let dialogCopy = this.callFuncService.openSide(
                  PopupAddBookingRoomComponent,
                  [
                    this.view.dataService.dataSelected,
                    true,
                    this.popupTitle,
                    null,
                    true,
                  ],
                  option
                );
                dialogCopy.closed.subscribe((returnData) => {
                  this.popupClosed = true;
                  if (!returnData.event) this.view.dataService.clear();
                });
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
          deleteItem?.owner,
          this.isAdmin
        )
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
    }
    this.view.dataService.delete([deleteItem]).subscribe((res) => {});
  }

  connectToMeeting(
    meetingTitle: string,
    meetingDescription: string,
    meetingDuration: number,
    meetingPassword: string,
    userName: string,
    mail: string,
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
      .subscribe((url) => {
        if (url) {
          window.open(url, '_blank');
        }
      });
  }

  closeAddForm(event) {}
}
