import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import {
  NotificationsService,
  ResourceModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  CallFuncService,
  CacheService,
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
import { PopupAddBookingCarComponent } from './popup-add-booking-car/popup-add-booking-car.component';
import { ActivatedRoute } from '@angular/router';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
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
  
  request?: ResourceModel;
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

  columnsGrid: any;
  constructor(
    private injector: Injector,
    private callFuncService: CallFuncService,
    private activedRouter: ActivatedRoute,
    private codxEpService: CodxEpService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.modelPage = {
      entity: 'EP_Bookings',
      formName: 'BookingCars',
      gridViewName: 'grvBookingCars',
      functionID: 'EPT2',
    };
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
    this.viewBase.dataService.methodSave = 'AddEditItemAsync';
    this.viewBase.dataService.methodUpdate = 'AddEditItemAsync';
    this.views = [
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
          //statusColorRef:'vl003'
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
    this.changeDetectorRef.detectChanges();
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

  addNew(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callFuncService.openSide(
        PopupAddBookingCarComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(obj?) {
    if (obj) {
    this.viewBase.dataService.dataSelected = obj;
    this.viewBase.dataService
      .edit(this.viewBase.dataService.dataSelected)
      .subscribe((res) => {
        this.dataSelected = this.viewBase.dataService.dataSelected;
        let option = new SidebarModel();
        option.Width = '800px';
        option.DataService = this.viewBase?.dataService;
        option.FormModel = this.viewBase?.formModel;
        this.dialog = this.callFuncService.openSide(
          PopupAddBookingCarComponent,
          [this.viewBase.dataService.dataSelected, false],
          option
        );
      });
  }
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
  
  clickMF(event, data) {
    console.log(event);
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
  
  onSelect(obj: any) {
    console.log(obj);
  }
}
