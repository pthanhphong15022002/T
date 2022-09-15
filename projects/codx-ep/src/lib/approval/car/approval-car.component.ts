import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';

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
  method = 'GetListBookingStationeryAsync';
  predicate = 'ResourceType=@0';
  datavalue = '2';
  idField = 'recID';
  modelResource?: ResourceModel;
  request?: ResourceModel;
  itemDetail;
  resourceField;
  fields;

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
      code:{name:'code'},
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

  clickMF(event, data) {
    console.log(event);
    switch (event?.functionID) {
      // case 'SYS03':
      //   this.edit(data);
      //   break;
      // case 'SYS02':
      //   this.delete(data);
      //   break;
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
