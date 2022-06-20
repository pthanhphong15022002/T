import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { DialogStationeryComponent } from './dialog/dialog-stationery.component';

@Component({
  selector: 'app-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent implements OnInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('stationeryResourceDialog')
  stationeryResourceDialog: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('popuptemplate') popupTemp: TemplateRef<any>;
  @Input('data') data;
  @Output() editData = new EventEmitter();

  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
  modelResource?: ResourceModel;

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
  // dialog: FormGroup;
  dialog!: DialogRef;

  isAdd = false;
  editor: any;
  currentDelete;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService
  ) {}

  moreFuncs = [
    {
      id: 'btnEdit',
      icon: 'icon-list-checkbox',
      text: 'Chỉnh sửa',
    },
    {
      id: 'btnDelete',
      icon: 'icon-list-checkbox',
      text: 'Xóa',
    },
  ];

  ngAfterViewInit(): void {
    this.views = [
      // {
      //   sameData: true,
      //   id: '2',
      //   type: ViewType.schedule,
      //   active: true,
      //   request2: this.modelResource,
      //   model: {
      //     eventModel: this.fields,
      //     resourceModel: this.resourceField,
      //     contextMenu: '',
      //   },
      // },
      // {
      //   sameData: true,
      //   id: '3',
      //   type: ViewType.chart,
      //   active: false,
      //   model: {
      //     panelLeftRef: this.chart,
      //   },
      // },
    ];

    this.columnsGrid = [
      {
        field: 'resourceName',
        headerText: 'Tên phòng',
        template: '',
        width: 200,
      },
      {
        field: 'ranking',
        headerText: 'Phân loại',
        template: this.ranking,
        width: 150,
      },
      // { field: 'ranking', headerText: 'Phân loại', template: '', width: 150 },
      {
        field: 'equipments',
        headerText: 'Thiết bị',
        template: this.templateDevices,
        width: 150,
      },
      {
        field: 'noName',
        headerText: '',
        template: this.GiftIDCell,
        width: 80,
      },
    ];
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };

    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }
  addNew(evt: any) {
    // this.isAdd = true;
    // this.editor && this.editor.setdata(evt);
    // //this.viewBase.currentView.openSidebarRight();
    // this.cr.detectChanges();
    this.viewBase.dataService.addNew().subscribe((res) => {
      // this.dataSelected = res;
      let option = new SidebarModel();
      option.DataService = this.viewBase?.currentView?.dataService;
      option.Width = '750px';
      this.dialog = this.callfunc.openSide(
        DialogStationeryComponent,
        this.viewBase.dataService.dataSelected,
        option
      );
    });
  }
  edit(evt: any) {
    this.isAdd = false;
    this.editor && this.editor.setdata(evt);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }
  closeEditForm() {
    //this.viewBase.currentView.closeSidebarRight();
  }
  openForm(item) {
    this.data = item;
    this.editData.emit(item);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }

  getlstDevice(items: string) {
    //this.lstDevices = items.split(';');
    return this.lstDevices;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }

  deleteResource(item) {
    this.currentDelete = item;
    this.callfunc.openForm(this.popupTemp, 'Xóa', 450, 250);
    this.cr.detectChanges();
  }
  delete(item) {
    debugger;
    console.log(item);
    this.api
      .execSv('EP', 'EP', 'ResourcesBusiness', 'DeleteResourceAsync', [
        item.recID,
      ])
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notify('Xóa thành công!');
          this.currentDelete = null;
          this.gridView.removeHandler(item, 'recID');
        }

        this.cr.detectChanges();
      });
  }

  onDone(event) {}

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew(evt);
        break;
      case 'btnEdit':
        break;
      case 'btnDelete':
        break;
    }
  }
}
