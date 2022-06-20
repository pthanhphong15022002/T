import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, NotificationsService, CacheService, ResourceModel, DialogRef, SidebarModel, CallFuncService } from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { ButtonModel, CodxScheduleComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { DialogCarBookingComponent } from './dialog/editor.component';
import { ModelPage } from '../codx-ep.service';
export class defaultRecource {}
@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html',
  styleUrls: ['car.component.scss'],
})
export class CarBookingComponent implements OnInit, AfterViewInit {
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('scheduleTemplate') scheduleTemplate: TemplateRef<any>;
  @ViewChild('scheduleCar') schedule: CodxScheduleComponent;
  @ViewChild('gridTemplateCar') gridTemplate: TemplateRef<any>;
  @ViewChild('carBookingDialog') carBookingEditor: TemplateRef<any>;
  @ViewChild('editor') carBookingForm: DialogCarBookingComponent;
  @ViewChild('dashboard') dashboard: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;

  devices: any;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  defaultRecource: any = {
    resourceName: '',
    ranking: '1',
    category: '1',
    area: '',
    capacity: '',
    location: '',
    companyID: '1',
    owner: '',
    note: '',
    resourceType: '',
    icon: '',
    equipments: '',
  };
  modelPage: ModelPage;
  oldData: any;
  editform: FormGroup;
  isAdd = true;
  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  columnsGrid = [];
  fields: any;
  resourceField: any;
  modelResource?: ResourceModel;
  model = new DataRequest();
  // modelResource = new DataRequest();
  dataSelected: any;
  dialog!: DialogRef;

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cf: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
  ) {
    this.modelPage = {
      entity: 'EP_Bookings',
      formName: 'Bookings',
      gridViewName: 'grvBookings',
      functionID: 'EPT2',
    };
  }

  ngAfterViewInit(): void {
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
          contextMenu: '',
        },
      },

      {
        sameData: true,
        id: '3',
        type: ViewType.chart,
        active: true,
        model: {
          panelLeftRef: this.dashboard,

        },
      },
    ];
    this.columnsGrid = [
      {
        field: 'bookingNo',
        headerText: 'Số hiệu',
        template: '',
        width: 150,
      },
      {
        field: 'title',
        headerText: 'Tiêu đề',
        template: '',
        width: 150,
      },
      {
        field: 'resourceName',
        headerText: 'Tên xe',
        template: '',
        width: 150,
      },
      {
        field: 'bookingOn',
        headerText: 'Ngày đặt',
        template: this.itemCreate,
        width: 150,
      },
      {
        field: 'hours',
        headerText: 'Số giờ đặt',
        template: '',
        width: 150,
      },

      {
        field: 'equipments',
        headerText: 'Thiết bị',
        template: this.templateDevices,
        width: 150,
      },
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
    ];
  }

  ngOnInit(): void {
    this.moreFunc = [
      {
        id: 'EPS22',
        icon: 'icon-list-chechbox',
        text: 'Danh mục xe',
      }, {
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
    // this.bookingService.getModelPage('EPT2').then((res) => {
    //   if (res) this.modelPage = res;
    // });
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
  addNew(evt?){
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(DialogCarBookingComponent,  this.dataSelected, option);
    });
  }

  edit(evt?){
    this.viewBase.dataService.edit(this.viewBase.dataService.dataSelected).subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(DialogCarBookingComponent, this.viewBase.dataService.dataSelected, option);
    });
  }
  delete(evt?){
    this.viewBase.dataService.delete([this.viewBase.dataService.dataSelected]).subscribe(res => {
      console.log(res);
      this.dataSelected = res;
    });
  }

  closeEditForm(evt?: any) {
    if(evt){
      this.dialog && this.dialog.close();
    }
  }

  getlstDevice(items: string) {
    if (items) {
      this.lstDevices = items.split(';');
    }
    return this.lstDevices;
  }
  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }
  // addNew(event) {
  //   console.log(event);
  //   this.carBookingForm.dialogCarBooking.patchValue({
  //     startDate: event.startTime,
  //     endDate: event.endTime,
  //   });
  //   if (event.resource) {
  //     this.carBookingForm.dialogCarBooking.patchValue({
  //       resourceID: event.resource.resourceID,
  //       resourceType: event.resource.resourceName,
  //     });
  //   }
  //   //this.viewBase.currentView.openSidebarRight();
  // }
  viewChange(event) {}

  deleteBooking(event) {
    console.log('delete', event);
    if (confirm('Are you sure to delete booking')) {
      this.api
        .execSv('EP', 'EP', 'BookingsBusiness', 'DeleteBookingAsync', [
          event.recID,
        ])
        .subscribe((res) => {
          if (res) {
            this.notificationsService.notifyCode('E0408');
            if (this.schedule) {
              this.schedule.scheduleObj.deleteEvent(event);
            }
          }
        });
    }
  }
  onDone(evt: any) {
    //*evt: evt[0]: dataItem, evt[1]: true = add, false = edit

    if (evt.length > 1) {
      if (evt[1]) {
        this.schedule.scheduleObj.addEvent(evt[0]);
      } else {
        if(!evt[0]){
          this.schedule.scheduleObj.saveEvent(this.oldData);
        }
        else{
          this.schedule.scheduleObj.saveEvent(evt[0]);
        }
      }
    }
  }
}
