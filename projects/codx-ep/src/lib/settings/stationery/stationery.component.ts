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
  ViewType,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddQuotaComponent } from './popup-add-quota/popup-add-quota.component';
import { PopupAddStationeryComponent } from './popup-add-stationery/popup-add-stationery.component';

@Component({
  selector: 'setting-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent extends UIComponent implements AfterViewInit {
  @ViewChild('resourceID') resourceID: TemplateRef<any>;
  @ViewChild('resourceName') resourceName: TemplateRef<any>;
  @ViewChild('productImg') productImg: TemplateRef<any>;
  @ViewChild('color') color: TemplateRef<any>;
  @ViewChild('groupID') groupID: TemplateRef<any>;
  @ViewChild('note') note: TemplateRef<any>;
  @ViewChild('quantity') quantity: TemplateRef<any>;
  @ViewChild('owner') owner: TemplateRef<any>;
  @ViewChild('columnsList') columnsList: TemplateRef<any>;
  @ViewChild('templateListCard') templateListCard: TemplateRef<any>;

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
    this.epService.getFormModel(this.funcID).then((res) => {
      this.formModel = res;
    });
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteResourceAsync';

    this.buttons = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      {
        headerText: 'Mã vpp',
        template: this.resourceID,
      },
      {
        headerText: 'Tên vpp',
        template: this.resourceName,
      },
      {
        headerText: 'Hình ảnh',
        template: this.productImg,
      },
      {
        headerText: 'Màu sắc',
        template: this.color,
      },
      {
        headerText: 'Nhóm',
        template: this.groupID,
      },
      {
        headerText: 'Mô tả chi tiết',
        template: this.note,
      },
      {
        headerText: 'Số lượng tồn kho',
        template: this.quantity,
      },
      {
        headerText: 'Người quản lý',
        template: this.owner,
      },
    ];

    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.templateListCard,
        },
      },
      {
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          resources: this.columnsGrid,
        },
      },
      {
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.columnsList,
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
        this.addQuota(data);
        break;
      default:
        break;
    }
  }

  addNew() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      let dataSelected = this.view.dataService.dataSelected;
      option.Width = '800px';
      option.FormModel = this.formModel;
      option.DataService = this.view?.dataService;
      this.dialog = this.callfc.openSide(
        PopupAddStationeryComponent,
        [dataSelected, true],
        option
      );
    });
  }

  edit(data?) {
    if (data) {
      data.uMID = data.umid;
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        let option = new SidebarModel();
        option.Width = '800px';
        option.FormModel = this.formModel;
        option.DataService = this.view?.dataService;
        this.dialog = this.callfc.openSide(
          PopupAddStationeryComponent,
          [this.view.dataService.dataSelected, false],
          option
        );
      });
  }

  delete(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe();
  }

  addQuota(data) {
    this.callfc.openForm(PopupAddQuotaComponent, '', 500, 200, '', [data]);
  }

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }
}
