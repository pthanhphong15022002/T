import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DataRequest,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { DialogStationeryComponent } from './dialog/dialog-stationery.component';

@Component({
  selector: 'app-stationery',
  templateUrl: './stationery.component.html',
  styleUrls: ['./stationery.component.scss'],
})
export class StationeryComponent implements OnInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('panelLeftRsef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('stationeryResourceDialog')
  stationeryResourceDialog: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('popuptemplate') popupTemp: TemplateRef<any>;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @Input('data') data;
  @Output() editData = new EventEmitter();

  views: Array<ViewModel> = [];
  button: ButtonModel;
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  columnsGrid;
  dataSelected;

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
  // dialog: FormGroup;
  dialog!: DialogRef;
  model: DataRequest;
  modelResource: ResourceModel;

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cf: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
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
    this.views = [
      {
        id: '1',
        text: 'List',
        type: ViewType.list,
        sameData: true,
        active: true,
        model: {
          template: this.listItem,
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
    this.cf.detectChanges();
  }

  add(evt: any) {
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

  addNew(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfunc.openSide(
        DialogStationeryComponent,
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
          DialogStationeryComponent,
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

  closeEditForm(evt?: any) {
    if (evt) {
      this.dialog && this.dialog.close();
    }
  }

  addCart(evt) {
    //this.callfunc.openForm(this.colorPicker, 'Chọn màu', 400, 300);
  }

  clickMF(evt, data) { }

  click(data) {
    console.log(data);
  }
}
