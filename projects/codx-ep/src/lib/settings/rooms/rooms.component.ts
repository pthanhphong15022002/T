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
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupAddRoomsComponent } from './popup-add-rooms/popup-add-rooms.component';

export class defaultRecource {}
@Component({
  selector: 'app-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent implements OnInit, AfterViewInit {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('popuptemplate') popupTemp: TemplateRef<any>;
  @Input('data') data;
  @Output() editData = new EventEmitter();
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
  dataSelected: any;
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
  addEditForm: FormGroup;
  isAdd = false;
  dialog!: DialogRef;
  constructor(
    private cacheSv: CacheService,
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
          template: this.template,
        },
      },
    ];

    this.buttons = {
      id: 'btnAdd',
    };
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  funcID = 'EPS21';
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  Height = '500px';
  method = 'GetListAsync';
  ngOnInit(): void {
    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }
  clickMF(evt?: any, data?: any) {}
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
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callFunc.openSide(
        PopupAddRoomsComponent,
        this.dataSelected,
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
        option.Width = '750px';
        option.DataService = this.viewBase?.currentView?.dataService;
        this.dialog = this.callFunc.openSide(
          PopupAddRoomsComponent,
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

  saveRoom() {
    // if (this.dialog.status == 'INVALID') {
    //   console.log('result', this.dialog.value);
    //   this.notificationsService.notify('"area" and "capacity" is not null!');
    //   return;
    // }
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
  closeEditForm(evt) {}
}
