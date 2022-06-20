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
  CacheService,
  CodxGridviewComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TITLE_HEADER_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { ButtonModel } from '@syncfusion/ej2-angular-buttons/public_api';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';

export class defaultRecource {}
@Component({
  selector: 'doc-category',
  templateUrl: './docCategory.component.html',
  styleUrls: ['./docCategory.component.scss'],
})
export class DocCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('view') viewBase: ViewsComponent;
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

  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    public atSV: AttachmentService
  ) {}

  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];

  ngOnInit(): void {
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
        sameData: false,
        id: '1',
        type: ViewType.grid,
        active: true,
        model: {
          panelLeftRef: this.grid,
        },
      },
    ];
    this.cr.detectChanges();
  }

  addNew(evt: any) {

    this.cr.detectChanges();
  }

  closeSidebar(data) {
    if (data) {
      this.gridView.addHandler(data.dataItem, data.isAdd, data.key);
    }
    this.cr.detectChanges();
  }

  popup(evt: any) {
    this.atSV.openForm.next(true);
  }

  edit(data) {
    this.editCategory.dialogCategory.patchValue(data);
    this.editCategory.dialogCategory.patchValue({ transID: data.categoryID });

    this.editCategory.dialogCategory.addControl(
      'recID',
      new FormControl(data.id)
    );
    this.editCategory.dialogCategory.addControl(
      'countStep',
      new FormControl(data.countStep)
    );

    this.editCategory.isAdd = false;
  }

  deleteCategory(data) {}

  getCount(countStep) {
    let lstNumber = [];
    for (let i = 0; i < countStep; i++) {
      lstNumber.push(i + 1);
    }
    return lstNumber;
  }
}
