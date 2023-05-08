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

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
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
    if (
      this.funcID == EPCONST.FUNCID.R_Approval ||
      this.funcID == EPCONST.FUNCID.C_Approval
    ) {
      this.getSchedule();
    }
  }
  ngAfterViewInit(): void {
    if (
      this.funcID == EPCONST.FUNCID.R_Approval ||
      this.funcID == EPCONST.FUNCID.C_Approval
    ) {
      this.views = [
        {
          id: '1',
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
          active: true,
          request2: this.scheduleHeader,
          request: this.scheduleEvent,
          //toolbarTemplate:this.footerButton,
          showSearchBar: false,
          showFilter: false,
          model: {
            //panelLeftRef:this.panelLeft,
            eventModel: this.scheduleHeaderModel,
            resourceModel: this.scheduleHeaderModel, //resource
            template: this.cardTemplate,
            //template2:this.titleTmp,
            template4: this.resourceHeader,
            //template5: this.resourceTootip,//tooltip
            template6: this.mfButton, //header
            template8: this.contentTmp, //content
            //template7: this.footerButton,//footer
            statusColorRef: 'EP022',
          },
        },
      ];
    } else if (this.funcID == EPCONST.FUNCID.S_Approval) {
      this.views = [
        {
          id: '1',
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
        this.resourceType = '1';
        break;
      case EPCONST.FUNCID.C_Approval:
        this.resourceType = '2';
        break;

      case EPCONST.FUNCID.S_Approval:
        this.resourceType = '6';
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
  getSchedule() {
    //lấy list booking để vẽ schedule
    this.scheduleEvent = new ResourceModel();
    this.scheduleEvent.assemblyName = 'EP';
    this.scheduleEvent.className = 'BookingsBusiness';
    this.scheduleEvent.service = 'EP';
    this.scheduleEvent.method = 'GetListApprovalAsync';
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
        if (func.functionID == 'SYS04' /*Copy*/) {
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
            func.functionID == EPCONST.MFUNCID.S_Undo
          ) {
            func.disabled = true;
          }
        });
      } else {
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
        });
      }
    }
  }
  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case EPCONST.MFUNCID.R_Approval:
      case EPCONST.MFUNCID.R_Approval:
      case EPCONST.MFUNCID.R_Approval:
        {
          this.approve(datas);
        }
        break;
      case EPCONST.MFUNCID.R_Reject:
      case EPCONST.MFUNCID.C_Reject:
      case EPCONST.MFUNCID.S_Reject:
        {
          this.reject(datas);
        }
        break;
      case EPCONST.MFUNCID.R_Undo:
      case EPCONST.MFUNCID.C_Undo:
      case EPCONST.MFUNCID.S_Undo:
        {
          this.undo(datas);
        }
        break;
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  undo(data: any) {
    this.codxEpService.undo(data?.approvalTransRecID).subscribe((res: any) => {
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
    this.codxEpService
      .approve(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '5',
        '',
        ''
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
          data.approveStatus = '5';
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  reject(data: any) {
    this.codxEpService
      .approve(
        data?.approvalTransRecID, //ApprovelTrans.RecID
        '4',
        '',
        ''
      )
      .subscribe((res: any) => {
        if (res?.msgCodeError == null && res?.rowCount >= 0) {
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
          data.approveStatus = '4';
          this.view.dataService.update(data).subscribe();
        } else {
          this.notificationsService.notifyCode(res?.msgCodeError);
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
}
