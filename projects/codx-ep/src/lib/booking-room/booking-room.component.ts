import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  CodxScheduleComponent,
  CodxService,
  DataRequest,
  DialogRef,
  NotificationsService,
  RequestModel,
  ResourceModel,
  SidebarModel,
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
export class BookingRoomComponent implements OnInit, AfterViewInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @Input('data') data;
  @Input() height: string = '300';
  @ViewChild('panelLeftRef1') panelLeftRef1: TemplateRef<any>;
  @ViewChild('schedule') schedule: CodxScheduleComponent;
  @ViewChild('scheduleTemplate') scheduleTemplate: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('itemCreate', { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @Output() editData = new EventEmitter();
  @ViewChild('editRoomBooking') editRoomBooking: TemplateRef<any>;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('chart') chart: TemplateRef<any>;
  @ViewChild('report') report: TemplateRef<any>;
  @ViewChild('sidebarLeft') sidebarLeft: TemplateRef<any>;
  @ViewChild('cardTemplate') eventTemplate?: TemplateRef<any>;
  @ViewChild('Devices') Devices: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('footer') footerTemplate?: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('editRoomBookingForm')
  editRoomBookingForm: PopupAddBookingRoomComponent;
  devices: any;
  funcID = 'EPT1';
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Bookings';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'BookingsBusiness';
  method = 'GetEventsAsync';
  Height = '500px';
  methodResource = 'GetResourceAsync';
  eventStyle = 'colored';
  columnsGrid;
  modelPage: ModelPage;
  modelResource?: ResourceModel;
  model = new DataRequest();
  // modelResource = new DataRequest();
  dataSelected: any;
  dialog!: DialogRef;
  editform: FormGroup;
  isAdd = true;
  isCollapsed =true;
  parameters: any = [];
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private bookingService: CodxEpService
  ) {
    this.modelPage = {
      entity: 'EP_Bookings',
      formName: 'Bookings',
      gridViewName: 'grvBookings',
      functionID: 'EP1',
    };
    // this.bookingService.getModelPage('EPT1').then((res) => {
    //   if (res) this.modelPage = res;
    // });
  }
  oldData: any;
  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  dataSource = [];
  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  fields: any;
  resourceField: any;
  selectedItem: any;
  ngOnInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '1';

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

    this.model.page = 1;
    this.model.pageSize = 200;
    this.model.predicate = 'ResourceType=@0';
    this.model.dataValue = '1';

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
    // this.cacheSv.valueList('EP012').subscribe((res) => {
    //   this.vllDevices = res.datas;
    // });

    // this.lstDevices = this.editform.value.equipments.split(';');
    // this.tmplstDevice = this.editform.value.equipments.split(';');
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
          template: this.eventTemplate,
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
        headerText: 'Tên phòng',
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

    this.dt.detectChanges();
  }

  initForm() { }
  getSelectedItem(evt: any) {
    if (evt) {
      this.selectedItem = evt;
    }
  }
  loadBookings() {
    this.model.entityName = 'EP_Bookings';
    this.bookingService.loadBookings(this.model).subscribe((r) => {
      this.dataSource = r[0];
      console.log('dataSource', this.dataSource, r);
    });
  }

  openForm(item) {
    this.data = item;
    this.editData.emit(item);
    this.dt.detectChanges();
  }

  onSaveForm() {
    if (this.editform.status == 'INVALID') {
      console.log('result', this.editform.value);
      this.notificationsService.notifyCode('EP004');
      return;
    }

    if (this.isAdd) {
      this.editform.value.equipments = this.lstDevices.join(';');
      this.editform.value.resourceType = '1';
      this.api
        .callSv(
          'EP',
          'ERM.Business.EP',
          'ResourcesBusiness',
          'AddEditItemAsync',
          [this.editform.value, this.isAdd]
        )
        .subscribe((res) => console.log(res));
    } else {
      //edit here...
    }
  }

  deleteResource(item) {
    console.log(item);
    if (confirm('Are you sure to delete')) {
      this.api
        .execSv('EP', 'EP', 'ResourcesBusiness', 'DeleteResourceAsync', [
          item.recID,
        ])
        .subscribe((res) => {
          if (res) {
          }
        });
    }
  }

  valueChange(event: any) {
    console.log(event);
  }

  changeValueText(evt:any){
    console.log(evt);

  }
  changeValueDate(evt:any){
    console.log(evt);

  }
  changeValueCbb(evt:any){
    console.log(evt);

  }
  icon: any;
  valueChangeIcon(icon: any) {
    this.icon = icon;
    this.editform.patchValue({ icon: icon });
  }

  openPopupDevices() {
    this.modalService
      .open(this.popupDevice, { centered: true, size: 'md' })
      .result.then(
        (result) => {
          this.lstDevices = [...this.tmplstDevice];
        },
        (reason) => {
          this.tmplstDevice = [...this.lstDevices];
          console.log('reason', this.getDismissReason(reason));
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  isExist(deviceName) {
    let index = this.lstDevices.indexOf(deviceName);
    if (index == -1) return false;
    return true;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }

  checkedChange(event: any, device: any) {
    if (event.target.checked) {
      if (!this.isExist(device.value)) {
        this.tmplstDevice.push(device.value);
      }
    } else {
      let index = this.tmplstDevice.indexOf(device.value);
      if (index != -1) {
        let newArr = this.tmplstDevice.splice(index, 1);
        if (newArr.length == 0) this.tmplstDevice = [];
      }
    }
  }

  getlstDevice(items: string) {
    if (items) {
      this.lstDevices = items.split(';');
    }
    return this.lstDevices;
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }
  onDragDrop(evt: any) {
    if (evt) {
      if (evt.type == 'drop') {
        this.edit(evt.data);
      }
    }
  }
  addNew(evt?) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfunc.openSide(
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
      this.dialog = this.callfunc.openSide(
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

  toggleClick() { }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  // addNew(event) {
  //   console.log(event);
  //   this.editRoomBookingForm.addEditForm.patchValue({
  //     startDate: event.startTime,
  //     endDate: event.endTime,
  //   });
  //   if (event.resource) {
  //     this.editRoomBookingForm.addEditForm.patchValue({
  //       resourceID: event.resource.resourceID,
  //       resourceType: event.resource.resourceType,
  //     });
  //   }
  //   //this.viewBase.currentView.openSidebarRight();
  // }

  // edit(event) {
  //   console.log(event);
  //   this.editRoomBookingForm.isAdd = false;
  //   this.editRoomBookingForm && this.editRoomBookingForm.setdata(event);
  //   //this.viewBase.currentView.openSidebarRight();
  // }

  viewChange(event) { }

  deleteTask(event) {
    console.log('delete', event);
    if (confirm('Are you sure to delete')) {
      this.api
        .execSv('EP', 'EP', 'BookingsBusiness', 'DeleteBookingAsync', [
          event.recID,
        ])
        .subscribe((res) => {
          if (res) {
            //this.notificationsService.notifyCode("E0408");
            if (this.schedule) {
              this.schedule.scheduleObj.deleteEvent(event);
            }
          }
        });
    }
  }

  getCellContent(evt: any) {
    let d = new Date();
    if (evt.getMonth() == d.getMonth() && evt.getDate() == d.getDate()) {
      let time = evt.getTime();
      let ele = document.querySelectorAll('[data-date="' + time + '"]');
      if (ele && ele.length > 0) {
        ele.forEach((item) => {
          (item as any).style.backgroundColor = '#ddd';
        });
      }
      // if(ele && ele.length == 2){
      //   (ele[1] as any).style.backgroundColor = "#ddd";
      // }
      // if(ele && ele.length > 2){
      //   ele.forEach(item => {
      //     (item as any).style.backgroundColor = '#ddd';
      //   })
      // }
      return `<span>Nghỉ Nàm</span>`;
    }
    return ``;
  }
  onDone(evt: any) {
    //*evt: evt[0]: dataItem, evt[1]: true = add, false = edit

    if (evt.length > 1) {
      if (evt[1]) {
        this.schedule.scheduleObj.addEvent(evt[0]);
      } else {
        if (!evt[0]) {
          this.schedule.scheduleObj.saveEvent(this.oldData);
        } else {
          this.schedule.scheduleObj.saveEvent(evt[0]);
        }
      }
    }
  }
}
