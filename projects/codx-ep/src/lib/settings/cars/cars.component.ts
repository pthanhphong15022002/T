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
import { CodxEpService } from '../../codx-ep.service';
import { PopupAddCarsComponent } from './popup-add-cars/popup-add-cars.component';

export class defaultRecource {}
@Component({
  selector: 'setting-cars',
  templateUrl: 'cars.component.html',
  styleUrls: ['cars.component.scss'],
})
export class CarResourceComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
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
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute,
    private bookingService: CodxEpService
    ) {}
  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = "DeleteResourceAsync";
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
      this.dialog = this.callfunc.openSide(
        PopupAddCarsComponent,
        this.dataSelected,
        option
      );
    });
  }

  closeDialog(evt?){
    this.dialog && this.dialog.close();
  }

  edit() {
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
  delete() {
    this.viewBase.dataService
      .delete([this.viewBase.dataService.dataSelected])
      .subscribe((res) => {
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
        this.edit();
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
