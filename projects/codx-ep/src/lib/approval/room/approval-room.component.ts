import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  DialogRef,
  FormModel,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
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
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  modelResource?: ResourceModel;
  request?: ResourceModel;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
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
  
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
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
    this.request=new ResourceModel();
    this.request.assemblyName='EP';
    this.request.className='BookingsBusiness';
    this.request.service='EP';
    this.request.method='GetEventsAsync';
    this.request.predicate='ResourceType=@0';
    this.request.dataValue='1';
    this.request.idField='recID';

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
        sameData:false,
        type:ViewType.schedule,
        active:true,
        request2:this.modelResource,
        request:this.request,
        toolbarTemplate:this.footerButton,
        showSearchBar:false,
        model:{
          //panelLeftRef:this.panelLeft,
          eventModel:this.fields,
          resourceModel:this.resourceField,//resource
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          template5: this.resourceTootip,//tooltip

          template6: this.footerButton,//header          
          //template8: this.contentTmp,//content
          //template7: this.footerButton,//footer
          statusColorRef:'vl003'
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  click(event) {}

  edit(evt?) {
    if (evt) {
      this.view.dataService.dataSelected = evt;
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((res) => {
          debugger;
          this.dataSelected = this.view.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.view?.formModel;
          this.dialog = this.callfc.openSide(
            PopupAddBookingRoomComponent,
            [this.views.dataService.dataSelected, false],
            option
          );
        });
    }
  }

  delete(evt?) {
    let deleteItem = this.view.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.view.dataService.delete([deleteItem]).subscribe();
  }

  clickMF(event, data) {
    switch (event?.functionID) {
      case 'EPT40101': //duyet
        this.edit(data);
        break;

      case 'EPT40102': //ki
        //this.delete(data);
        break;

      case 'EPT40103': //dong thuan
        //this.delete(data);
        break;

      case 'EPT40104': //dong dau
        //this.delete(data);
        break;

      case 'EPT40105': //tu choi
        //this.delete(data);
        break;

      case 'EPT40106': //lam lai
        //this.delete(data);
        break;

      case 'SYS02': //Xoa
        this.delete(data);
        break;

      case 'SYS03': //Sua.
        this.edit(data);
        break;
    }
  }

  closeAddForm(event) {}

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  getDetailBooking(event) {
    this.api
      .exec<any>(
        'EP',
        'BookingsBusiness',
        'GetBookingByIDAsync',
        this.itemDetail?.recID
      )
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.detectorRef.detectChanges();
        }
      });
  }
}
