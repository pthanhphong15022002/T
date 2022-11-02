import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  CRUDService,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddBookingRoomComponent } from '../../booking/room/popup-add-booking-room/popup-add-booking-room.component';
import { CodxEpService } from '../../codx-ep.service';

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
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListApprovalAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  datavalue = '1';
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
  tempReasonName = '';

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    
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
    this.request.predicate = 'ResourceType=@0';
    this.request.dataValue = '1';
    this.request.idField = 'recID';

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
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          resourceModel: this.resourceField, //resource
          //template2:this.titleTmp,
          template4: this.resourceHeader,
          //template5: this.resourceTootip,//tooltip
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          //template7: this.footerButton,//footer
          statusColorRef: 'vl003',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(event) {}

  clickMF(value, datas: any = null) {
    
    let funcID = value?.functionID;
    // if (!datas) datas = this.data;
    // else {
    //   var index = this.view.dataService.data.findIndex((object) => {
    //     return object.recID === datas.recID;
    //   });
    //   datas = this.view.dataService.data[index];
    // }
    switch (funcID) {
      case 'EPT40101':
        {
          //alert('Duyệt');
          this.approve(datas,"5")
        }
        break;      
      case 'EPT40105':
        {
          //alert('Từ chối');
          this.approve(datas,"4")
        }
        break;
      
      default:
        '';
        break;
    }
  }
  approve(data:any, status:string){
    this.codxEpService
    .approve(            
      data?.approvalTransRecID,//ApprovelTrans.RecID
      status,
    )
    .subscribe((res:any) => {
      if (res?.msgCodeError == null && res?.rowCount>=0) {
        if(status=="5"){
          this.notificationsService.notifyCode('ES007');//đã duyệt
          data.status="5"
        }
        if(status=="4"){
          this.notificationsService.notifyCode('ES007');//bị hủy
          data.status="4";
        }                          
        this.view.dataService.update(data).subscribe();
      } else {
        this.notificationsService.notifyCode(res?.msgCodeError);
      }
    });
     
  }
  changeDataMF(event, data:any) {        
    if(event!=null && data!=null){
      event.forEach(func => {       
        if(func.functionID == "SYS04"/*Copy*/) 
        {
          func.disabled=true;        
        }
      });
      if(data.status=='3'){
        event.forEach(func => {
          if(func.functionID == "EPT40101" /*MF Duyệt*/ || func.functionID == "EPT40105"/*MF từ chối*/ )
          {
            func.disabled=false;
          }
        });  
      }
      else{
        event.forEach(func => {
          if(func.functionID == "EPT40101" /*MF Duyệt*/ || func.functionID == "EPT40105"/*MF từ chối*/)
          {
            func.disabled=true;
          }
        });  
      }
    }
  }
  updateStatus(data:any)
  {
    this.view.dataService.update(data).subscribe();
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
    this.getDetailApprovalBooking(recID);
  }
  
  getDetailApprovalBooking(id: any) {
    this.api
      .exec<any>(
        'EP',
        'BookingsBusiness',
        'GetApprovalBookingByIDAsync',
        [this.itemDetail?.recID,this.itemDetail?.approvalTransRecID]
      )
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
