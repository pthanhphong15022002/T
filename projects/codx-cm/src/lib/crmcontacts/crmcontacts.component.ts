import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'codx-contacts',
  templateUrl: './crmcontacts.component.html',
  styleUrls: ['./crmcontacts.component.scss'],
})
export class CrmContactsComponent extends UIComponent implements AfterViewInit {
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('itemAddress', { static: true }) itemAddress: TemplateRef<any>;
  @ViewChild('itemPriority', { static: true }) itemPriority: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;

  dataObj?: any;
  columnGrids = [];
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  funcID = '';
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Processes';
  className = 'ProcessesBusiness';
  method = 'GetListProcessesAsync';
  idField = 'recID';
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  crrFuncID = '';


  constructor(private injector: Injector, private cacheSv: CacheService, private activedRouter: ActivatedRoute
    ) {
    super(injector);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.crrFuncID = this.funcID;
    let formModel = this.view?.formModel;
    if (formModel) {
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'contactName',
              headerText: gv
                ? gv['ContactName']?.headerText || 'Họ tên'
                : 'Họ tên',
              width: 250,
              template: this.itemContactName,
            },
            {
              field: 'phone',
              headerText: gv
                ? gv['Phone']?.headerText || 'Điện thoại'
                : 'Điện thoại',
              template: this.itemPhone,
              width: 250,
            },
            {
              field: 'email',
              headerText: gv ? gv['Email']?.headerText || 'Email' : 'Email',
              template: this.itemEmail,
              width: 250,
            },
            {
              field: 'address',
              headerText: gv
                ? gv['Address']?.headerText || 'Địa chỉ'
                : 'Địa chỉ',
              template: this.itemAddress,
              width: 250,
            },
            {
              field: 'priority',
              headerText: gv
                ? gv['Piority']?.headerText || 'Độ ưu tiên'
                : 'Độ ưu tiên',
              template: this.itemPriority,
              width: 100,
            },
            {
              field: 'createdBy',
              headerText: gv
                ? gv['CreatedBy']?.headerText || 'Người tạo'
                : 'Người tạo',
              template: this.itemCreatedBy,
              width: 100,
            },
            {
              field: 'createdOn',
              headerText: gv
                ? gv['CreatedOn']?.headerText || 'Ngày tạo'
                : 'Ngày tạo',
              template: this.itemCreatedOn,
              width: 180,
            },
          ];
          this.views.push({
            sameData: true,
            type: ViewType.grid,
            active: false,
            model: {
              resources: this.columnGrids,
            },
          });
        });
    }
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  //#region event codx-view
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  searchChange(e) {
    this.view.dataService.search(e).subscribe();
    this.detectorRef.detectChanges();
  }

  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  changeView(e){
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFuncID != this.funcID) {
      this.crrFuncID = this.funcID;
    }
    this.detectorRef.detectChanges();
  }

  clickMF(e, data) {}
  //#endregion

  //#region Crud
  add() {}
  //#endregion
}
