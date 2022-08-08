import {
  Component,
  TemplateRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';
import {
  ButtonModel,
  CodxGridviewComponent,
  CodxScheduleComponent,
  DataRequest,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../codx-ep.service';
import { PopupAddBookingRoomComponent } from './popup-add-booking-room/popup-add-booking-room.component';

@Component({
  selector: 'booking-room',
  templateUrl: './booking-room.component.html',
  styleUrls: ['./booking-room.component.scss'],
})
export class BookingRoomComponent extends UIComponent {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;


  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'BookingsBusiness';
  method = 'GetEventsAsync';
  methodResource = 'GetResourceAsync';
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
      entity: 'EP_Bookings',
      formName: 'Bookings',
      gridViewName: 'grvBookings',
      functionID: 'EP1',
    };
  }


  onInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '1';

    this.model.page = 1;
    this.model.pageSize = 200;
    this.model.predicate = 'ResourceType=@0';
    this.model.dataValue = '1';

    this.moreFunc = [
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
    this.viewBase.dataService.methodSave = 'AddNewAsync';
    this.viewBase.dataService.methodUpdate = 'EditAsync';
    this.views = [
      {
        sameData: true,
        id: '2',
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
        type: ViewType.content,
        active: false,
        text: 'Chart',
        icon: 'icon-bar_chart',
        model: {
          panelLeftRef: this.chart,
        },
      },
      {
        sameData: true,
        id: '4',
        type: ViewType.content,
        active: false,
        text: 'Report',
        icon: 'icon-assignment',
        model: {
          panelLeftRef: this.report,
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
      this.dialog = this.callfc.openSide(
        PopupAddBookingRoomComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) {
      item = evt;
    }
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfc.openSide(
        PopupAddBookingRoomComponent,
        [item, false],
        option
      );
    });
  }
  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.viewBase.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

}
