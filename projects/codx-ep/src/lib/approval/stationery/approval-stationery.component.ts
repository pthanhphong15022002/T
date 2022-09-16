import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'approval-stationery',
  templateUrl: 'approval-stationery.component.html',
  styleUrls: ['approval-stationery.component.scss'],
})
export class ApprovalStationeryComponent extends UIComponent {
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  datavalue = '6';
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;
  itemSelected: any;

  constructor(private injector: Injector) {
    super(injector);

    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
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
    this.detectorRef.detectChanges();
  }

  click(event) {}

  clickMF(event, data) {
    switch (event?.functionID) {
      case 'EPT40101': //duyet
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
        break;

      case 'SYS03': //Sua.
        break;
    }
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
    this.getDetailBooking(recID);
  }

  getDetailBooking(id: any) {
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
