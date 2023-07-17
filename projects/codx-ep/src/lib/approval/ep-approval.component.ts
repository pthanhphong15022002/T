import {
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../codx-ep.service';
import { EPCONST } from '../codx-ep.constant';
import { ActivatedRoute } from '@angular/router';
import { PopupDriverAssignComponent } from './popup-driver-assign/popup-driver-assign.component';
import { DriverModel } from '../models/bookingAttendees.model';
import { ResourceTrans } from '../models/resource.model';
import { PopupAddCardTransComponent } from '../booking/cardTran/popup-add-cardTrans/popup-add-cardTrans.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'ep-approval',
  templateUrl: 'ep-approval.component.html',
  styleUrls: ['ep-approval.component.scss'],
})
export class EPApprovalComponent extends UIComponent {
  //Input
  @Input() funcID: string;
  @Input() queryParams: any;
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
  className = 'BookingsBusiness';
  method = 'GetListApprovalAsync';
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
  resourceType: string;
  isAllocateStationery = false;
  fields;
  itemSelected: any;
  resourceField;
  dataSelected: any;
  approvalRule = '0';
  cbbDriver = [];
  listDriverAssign = [];

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private codxShareService: CodxShareService,
    private activatedRoute: ActivatedRoute,
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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getBaseVariable();
    this.getCacheData();
  }
  ngAfterViewInit(): void {
    this.getView();
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getBaseVariable() {
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

    switch (this.funcID) {
      case EPCONST.FUNCID.R_Approval:
        this.resourceType = EPCONST.VLL.ResourceType.Room;
        break;
      case EPCONST.FUNCID.C_Approval:
        this.resourceType = EPCONST.VLL.ResourceType.Car;
        break;
      case EPCONST.FUNCID.S_Approval:
        this.resourceType = EPCONST.VLL.ResourceType.Stationery;
        break;
    }
  }
  getCacheData(): void {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
  }
  getView() {
    if (
      this.funcID == EPCONST.FUNCID.R_Approval ||
      this.funcID == EPCONST.FUNCID.C_Approval
    ) {
      this.getSchedule();
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
        {
          sameData: false,
          type: ViewType.schedule,
          active: false,
          request2: this.scheduleHeader,
          request: this.scheduleEvent,
          //toolbarTemplate:this.footerButton,
          showSearchBar: false,
          showFilter: false,
          model: {
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
      ];      
      this.navigateSchedule();
    } else if (this.funcID == EPCONST.FUNCID.S_Approval) {
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
    }
  }
  getSchedule() {
    //lấy list booking để vẽ schedule
    this.scheduleEvent = new ResourceModel();
    this.scheduleEvent.assemblyName = 'EP';
    this.scheduleEvent.className = 'BookingsBusiness';
    this.scheduleEvent.service = 'EP';
    this.scheduleEvent.method = 'GetListApprovalAsync';
    //this.scheduleEvent.method = 'GetListApprovalScheduleAsync';
    this.scheduleEvent.idField = 'recID';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.scheduleEvent.predicate = this.queryParams?.predicate;
      this.scheduleEvent.dataValue = this.queryParams?.dataValue;
    }
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
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  viewChanged(evt: any) {
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.getBaseVariable();
    this.getView();
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
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
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
      } else if (data?.stepType == 'I' && (data?.approveStatus == '5' &&  data?.issueStatus != '1') || (data?.approveStatus == '4') ) {
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
  clickMF(evt: any, data: any) {
    let funcID = evt?.functionID;
    switch (funcID) {
      case EPCONST.MFUNCID.R_Approval:
      case EPCONST.MFUNCID.C_Approval:
      case EPCONST.MFUNCID.S_Approval:
        {
          this.approve(data);
        }
        break;
      case EPCONST.MFUNCID.R_Reject:
      case EPCONST.MFUNCID.C_Reject:
      case EPCONST.MFUNCID.S_Reject:
        {
          this.reject(data);
        }
        break;
      case EPCONST.MFUNCID.R_Undo:
      case EPCONST.MFUNCID.C_Undo:
      case EPCONST.MFUNCID.S_Undo:
        {
          this.undo(data);
        }
        break;
      case EPCONST.MFUNCID.C_CardTrans:
        {
          this.popupTitle = evt?.text;
          this.cardTrans(data);
        }
        break;
      case EPCONST.MFUNCID.C_DriverAssign:
        {
          this.popupTitle = evt?.text;
          this.assignDriver(data);
        }
        break;
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  undo(data: any) {
    this.codxShareService.codxUndo(data?.approvalTransRecID,null).subscribe((res: any) => {
      if (res != null) {
        this.notificationsService.notifyCode('SYS034'); //đã thu hồi
        data.approveStatus = '3';
        this.view.dataService.update(data).subscribe();
      } else {
        this.notificationsService.notifyCode(res?.msgCodeError);
      }
    });
  }

  approve(data: any) {
    this.codxShareService
      .codxApprove(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '5',
        null,
        null,
        null,
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt          
          //nếu bước duyệt VPP hiện tại là Cấp phát thì đổi IssueStatus
          if (data?.stepType != 'I') {
            data.approveStatus = '5';
          }
          else{
            data.issueStatus = '3';            
          }
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  reject(data: any) {
    this.codxShareService
      .codxApprove(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '4',
        null,
        null,
        null,
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
          //nếu bước duyệt VPP hiện tại là Cấp phát thì đổi IssueStatus
          if (data?.stepType != 'I') {
            data.approveStatus = '4';
          }
          else{
            data.issueStatus = '4';            
          }
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  navigateSchedule() {
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.codxEpService
        .getApproveByRecID(this.queryParams?.dataValue)
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
  setPopupTitleOption(mfunc) {
    this.popupTitle = mfunc;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  assignDriver(data: any) {
    let startDate = new Date(data?.startDate);
    let endDate = new Date(data?.endDate);
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
          let popupDialog = this.callfc.openForm(
            PopupDriverAssignComponent,
            '',
            550,
            250,
            this.funcID,
            [data, this.popupTitle, this.cbbDriver]
          );
          popupDialog.closed.subscribe((x) => {
            if (!x?.event) this.view.dataService.clear();
            else {
              this.view.dataService.update(x?.event).subscribe();
            }
          });
        }
      });
  }

  cardTrans(data: any) {
    let curTran = new ResourceTrans();
    let dialog = this.callfc.openForm(
      PopupAddCardTransComponent,
      '',
      550,
      550,
      EPCONST.FUNCID.CA_Get,
      [curTran, EPCONST.FUNCID.CA_Get, this.popupTitle]
    );
  }
}
