import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddCarsComponent } from './popup-add-cars/popup-add-cars.component';

@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarsComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('statusCol') statusCol: TemplateRef<any>;
  @ViewChild('rankingCol') rankingCol: TemplateRef<any>;

  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
  columnGrids: any;
  dialog!: DialogRef;
  isAdd = true;
  columnsGrid;
  dialogCar: FormGroup;
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '2';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';

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
    private callFunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
    this.columnGrids = [
      {
        field: 'resourceID',
        headerText: 'Mã xe',
      },
      {
        field: 'resourceName',
        headerText: 'Tên xe',
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
        id: '1',
        text: 'Danh mục xe',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnGrids,
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

  addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callFunc.openSide(
        PopupAddCarsComponent,
        [this.dataSelected, true],
        option
      );
    });
  }

  edit(evt?) {
    this.dataSelected = this.viewBase.dataService.dataSelected;
    if (evt) this.dataSelected = evt;
    this.viewBase.dataService.edit(this.dataSelected).subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callFunc.openSide(
        PopupAddCarsComponent,
        [this.dataSelected, false],
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

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }
}
