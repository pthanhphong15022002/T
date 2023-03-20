import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  CRUDService,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { FuncID } from '../../models/enum/enum';

@Component({
  selector: 'approval-room',
  templateUrl: 'approval-room.component.html',
  styleUrls: ['approval-room.component.scss'],
})
export class ApprovalRoomsComponent extends UIComponent {
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('titleTmp') titleTmp?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;

  @ViewChild('subTitle') subTitle?: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  views: Array<ViewModel> | any = [];
  modelResource?: ResourceModel;
  request?: ResourceModel;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  className = 'BookingsBusiness';
  method = 'GetListApprovalAsync';
  idField = 'recID';
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  formModel: FormModel;
  button;
  fields;
  itemSelected: any;
  resourceField;
  dataSelected: any;
  dialog!: DialogRef;
  viewType = ViewType;
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
  private approvalRule = '0';
  private autoApproveItem = '0';
  grView: any;

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
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
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

    this.button = {
      id: 'btnAdd',
    };

    this.codxEpService.getEPStationerySetting('1').subscribe((res: any) => {
      if (res) {
        let dataValue = res.dataValue;
        let json = JSON.parse(dataValue);
        this.autoApproveItem = json.AutoApproveItem;
      }
    });

    this.codxEpService
      .getEPStationerySetting('4')
      .subscribe((approvalSetting: any) => {
        if (approvalSetting) {
          this.approvalRule = JSON.parse(
            approvalSetting.dataValue
          )[0]?.ApprovalRule;
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
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        //toolbarTemplate:this.footerButton,
        showSearchBar: false,
        showFilter: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          template: this.cardTemplate,
          resourceModel: this.resourceField, //resource
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
    this.detectorRef.detectChanges();
  }

  click(event) {}

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
            func.functionID == 'EPT40101' /*MF Duyệt*/ ||
            func.functionID == 'EPT40105' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
          if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40101' /*MF Duyệt*/ ||
            func.functionID == 'EPT40105' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
          if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
            func.disabled = false;
          }
        });
      }
    }
  }
  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40101':
        {
          //alert('Duyệt');
          this.approve(datas);
        }
        break;
      case 'EPT40105':
        {
          //alert('Từ chối');
          this.reject(datas);
        }
        break;
      case 'EPT40106':
        {
          //alert('Thu hồi');
          this.undo(datas);
        }
        break;
    }
  }
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

  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }

  closeAddForm(event) {}

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
}
