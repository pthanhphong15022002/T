import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
} from '@angular/core';
import {
  NotificationsService,
  ResourceModel,
  DialogRef,
  SidebarModel,
  UIComponent,
} from 'codx-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ButtonModel,
  CodxScheduleComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { CodxEpService, ModelPage } from '../codx-ep.service';
import { PopupAddBookingCarComponent } from './popup-add-booking-car/popup-add-booking-car.component';
@Component({
  selector: 'booking-car',
  templateUrl: 'booking-car.component.html',
  styleUrls: ['booking-car.component.scss'],
})
export class BookingCarComponent extends UIComponent {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;


  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  idField = 'RecID';
  className = 'BookingsBusiness';
  method = 'GetEventsAsync';
  modelPage: ModelPage;
  modelResource?: ResourceModel;
  model = new DataRequest();
  dataSelected: any;
  isAdd = true;
  isCollapsed = true;
  dialog!: DialogRef;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  fields: any;
  resourceField: any;
  funcID: string;

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private epService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.modelPage = {
      entity: 'EP_BookingCars',
      formName: 'BookingCars',
      gridViewName: 'grvBookingCars',
      functionID: 'EPT2',
    };
  }

  onInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '2';

    this.model.page = 1;
    this.model.pageSize = 200;
    this.model.predicate = 'ResourceType=@0';
    this.model.dataValue = '2';

    this.moreFunc = [
      {
        id: 'EPS22',
        icon: 'icon-list-chechbox',
        text: 'Danh mục xe',
      },
      {
        id: 'btnEdit',
        icon: 'icon-list-chechbox',
        text: 'Sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-chechbox',
        text: 'Xóa',
      },
    ];

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

    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteBookingAsync';
    this.views = [
      {
        sameData: true,
        id: '1',
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template4: this.resourceHeader,
          template5: this.resourceTootip,
          template6: this.footerTemplate,
          template7: this.footerButton
        },
      },

      
      {
        sameData: true,
        id: '3',
        type: ViewType.chart,
        active: true,
        model: {
          panelLeftRef: this.chart,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }


  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
      case 'btnEdit':
        this.edit();
        break;
      case 'btnDelete':
        this.delete();
        break;
    }
  }

  addNew(evt?) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddBookingCarComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    this.viewBase.dataService
      .edit(this.viewBase.dataService.dataSelected)
      .subscribe((res) => {
        this.dataSelected = this.viewBase.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.viewBase?.currentView?.dataService;
        option.FormModel = this.viewBase?.formModel;
        this.dialog = this.callfc.openSide(
          PopupAddBookingCarComponent,
          this.viewBase.dataService.dataSelected,
          option
        );
      });
  }

  delete(evt?) {
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
        this.dataSelected = res;
      });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

}
