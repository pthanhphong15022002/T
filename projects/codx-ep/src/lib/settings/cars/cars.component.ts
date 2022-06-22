import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddCarsComponent } from './popup-add-cars/popup-add-cars.component';

export class defaultRecource {}
@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarResourceComponent implements OnInit, AfterViewInit {
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('carResourceDialog') carResourceDialog: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('editor') editor: PopupAddCarsComponent;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('category', { static: true }) category: TemplateRef<any>;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  dialog!: DialogRef;
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
  editform: FormGroup;
  isAdd = true;
  columnsGrid;
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
  constructor(
    private api: ApiHttpService,
    private cr: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    ) {}
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.template,
        },
      },
    ];
    this.columnsGrid = [
      {
        field: 'resourceName',
        headerText: 'Xe',
        template: '',
        width: 200,
      },
      {
        field: 'category',
        headerText: 'Nguồn',
        template: this.category,
        width: 150,
      },
      {
        field: 'ranking',
        headerText: 'Phân loại',
        template: this.ranking,
        width: 150,
      },
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 50 },
    ];
    this.buttons = {
      id: 'btnAdd',
    };
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];

  ngOnInit(): void {}
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
      this.dialog = this.callfunc.openSide(
        PopupAddCarsComponent,
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
        this.dialog = this.callfunc.openSide(
          PopupAddCarsComponent,
          this.viewBase.dataService.dataSelected,
          option
        );
      });
  }
  delete(evt?) {
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
        console.log(res);
        this.dataSelected = res;
      });
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
            this.notificationsService.notify('Xóa thành công!');
          }
        });
    }
  }

  clickMF(evt?: any, data?: any) {
    switch (evt.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete();
        break;
      default:
        break;
    }
  }
  closeEditForm(evt?) {
    //this.viewBase.currentView.closeSidebarRight();
  }
}
