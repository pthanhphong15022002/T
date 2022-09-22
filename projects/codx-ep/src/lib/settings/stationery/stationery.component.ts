import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  DialogRef,
  FormModel,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';

@Component({
  selector: 'setting-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent extends UIComponent implements AfterViewInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('productImg') productImg: TemplateRef<any>;
  @ViewChild('product') product: TemplateRef<any>;
  @ViewChild('color') color: TemplateRef<any>;
  @ViewChild('costPrice') costPrice: TemplateRef<any>;
  @ViewChild('location') location: TemplateRef<any>;
  @ViewChild('owner') owner: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '6';
  idField = 'recID';
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
  formModel: FormModel;
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

  constructor(private injector: Injector, private epService: CodxEpService) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';

    this.epService.getFormModel(this.funcID).then((res) => {
      this.formModel = res;
    });
  }

  ngAfterViewInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
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
        template: this.costPrice,
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
        this.addNew();
        break;
    }
  }

  clickMF(evt, data) {
    switch (evt.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'EPS2301':
        break;
      case 'EPS2302':
        break;
      default:
        break;
    }
  }

  addNew() {
    this.viewBase.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      let dataSelected = this.viewBase.dataService.dataSelected;
      option.Width = '800px';
      option.FormModel = this.viewBase?.formModel;
      option.DataService = this.viewBase?.dataService;
      this.dialog = this.callfc.openSide(
        PopupAddStationeryComponent,
        [dataSelected, true],
        option
      );
    });
  }

  edit(data?) {
    if (data) {
      this.viewBase.dataService.dataSelected = data;
    }
    this.viewBase.dataService
      .edit(this.viewBase.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();
        option.Width = '800px';
        option.FormModel = this.viewBase?.formModel;
        option.DataService = this.viewBase?.dataService;
        this.dialog = this.callfc.openSide(
          PopupAddStationeryComponent,
          [this.viewBase.dataService.dataSelected, false],
          option
        );
      });
  }

  delete(data?) {
    if (data) {
      this.viewBase.dataService.dataSelected = data;
    }
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe();
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  splitColor(color: string): any {
    if (color) {
      return color.split(';');
    }
  }
}
