import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddRoomsComponent } from './popup-add-rooms/popup-add-rooms.component';
@Component({
  selector: 'setting-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  columnGrids: any;
  addEditForm: FormGroup;
  isAdd = false;
  dialog!: DialogRef;
  vllDevices = [];
  lstDevices = [];
  funcID: string;
  showToolBar = 'true';
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

  constructor(
    private injector: Injector,
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }


  onInit(): void {
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    this.columnGrids = [
      {
        field: 'resourceID',
        headerText: 'Mã phòng',
      },
      {
        field: 'resourceName',
        headerText: 'Tên phòng',
      },
      {
        headerText: 'Tình trạng',
        template: this.statusCol,
      },
      {
        headerText: 'Xếp hạng',
        template: this.rankingCol,
      },
    ];
    this.views = [
      {
        sameData: true,
        id: '1',
        text: 'Danh mục phòng',
        type: ViewType.grid,
        active: true,
        model: {
          resources: this.columnGrids,
        },
      },
    ];

    this.buttons = {
      id: 'btnAdd',
    };
  }

  clickMF(evt?: any, data?: any) {
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
    let dataItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      dataItem = evt;
    }
    this.viewBase.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddRoomsComponent,
        dataItem,
        option
      );
    });
  }

  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) item = evt;
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = item;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        PopupAddRoomsComponent,
        item,
        option
      );
    });
  }

  delete(evt?) {
    let delItem = this.viewBase.dataService.dataSelected;
    if (evt) delItem = evt;
    this.viewBase.dataService.delete([delItem]).subscribe((res) => {
      this.dataSelected = res;
    });
  }

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
