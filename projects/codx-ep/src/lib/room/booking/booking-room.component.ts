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
    //lấy list booking để vẽ schedule
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetListBookingAsync';
    this.request.predicate = 'ResourceType=@0';
    this.request.dataValue = '1';
    this.request.idField = 'recID';
    //lấy list resource vẽ header schedule
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '1';

    this.fields = {
      id: 'bookingNo',
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

    this.codxEpService.getListResource('1').subscribe((res: any) => {
      if (res) {
        this.listRoom = [];
        this.listRoom = res;
      }
    });
    this.codxEpService
      .getListReason('EP_BookingRooms')
      .subscribe((res: any) => {
        if (res) {
          this.listReason = [];
          this.listReason = res;
        }
      });
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteBookingAsync';
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
      // {
      //   sameData: true,
      //   type: ViewType.content,
      //   active: false,
      //   model: {
      //     panelLeftRef: this.chart,
      //   },
      // },
    ];
    this.detectorRef.detectChanges();
  }
  getResourceName(resourceID: any) {
    this.tempRoomName = '';
    this.listRoom.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempRoomName = r.resourceName;
      }
    });
    return this.tempRoomName;
  }
  getReasonName(reasonID: any) {
    this.tempReasonName = '';
    this.listReason.forEach((r) => {
      if (r.reasonID == reasonID) {
        this.tempReasonName = r.description;
      }
    });
    return this.tempReasonName;
  }
  getMoreInfo(recID: any) {
    this.selectBookingItems = [];
    this.selectBookingAttendees = '';

    this.codxEpService.getListItems(recID).subscribe((item: any) => {
      if (item) {
        this.selectBookingItems = item;
      }
    });
    this.codxEpService.getListAttendees(recID).subscribe((attendees: any) => {
      if (attendees) {
        let lstAttendees = attendees;
        lstAttendees.forEach((element) => {
          this.selectBookingAttendees =
            this.selectBookingAttendees + element.userID + ';';
        });
        this.selectBookingAttendees;
      }
    });
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
      // event.forEach((func) => {
      //   func.disabled = true;
      // });
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/||            
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          } 

          if (            
            func.functionID == 'EP4T1102' /*MF sửa*/ ||
            func.functionID == 'EP4T1101' /*MF xóa*/ 
          ) {
            func.disabled = true;
          }

        });
      } else if(data.approveStatus == '5' || data.approveStatus == '3'){
        event.forEach((func) => {
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = true;
          }
          if (            
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
        });
      } else{
        event.forEach((func) => {
          if (func.functionID == 'SYS04' /*MF chép*/) {
            func.disabled = false;
          }
          if (                
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ 
          ) {
            func.disabled = true;
          }
        });
      }
    }
  }
  onActionClick(evt?) {
    if (evt.type == 'add') {
      this.addNew(evt.data);
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
    }
  }
  release(data: any) {
    if (
      this.authService.userValue.userID != data?.owner 
      //&& !this.authService.userValue.administrator
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    if(data.approval!='0'){
      this.codxEpService
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .release(
            data,
            res?.processID,
            'EP_Bookings',
            this.funcID
          )
          .subscribe((res) => {
            if (res?.msgCodeError == null && res?.rowCount) {
              this.notificationsService.notifyCode('ES007');
              data.approveStatus = '3';
              data.status = '3';
              data.write = false;
              data.delete = false;
              this.view.dataService.update(data).subscribe();    

            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);              
            }
          });
      });
    }
    else
    {
      data.approveStatus = '5';
      data.status = '5';
      data.write = false;
      data.delete = false;
      this.view.dataService.update(data).subscribe(); 
      this.notificationsService.notifyCode('ES007');
      this.codxEpService.afterApprovedManual(this.formModel.entityName, data.recID,'5').subscribe();
      
    }
    
  }
  reschedule(data: any) {
    if (
      this.authService.userValue.userID != data?.owner &&
      !this.authService.userValue.administrator
    ) {
      this.notificationsService.notifyCode('TM052');
      return;
    }
    let dialogReschedule = this.callfc.openForm(
      PopupRescheduleBookingComponent,
      '',
      550,
      300,
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
    if (
      this.authService.userValue.userID != data?.owner &&
      !this.authService.userValue.administrator
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
        this.authService.userValue.userID != evt?.owner &&
        !this.authService.userValue.administrator
      ) {
        this.notificationsService.notifyCode('TM052');
        return;
      }
      if (this.popupClosed) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view.dataService.dataSelected;
            let option = new SidebarModel();
            option.Width = '800px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialog = this.callFuncService.openSide(
              PopupAddBookingRoomComponent,
              [this.view.dataService.dataSelected, false, this.popupTitle],
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
  }

  copy(evt?) {
    if (evt) {
      if (this.popupClosed) {
        this.view.dataService.dataSelected = evt;
        this.view.dataService
          .copy(this.view.dataService.dataSelected)
          .subscribe((res) => {
            this.popupClosed = false;
            this.dataSelected = this.view.dataService.dataSelected;
            let option = new SidebarModel();
            option.Width = '800px';
            option.DataService = this.view?.dataService;
            option.FormModel = this.formModel;
            let dialog = this.callFuncService.openSide(
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
            dialog.closed.subscribe((returnData) => {
              this.popupClosed = true;
              if (!returnData.event) {
                this.view.dataService.clear();
              }
            });
          });
      }
    }
  }

  delete(evt?) {
    let deleteItem = this.view.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
      if (
        this.authService.userValue.userID != evt?.owner &&
        !this.authService.userValue.administrator
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
      .then((url) => {
        if (url) {
          window.open(url, '_blank');
        }
      });
  }

  closeAddForm(event) {}
}
