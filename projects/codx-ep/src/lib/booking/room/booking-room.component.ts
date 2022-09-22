import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  DataRequest,
  DialogModel,
  DialogRef,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  CallFuncService,
  ViewType,
  FormModel,
} from 'codx-core';
import { CodxReportViewerComponent } from 'projects/codx-report/src/lib/codx-report-viewer/codx-report-viewer.component';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddBookingRoomComponent } from './popup-add-booking-room/popup-add-booking-room.component';

@Component({
  selector: 'booking-room',
  templateUrl: './booking-room.component.html',
  styleUrls: ['./booking-room.component.scss'],
})
export class BookingRoomComponent extends UIComponent implements AfterViewInit {
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRight?: TemplateRef<any>;
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('reportObj') reportObj: CodxReportViewerComponent;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;

  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_Bookings';
  className = 'BookingsBusiness';
  method = 'GetListBookingAsync';
  idField = 'recID';
  predicate = 'ResourceType=@0';
  dataValue = '1';
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
  itemDetail;
  formModel: FormModel;
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
    this.request.method = 'GetListBookingAsync';
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

    // this.model.page = 1;
    // this.model.pageSize = 200;
    // this.model.predicate = 'ResourceType=@0';
    // this.model.dataValue = '1';

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
          resourceModel: this.resourceField, //resource
          //template:this.cardTemplate,
          template4: this.resourceHeader,
          //template5: this.resourceTootip,//tooltip
          template6: this.mfButton, //header
          template8: this.contentTmp,//content
          //template7: this.footerButton,//footer
          statusColorRef: 'vl003',
        },
      },
      {
        id: '2',
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
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

  changeItemDetail(event) {
    this.itemDetail = event?.data;
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
  closeAddForm(event) {}


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
