import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CodxGridviewComponent,
  NotificationsService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { DialogCarResourceComponent } from './dialog/editor.component';

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
  @ViewChild('editor') editor: DialogCarResourceComponent;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('category', { static: true }) category: TemplateRef<any>;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
  devices: any;

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
  constructor(
    private api: ApiHttpService,
    private cr: ChangeDetectorRef,
    private notificationsService: NotificationsService
  ) {}
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        model: {
          panelLeftRef: this.gridTemplate,
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
    //this.gridView.fields = this.columnsGrid;
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];

  ngOnInit(): void {}
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
  edit(evt) {
    this.isAdd = false;
    console.log(evt);
    if (evt?.id != 'add') {
      this.editor && this.editor.setdata(evt);
    }
    //this.viewBase.currentView.openSidebarRight();

    this.cr.detectChanges();
  }
  addNew(evt: any) {
    this.isAdd = true;
    console.log(evt);
    //this.viewBase.currentView.openSidebarRight();

    this.cr.detectChanges();
  }
  closeEditForm(evt?) {
    //this.viewBase.currentView.closeSidebarRight();
  }
}
