import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ButtonModel,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogModel,
  DialogRef,
  RequestOption,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddCategoryComponent } from './popup-add-category/popup-add-category.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { ActivatedRoute } from '@angular/router';
import { CodxEsService } from '../../codx-es.service';
import { ApprovalStepComponent } from '../approval-step/approval-step.component';
import { PopupAddEmailTemplateComponent } from '../approval-step/popup-add-email-template/popup-add-email-template.component';

export class defaultRecource {}
@Component({
  selector: 'doc-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class DocCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('base') viewBase: ViewsComponent;
  @ViewChild('listItem') listItem: TemplateRef<any>;
  @ViewChild('gridTemplate') grid: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('process', { static: true }) process;
  @ViewChild('editCategory') editCategory: PopupAddCategoryComponent;
  @ViewChild('icon', { static: true }) icon: TemplateRef<any>;
  @ViewChild('color', { static: true }) color: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild('parentID', { static: true }) parentID: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

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
  idField = 'categoryID';
  className = 'CategoriesBusiness';
  method = 'GetListAsync';

  funcList: any = {};

  dataSelected: any;
  dialog!: DialogRef;

  constructor(
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private callfunc: CallFuncService,
    public atSV: AttachmentService,
    private activedRouter: ActivatedRoute,
    private esService: CodxEsService
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cacheSv.functionList(this.funcID).subscribe((func) => {
      this.funcList = func;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.viewBase.dataService.methodDelete = 'DeleteCategoryAsync';
    this.viewBase.dataService.methodSave = 'AddNewAsync';
    this.viewBase.dataService.methodUpdate = 'EditCategoryAsync';

    this.button = {
      id: 'btnAdd',
    };

    this.moreFunc = [
      {
        id: 'btnEdit',
        icon: 'icon-list-chechbox',
        text: 'Sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-chechbox',
        text: 'Xóa',
      },
      {
        id: 'btnEmail',
        icon: 'icon-list-chechbox',
        text: 'EmailTemplate',
      },
    ];
  }

  onLoading(evt: any) {
    let formModel = this.viewBase.formModel;
    if (formModel) {
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnsGrid = [
            {
              field: 'categoryID',
              headerText: gv
                ? gv['CategoryID'].headerText || 'categoryID'
                : 'categoryID',
              template: '',
              width: 100,
            },
            {
              field: 'categoryName',
              headerText: gv
                ? gv['CategoryName'].headerText || 'CategoryName'
                : 'CategoryName',
              template: '',
              width: 180,
            },
            // {
            //   field: 'parentID',
            //   headerText: gv['ParentID'].headerText,
            //   template: this.parentID,
            //   width: 120,
            // },
            {
              field: 'icon',
              headerText: gv ? gv['Icon'].headerText || 'Icon' : 'Icon',
              template: this.icon,
              width: 80,
            },
            {
              field: 'memo',
              headerText: gv ? gv['Memo'].headerText || 'Memo' : 'Memo',
              template: this.memo,
              width: 180,
            },
            {
              field: 'processID',
              headerText: 'Quy trình duyệt',
              template: this.process,
              width: 220,
            },
            { field: '', headerText: '', width: 20, template: this.itemAction },
          ];

          this.views = [
            {
              sameData: true,
              type: ViewType.list,
              active: false,
              model: {
                template: this.listItem,
              },
            },
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnsGrid,
              },
            },
          ];
          this.cr.detectChanges();
        });
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add(evt);
        break;
      case 'btnEdit':
        this.edit(evt);
        break;
      case 'btnDelete':
        this.delete(evt);
        break;
      case 'btnEmail':
        let data = {
          dialog: this.dialog,
          formGroup: null,
          templateID: '5860917c-af36-4803-b90d-ed9f364985c6',
          showIsTemplate: true,
          showIsPublish: true,
          showSendLater: true,
        };

        this.callfunc.openForm(
          PopupAddEmailTemplateComponent,
          '',
          800,
          screen.height,
          '',
          data
        );
        break;
    }
  }

  add(evt?: any) {
    this.viewBase.dataService.addNew().subscribe((res) => {
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.dataService;
      option.FormModel = this.viewBase?.formModel;
      this.dialog = this.callfunc.openSide(
        PopupAddCategoryComponent,
        {
          data: this.viewBase.dataService.dataSelected,
          isAdd: true,
          headerText: evt.text + ' ' + this.funcList?.customName ?? '',
        },
        option
      );
    });
  }

  edit(evt?) {
    if (evt?.data) {
      this.viewBase.dataService.dataSelected = evt?.data;

      this.viewBase.dataService
        .edit(this.viewBase.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.viewBase.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.viewBase?.dataService;
          option.FormModel = this.viewBase?.formModel;
          this.dialog = this.callfunc.openSide(
            PopupAddCategoryComponent,
            {
              data: evt?.data,
              isAdd: false,
              headerText: evt.text + ' ' + this.funcList?.customName ?? '',
            },
            option
          );
        });
    }
  }

  delete(evt?) {
    let deleteItem = this.viewBase.dataService.dataSelected;
    if (evt?.data) {
      deleteItem = evt?.data;
    }
    this.viewBase.dataService.delete([deleteItem], true).subscribe((res) => {
      console.log(res);
    });
  }

  closeEditForm(event) {
    //this.dialog && this.dialog.close();
  }

  clickMF(event, data) {
    event.data = data;
    switch (event?.functionID) {
      case 'SYS03':
        this.edit(event);
        break;
      case 'SYS02':
        this.delete(event);
        break;
    }
  }

  getCount(countStep) {
    let lstNumber = [];
    for (let i = 0; i < countStep; i++) {
      lstNumber.push(i + 1);
    }
    return lstNumber;
  }

  viewDetail(oCategory) {
    let transID = oCategory.recID;
    let data = {
      type: '0',
      transID: transID,
      justView: true,
    };

    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    this.callfunc.openForm(
      ApprovalStepComponent,
      '',
      screen.width,
      screen.height,
      '',
      data,
      '',
      dialogModel
    );
  }

  contentTooltip() {
    return 'Xem chi tiết';
  }
}
