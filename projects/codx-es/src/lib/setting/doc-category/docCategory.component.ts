import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogRef,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';
import { ActivatedRoute } from '@angular/router';

export class defaultRecource {}
@Component({
  selector: 'doc-category',
  templateUrl: './docCategory.component.html',
  styleUrls: ['./docCategory.component.scss'],
})
export class DocCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('noName', { static: true }) noName;
  @ViewChild('process', { static: true }) process;
  @ViewChild('editCategory') editCategory: EditCategoryComponent;

  devices: any;
  editform: FormGroup;
  isAdd = true;
  columnsGrid;

  views: Array<ViewModel> = [];
  moreFunc: Array<ButtonModel> = [];

  button: ButtonModel;
  funcID: string;
  service = 'ES';
  assemblyName = 'ES';
  entityName = 'ES_Categories';
  predicate = '';
  dataValue = '';
  idField = 'RecID';
  className = 'CategoriesBusiness';
  method = 'GetListAsync';

  dataSelected: any;
  dialog!: DialogRef;

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService,
    public atSV: AttachmentService,
    private activedRouter: ActivatedRoute
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };

    this.columnsGrid = [
      {
        field: 'categoryID',
        headerText: 'Mã phân loại',
        template: '',
        width: 70,
      },
      {
        field: 'categoryName',
        headerText: 'Tên phân loại',
        template: '',
        width: 120,
      },
      {
        field: 'parentID',
        headerText: 'Phân nhóm',
        template: '',
        width: 120,
      },
      {
        field: 'icons',
        headerText: 'Icon',
        template: '',
        width: 60,
      },
      {
        field: 'color',
        headerText: 'Color',
        template: '',
        width: 60,
      },
      {
        field: 'note',
        headerText: 'Ghi chú',
        template: '',
        width: 150,
      },
      {
        field: 'processID',
        headerText: 'Qui trình duyệt',
        template: this.process,
        width: 150,
      },
      { field: 'noName', headerText: '', template: this.noName, width: 30 },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        sameData: true,
        id: '1',
        type: ViewType.list,
        active: true,
        model: {},
      },
    ];
    this.cr.detectChanges();
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

  addNew(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '750px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfunc.openSide(
        EditCategoryComponent,
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
      this.dialog = this.callfunc.openSide(
        EditCategoryComponent,
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

  closeEditForm(event) {}

  closeSidebar(data) {
    if (data) {
      this.gridView.addHandler(data.dataItem, data.isAdd, data.key);
    }
    this.cr.detectChanges();
  }

  popup(evt: any) {
    this.atSV.openForm.next(true);
  }

  // edit(data) {
  //   this.editCategory.dialogCategory.patchValue(data);
  //   this.editCategory.dialogCategory.patchValue({ transID: data.categoryID });

  //   this.editCategory.dialogCategory.addControl(
  //     'recID',
  //     new FormControl(data.id)
  //   );
  //   this.editCategory.dialogCategory.addControl(
  //     'countStep',
  //     new FormControl(data.countStep)
  //   );

  //   this.editCategory.isAdd = false;
  // }

  deleteCategory(data) {}

  getCount(countStep) {
    let lstNumber = [];
    for (let i = 0; i < countStep; i++) {
      lstNumber.push(i + 1);
    }
    return lstNumber;
  }
}
