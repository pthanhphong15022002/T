import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
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
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';

@Component({
  selector: 'setting-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent extends UIComponent {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('productImg') productImg: TemplateRef<any>;
  @ViewChild('product') product: TemplateRef<any>;
  @ViewChild('color') color: TemplateRef<any>;
  @ViewChild('costPrice') costPrice: TemplateRef<any>;
  @ViewChild('location') location: TemplateRef<any>;
  @ViewChild('owner') owner: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '6';
  idField = 'RecID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

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
  dialog!: DialogRef;
  model: DataRequest;
  modelResource: ResourceModel;
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
    private injector: Injector,
    private notiService: NotificationsService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'ResourcesBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetListAsync';
    this.modelResource.predicate = 'ResourceType=@0';
    this.modelResource.dataValue = '6';
  }

  ngAfterViewInit(): void {
    this.columnsGrid = [
      {
        headerText: '',
        template: this.productImg,
      },
      {
        headerText: 'Sản phẩm',
        width: '20%',
        template: this.product,
      },
      {
        headerText: 'Màu',
        template: this.color,
      },
      {
        headerText: 'Giá mua gần nhất',
        template: this.costPrice
      },
      {
        headerText: 'Quản lý kho',
        template: this.location,
      },
      {
        headerText: 'Quản lý kho',
        width: '20%',
        template: this.owner,
      },
    ];

    this.views = [
      {
        id: '1',
        text: 'Danh mục VPP',
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          resources: this.columnsGrid,
        },
      },
    ];

    this.moreFunc = [
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
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  add() {
    this.viewBase.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      let dataSelected = this.viewBase.dataService.dataSelected;

      option.Width = '800px';
      option.FormModel = this.viewBase?.currentView?.formModel;
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfc.openSide(
        PopupAddStationeryComponent,
        dataSelected,
        option
      );
    });
  }

  edit(data?) {
    let option = new SidebarModel();
    let editItem = this.viewBase.dataService.dataSelected;

    if (data) {
      editItem = data;
    }
    this.viewBase.dataService.edit(editItem).subscribe((res) => {
      option.Width = '800px';
      option.FormModel = this.viewBase?.currentView?.formModel;
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callfc.openSide(
        PopupAddStationeryComponent,
        editItem,
        option
      );
    });
  }

  delete(evt?) {
    let dataSelected = this.viewBase.dataService.dataSelected;
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
        if (res) this.notiService.notifyCode('TM004');
      });
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  addCart(evt) {
    //this.callfunc.openForm(this.colorPicker, 'Chọn màu', 400, 300);
  }

  clickMF(evt, data) {
    switch (evt.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
      default:
        break;
    }
  }

  splitColor(color: string): any {
    return color.split(";");
  }
}
