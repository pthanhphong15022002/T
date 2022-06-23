import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarsComponent implements OnInit, AfterViewInit {
  @ViewChild('itemTemplate') template!: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  dataSelected: any;
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
  idField = 'RecID';
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
    private api: ApiHttpService,
    private cr: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private callFunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {}
  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
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
    this.buttons = {
      id: 'btnAdd',
    };
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];

  ngOnInit(): void {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
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
  addNew() {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callFunc.openSide(
        PopupAddCarsComponent,
        this.dataSelected,
        option
      );
    });
  }

  closeDialog(evt?) {
    this.dialog && this.dialog.close();
  }

  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) item = evt;
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = item;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog = this.callFunc.openSide(
        PopupAddCarsComponent,
        this.dataSelected,
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
        this.delete(data);
        break;
      default:
        break;
    }
  }
  closeEditForm(evt?) {
    //this.viewBase.currentView.closeSidebarRight();
  }
}
