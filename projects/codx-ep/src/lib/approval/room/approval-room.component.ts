import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { DialogRef, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddBookingRoomComponent } from '../../booking/room/popup-add-booking-room/popup-add-booking-room.component';

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
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  modelResource?: ResourceModel;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingStationeryAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  datavalue = '1';
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;
  fields;
  itemSelected: any;
  resourceField;

  dataSelected: any;
  dialog!: DialogRef;
  constructor(private injector: Injector) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
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
        id: '2',
        sameData: true,
        type: ViewType.schedule,
        active: false,
        request2: this.modelResource,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template4: this.resourceHeader,
          template5: this.resourceTootip,
          template6: this.footerTemplate,
          template7: this.footerButton,
          //statusColorRef: "vl003"
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

  clickMF(event, data) {
    console.log(event);
    switch (event?.functionID) {
      case 'EPT40101'://duyet
        this.edit(data);
        break;

      case 'EPT40102'://ki
        //this.delete(data);
        break;

      case 'EPT40103'://dong thuan
        //this.delete(data);
        break; 

      case 'EPT40104'://dong dau
        //this.delete(data);
        break; 

      case 'EPT40105'://tu choi
        //this.delete(data);
        break; 

      case 'EPT40106'://lam lai
        //this.delete(data);
        break;
        
      case 'SYS02'://Xoa
      //this.delete(data);
      break; 

      case 'SYS03'://Sua
        //this.delete(data);
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
