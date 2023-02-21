import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { DriverModel } from '../../models/bookingAttendees.model';
import { PopupDriverAssignComponent } from './popup-driver-assign/popup-driver-assign.component';
import moment from 'moment';

@Component({
  selector: 'approval-car',
  templateUrl: 'approval-car.component.html',
  styleUrls: ['approval-car.component.scss'],
})
export class ApprovalCarsComponent extends UIComponent {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('driverAssign') driverAssign: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  className = 'BookingsBusiness';
  method = 'GetListApprovalAsync';
  cbbDriver: DriverModel[] = [];
  idField = 'recID';

  // [entityName]="'ES_ApprovalTrans'"
  // [method]="'LoadDataAsync'"
  // [assemblyName]="'Core'"
  // [service]="'ES'"
  // [className]="'DataBusiness'"
  // [selectedFirst]="true"
  // idField="recID"

  modelResource?: ResourceModel;
  request?: ResourceModel;
  itemDetail;
  resourceField;
  dataSelected: any;
  popupDialog: any;
  dialog!: DialogRef;
  formModel: FormModel;
  viewType = ViewType;
  driverID: any;
  listDriverAssign = [];
  driver: any;
  fields: any;
  popupTitle: any;

  listCar = [];
  listReason = [];
  listAttendees = [];
  listItem = [];
  tempReasonName = '';
  tempCarName = '';
  tempAttendees = '';
  selectBookingItems = [];
  selectBookingAttendees = '';
  listDriver: any[];
  tempDriverName = '';
  driverName = '';
  queryParams: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService
  ) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];

    this.queryParams = this.router.snapshot.queryParams;
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetListApprovalAsync';
    this.request.idField = 'recID';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.request.predicate = this.queryParams?.predicate;
      this.request.dataValue = this.queryParams?.dataValue;
    }

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '2';

    this.fields = {
      id: 'recID',
      subject: { name: 'title' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'resourceID' },
      code: { name: 'code' },
      status: 'approveStatus',
    };

    this.resourceField = {
      Name: 'Resources',
      Field: 'resourceID',
      IdField: 'resourceID',
      TextField: 'resourceName',
      Title: 'Resources',
    };
    this.codxEpService.getListResource('2').subscribe((res: any) => {
      if (res) {
        this.listCar = [];
        this.listCar = res;
      }
    });
    this.codxEpService.getListResource('3').subscribe((res: any) => {
      if (res) {
        this.listDriver = [];
        this.listDriver = res;
      }
    });
    this.codxEpService.getListReason('EP_BookingCars').subscribe((res: any) => {
      if (res) {
        this.listReason = [];
        this.listReason = res;
      }
    });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelRightRef: this.panelRight,
        },
      },
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        //toolbarTemplate: this.footerButton,
        showSearchBar: false,
        showFilter: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          template: this.cardTemplate,
          resourceModel: this.resourceField,
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          //template5: this.resourceTootip,
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          statusColorRef: 'EP022',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }
  getMoreInfo(recID: any) {
    this.selectBookingAttendees = '';
    this.driverName = ' ';
    let driverCheck = true;
    this.codxEpService.getListAttendees(recID).subscribe((attendees: any) => {
      if (attendees) {
        let lstAttendees = attendees;
        lstAttendees.forEach((element) => {
          if (element.roleType != '2') {
            this.selectBookingAttendees =
              this.selectBookingAttendees + element.userID + ';';
          } else {
            this.driverName = this.getDriverName(element.userID);
          }
        });
        this.selectBookingAttendees;

        if (this.driverName == ' ') {
          this.driverName = null;
        }
      }
    });
  }
  getResourceName(resourceID: any) {
    this.tempCarName = '';
    this.listCar.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempCarName = r.resourceName;
      }
    });
    return this.tempCarName;
  }
  getDriverName(resourceID: any) {
    this.tempDriverName = '';
    this.listDriver.forEach((r) => {
      if (r.resourceID == resourceID) {
        this.tempDriverName = r.resourceName;
      }
    });
    return this.tempDriverName;
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

  click(event) {}

  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40201': //Duyệt
        {
          // if(datas.allowToApprove == true){

          this.approve(datas, '5');
          // }
          // else{

          //   this.notificationsService.notifyCode('EP020');
          //   return;
          // }
        }
        break;
      case 'EPT40202': //Từ chối
        {
          this.approve(datas, '4');
        }
        break;
      case 'EPT40204': {
        //Phân công tài xế
        this.popupTitle = value.text;
        this.assignDriver(datas);
        break;
      }
      case 'EPT40206':
        {
          //alert('Thu hồi');
          this.undo(datas);
        }
        break;
    }
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS04' /*Copy*/ ||
          func.functionID == 'EPT40203'
        ) {
          func.disabled = true;
        }
      });
      if (data.approveStatus == '3') {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40201' /*MF Duyệt*/ ||
            func.functionID == 'EPT40202' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
          if (
            func.functionID == 'EPT40204' /*MF phân công tài xế*/ ||
            func.functionID == 'EPT40206' /*Thu hoi*/
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40201' /*MF Duyệt*/ ||
            func.functionID == 'EPT40202' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
          if (func.functionID == 'EPT40204') {
            func.disabled = false;
          }
          if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
            
            let havedDriver = false;
            if(data?.resources){              
              for (let i = 0; i < data?.resources.length; i++) {
                if (data?.resources[i].roleType == '2') {
                  havedDriver = true;                  
                }
              }
            }            
            if (!havedDriver) {
              func.disabled = false;
            } else {
              func.disabled = true;
            }
          }
        });
      }
    }
  }
  undo(data: any) {
    this.codxEpService.undo(data?.approvalTransRecID).subscribe((res: any) => {
      if (res != null) {
        this.notificationsService.notifyCode('SYS034'); //đã thu hồi
        data.approveStatus = '3';
        data.status = '3';
        this.view.dataService.update(data).subscribe();
      } else {
        this.notificationsService.notifyCode(res?.msgCodeError);
      }
    });
  }
  approve(data: any, status: string) {
    this.codxEpService
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .approve(
            data?.approvalTransRecID, //ApprovelTrans.RecID
            status,
            '',
            ''
          )
          .subscribe((res: any) => {
            if (res?.msgCodeError == null && res?.rowCount >= 0) {
              if (status == '5') {
                this.notificationsService.notifyCode('SYS034'); //đã duyệt
                data.approveStatus = '5';
                data.status = '5';
              }
              if (status == '4') {
                this.notificationsService.notifyCode('SYS034'); //bị hủy
                data.approveStatus = '4';
                data.status = '4';
              }

              this.view.dataService.update(data).subscribe();
            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);
            }
          });
      });
  }
  setPopupTitle(data: any) {
    if (data) {
      this.popupTitle = data;
    }
  }
  assignDriver(data: any) {
    let startDate = new Date(data.startDate);
    let endDate = new Date(data.endDate);
    this.codxEpService
      .getAvailableDriver(startDate.toUTCString(), endDate.toUTCString())
      .subscribe((res: any) => {
        if (res) {
          this.cbbDriver = [];
          this.listDriverAssign = res;
          this.listDriverAssign.forEach((dri) => {
            var tmp = new DriverModel();
            tmp['driverID'] = dri.resourceID;
            tmp['driverName'] = dri.resourceName;
            this.cbbDriver.push(tmp);
          });
          this.popupDialog = this.callfc.openForm(
            PopupDriverAssignComponent,
            '',
            550,
            250,
            this.funcID,
            [
              this.view.dataService.dataSelected,
              this.popupTitle,
              this.view.dataService,
              this.cbbDriver,
            ]
          );
          this.dialog.closed.subscribe((x) => {
            if (!x.event) this.view.dataService.clear();
            else {
              this.view.dataService.update(x.event).subscribe();
            }
          });
        }
      });
  }

  cbxChange(evt: any) {}
  closeAddForm(event) {}

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

 
  sameDayCheck(sDate: any, eDate: any) {
    if (sDate && eDate) {
      return moment(new Date(sDate)).isSame(new Date(eDate), 'day');
    }
    return false;
  }
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  updateStatus(data: any) {
    this.view.dataService.update(data).subscribe();
  }
}
