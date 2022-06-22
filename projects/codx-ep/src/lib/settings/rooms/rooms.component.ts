import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  NotificationsService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { enter } from '@syncfusion/ej2-grids';
import { DialogRoomResourceComponent } from './dialog/editor.component';

export class defaultRecource {}
@Component({
  selector: 'app-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent implements OnInit, AfterViewInit {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('roomResourceDialog') carResourceDialog: TemplateRef<any>;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('editor') editor: DialogRoomResourceComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('popuptemplate') popupTemp: TemplateRef<any>;
  @Input('data') data;
  @Output() editData = new EventEmitter();
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
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
  dialog: FormGroup;
  isAdd = false;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private callFunc: CallFuncService
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
      {
        sameData: true,
        id: '1',
        type: ViewType.list,
        active: true,
        model: {
          template: this.template
        },
      },
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
    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }
  clickMF(evt?:any, data?:any){

  }
  click(evt?:any){

  }
  addNew(evt: any) {
    this.isAdd = true;
    this.editor && this.editor.setdata(evt);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }
  edit(evt: any) {
    this.isAdd = false;
    this.editor && this.editor.setdata(evt);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }

  closeEditForm(event) {
    if (event?.dataItem) {
      this.gridView.addHandler(event.dataItem, event.isAdd, event.key);
    }
    //this.viewBase.currentView.closeSidebarRight();
    this.cr.detectChanges();
  }
  openForm(item) {
    this.data = item;
    this.editData.emit(item);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }

  saveRoom() {
    if (this.dialog.status == 'INVALID') {
      console.log('result', this.dialog.value);
      this.notificationsService.notify('"area" and "capacity" is not null!');
      return;
    }
  }
  getlstDevice(items: string) {
    this.lstDevices = items.split(';');
    return this.lstDevices;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }

  deleteResource(item) {
    console.log(item);
    this.callFunc.openForm(this.popupTemp, 'Xóa', 450, 250);
  }
  delete(item) {
    this.api
      .execSv('EP', 'EP', 'ResourcesBusiness', 'DeleteResourceAsync', [
        item.recID,
      ])
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notify('Xóa thành công!');
          this.gridView.removeHandler(item, 'recID');
          this.closeEditForm(item);
        }
        this.cr.detectChanges();
      });
  }
}
