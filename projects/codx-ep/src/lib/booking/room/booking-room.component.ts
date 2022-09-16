import {
  Component,
  TemplateRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  CodxGridviewComponent,
  CodxScheduleComponent,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  CallFuncService,
  ViewType,
} from 'codx-core';
import { CodxReportViewerComponent } from 'projects/codx-report/src/lib/codx-report-viewer/codx-report-viewer.component';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
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
  @ViewChild('reportObj') reportObj: CodxReportViewerComponent;
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
  idField = 'RecID';
  className = 'BookingsBusiness';
  method = 'GetEventsAsync';
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
  lstPined: any = [];
  titleCollapse: string = 'Đóng hộp tham số';
  reportUUID: any = 'TMR01';
  constructor(
    private injector: Injector,
    private callFuncService: CallFuncService,
    private codxEpService: CodxEpService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.assemblyName = 'EP';
    this.request.className = 'BookingsBusiness';
    this.request.service = 'EP';
    this.request.method = 'GetEventsAsync';
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
      {
        id: 'btnAddReport',
        icon: 'icon-list-chechbox',
        text: 'Thêm mới report',
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
        sameData: false,
        type: ViewType.schedule,
        active: true,
        request2: this.modelResource,
        request: this.request,
        toolbarTemplate: this.footerButton,
        showSearchBar: false,
        model: {
          //panelLeftRef:this.panelLeft,
          eventModel: this.fields,
          resourceModel: this.resourceField,
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          template5: this.resourceTootip,
          template6: this.footerTemplate,
          template7: this.footerButton,
          statusColorRef:'vl003'
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
    ];
    this.detectorRef.detectChanges();
  }

  collapse(evt) {
    this.reportObj && this.reportObj.collapse();
    this.titleCollapse = this.reportObj.isCollapsed
      ? 'Mở hộp tham số'
      : 'Đóng hộp tham số';
  }
  changeValueDate(evt: any) {}

  valueChange(evt: any, a?: any, type?: any) {}

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
      case 'btnAddReport':
        this.addReport();
        break;
    }
  }

  addReport() {
    let option = new DialogModel();
    option.DataService = this.viewBase.dataService;
    option.FormModel = this.viewBase.formModel;
    this.callfc.openForm(
      PopupAddReportComponent,
      '',
      screen.width,
      screen.height,
      this.funcID,
      null,
      '',
      option
    );
  }
  addNew(evt?) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callFuncService.openSide(
        PopupAddBookingRoomComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    if (evt) {
      this.viewBase.dataService.dataSelected = evt;
      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.viewBase?.formModel;
          this.dialog = this.callFuncService.openSide(
            PopupAddBookingRoomComponent,
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
}
