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
  cbbDriver: DriverModel[]=[];
  idField = 'recID';

  // [entityName]="'ES_ApprovalTrans'"
  // [method]="'LoadDataAsync'"
  // [assemblyName]="'CM'"
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
  viewType=ViewType;
  driverID:any;
  listDriver=[];
  driver:any;
  fields:any;
  popupTitle: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService
  ) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];
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

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '2';

    this.fields = {
      id: 'bookingNo',
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
        showFilter:false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          template:this.cardTemplate,
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

  click(event) {}

  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40201': //Duyệt
        {
          this.approve(datas, '5');
        }
        break;
      case 'EPT40202': //Từ chối
        {
          this.approve(datas, '4');
        }
        break;
      case 'EPT40204': {
        //Phân công tài xế
        this.popupTitle=value.text;
        this.assignDriver(datas);
        break;
      }
      default:
        '';
        break;
    }
  }
  
  approve(data: any, status: string) {
    this.codxEpService
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .approve(
            data?.approvalTransRecID, //ApprovelTrans.RecID
            status
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
  setPopupTitle(data:any){
    if(data){
      this.popupTitle=data;
    }
  }
  assignDriver(data: any) {
    let startDate= new Date(data.startDate);
    let endDate= new Date(data.endDate);
    this.codxEpService.getAvailableDriver(startDate.toUTCString(), endDate.toUTCString())
    .subscribe((res:any)=>{
      if(res){
        this.cbbDriver=[];
        this.listDriver = res;
        this.listDriver.forEach(dri=>{
          var tmp = new DriverModel();
          tmp['driverID'] = dri.resourceID;
          tmp['driverName'] = dri.resourceName;
          this.cbbDriver.push(tmp);
        })
        this.popupDialog = this.callfc.openForm(
          PopupDriverAssignComponent,'',550,250,this.funcID,
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
    })       
  }

  cbxChange(evt:any){}
  closeAddForm(event) {}

  changeItemDetail(event) {
    this.itemDetail = event?.data;
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
          if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
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
          if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
            if(data.status==5 && data.driverName==null)
              func.disabled = false;
            else{
              func.disabled = true;
            }
          }
        });
      }
    }
  }
  sameDayCheck(sDate:any, eDate:any){
    if(sDate && eDate){
      return moment(new Date(sDate)).isSame(new Date(eDate),'day');
    }
    return false;
  }
  showHour(date:any){
    let temp= new Date(date);
    let time =
          ('0' + temp.getHours()).toString().slice(-2) +
          ':' +
          ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  updateStatus(data: any) {
    this.view.dataService.update(data).subscribe();
  }
  getDetailApprovalBooking(id: any) {
    this.api
      .exec<any>('EP', 'BookingsBusiness', 'GetApprovalBookingByIDAsync', [
        this.itemDetail?.recID,
        this.itemDetail?.approvalTransRecID,
      ])
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.detectorRef.detectChanges();
        }
      });
  }

  setStyles(resourceType) {
    let styles = {};
    switch (resourceType) {
      case '1':
        styles = {
          backgroundColor: '#104207',
          color: 'white',
        };
        break;
      case '2':
        styles = {
          backgroundColor: '#29b112',
          color: 'white',
        };
        break;
      case '6':
        styles = {
          backgroundColor: '#053b8b',
          color: 'white',
        };
        break;
      default:
        styles = {};
        break;
    }

    return styles;
  }

  setIcon(resourceType) {
    let icon: string = '';
    switch (resourceType) {
      case '1':
        icon = 'icon-calendar_today';
        break;
      case '2':
        icon = 'icon-directions_car';
        break;
      case '6':
        icon = 'icon-desktop_windows';
        break;
      default:
        icon = '';
        break;
    }

    return icon;
  }
}
