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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
} from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { enter } from '@syncfusion/ej2-grids';
import { DialogTypeResourceComponent } from './dialog/dialog.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';
export class defaultRecource {}
@Component({
  selector: 'app-type',
  templateUrl: 'types.component.html',
  styleUrls: ['types.component.scss'],
})
export class TypesComponent implements OnInit, AfterViewInit {
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('typeResourceDialog') typeResourceDialog: TemplateRef<any>;
  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('editor') editor: DialogTypeResourceComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('popuptemplate') popupTemp: TemplateRef<any>;

  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('category', { static: true }) category: TemplateRef<any>;

  @Input('data') data;
  @Output() editData = new EventEmitter();
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  devices: any;
  dialog1: DialogRef;
  columnsGrid;
  defaultRecource: any = {
    resourceName: '',
    resourceType: '5',
    ranking: '1',
    category: '1',
    owner: '',
    note: '',
    location: '',
  };
  dataSelected: any;
  dialog: FormGroup;
  isAdd = false;
  button: ButtonModel;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private callFunc: CallFuncService
  ) {}
  ngAfterViewInit(): void {
    this.views = [
      // {
      //   sameData: false,
      //   id: '1',
      //   type: 'grid',
      //   active: true,
      //   model: {
      //     panelLeftRef: this.gridTemplate,
      //     widthAsideRight: '680px',
      //     sideBarRightRef: this.typeResourceDialog,
      //   },
      // },
    ];

    this.columnsGrid = [
      {
        field: 'resourceName',
        headerText: 'Tên nhóm',
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
      {
        field: 'noName',
        headerText: '',
        template: this.GiftIDCell,
        width: 80,
      },
    ];
  }
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
  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  currentDelete;

  ngOnInit(): void {
    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });
  }
  // addNew(evt: any) {
  //   this.isAdd = true;
  //   this.editor && this.editor.setdata(evt);
  //   //this.viewBase.currentView.openSidebarRight();
  //   this.cr.detectChanges();
  // }
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
      this.dialog1 = this.callFunc.openSide(
        DialogTypeResourceComponent,
        this.dataSelected,
        option
      );
    });
  }
  edit(evt?) {
    let item = this.viewBase.dataService.dataSelected;
    if (evt) {
      item = evt;
    }
    this.viewBase.dataService.edit(item).subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.DataService = this.viewBase?.currentView?.dataService;
      this.dialog1 = this.callFunc.openSide(
        DialogTypeResourceComponent,
        this.viewBase.dataService.dataSelected,
        option
      );
    });
  }
  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.viewBase.dataService.delete([deleteItem]).subscribe((res) => {
      console.log(res);
    });
  }
  // edit(evt: any) {
  //   this.editor.isAdd = false;
  //   this.editor.dialog.patchValue(evt);
  //   //this.viewBase.currentView.openSidebarRight();
  //   this.cr.detectChanges();
  // }
  closeEditForm(event) {
    if (event?.dataItem) {
      this.gridView.addHandler(event.dataItem, event.isAdd, event.key);
    }
    //this.viewBase.currentView.closeSidebarRight();
    this.cr.detectChanges();
  }
  openForm(item) {
    this.data = item;
    this.editData.emit(item);
    //this.viewBase.currentView.openSidebarRight();
    this.cr.detectChanges();
  }

  saveRoom() {
    if (this.dialog.status == 'INVALID') {
      console.log('result', this.dialog.value);
      this.notificationsService.notify('"area" and "capacity" is not null!');
      return;
    }
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
    this.currentDelete = item;
    this.callFunc.openForm(this.popupTemp, 'Xóa', 450, 250);
    this.cr.detectChanges();
  }
  // delete(item) {
  //   debugger;
  //   console.log(item);
  //   this.api
  //     .execSv('EP', 'EP', 'ResourcesBusiness', 'DeleteResourceAsync', [
  //       item.recID,
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //         this.notificationsService.notify('Xóa thành công!');
  //         this.currentDelete = null;
  //         this.gridView.removeHandler(item, 'recID');
  //       }

  //       this.cr.detectChanges();
  //     });
  // }
}
