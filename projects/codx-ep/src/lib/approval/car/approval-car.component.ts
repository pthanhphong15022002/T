import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  DialogRef,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddBookingCarComponent } from '../../booking/car/popup-add-booking-car/popup-add-booking-car.component';

@Component({
  selector: 'approval-car',
  templateUrl: './approval-car.component.html',
  styleUrls: ['./approval-car.component.scss'],
})
export class ApprovalCarsComponent extends UIComponent {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  predicate = 'ResourceType=@0';
  datavalue = '2';
  idField = 'recID';
  modelResource?: ResourceModel;
  request?: ResourceModel;
  itemDetail;
  resourceField;
  fields;
  dataSelected: any;
  dialog!: DialogRef;

  constructor(private injector: Injector) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.request=new ResourceModel();
    this.request.assemblyName='EP';
    this.request.className='BookingsBusiness';
    this.request.service='EP';
    this.request.method='GetEventsAsync';
    this.request.predicate='ResourceType=@0';
    this.request.dataValue='2';
    this.request.idField='recID';


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
          resourceModel:this.resourceField,
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          template5: this.resourceTootip,
          template6: this.footerTemplate,
          template7: this.footerButton,
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
            PopupAddBookingCarComponent,
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
