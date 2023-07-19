import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CallFuncService,
  LayoutService,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import { PopupAddCustomerGroupsComponent } from './popup-add-customer-groups/popup-add-customer-groups.component';

@Component({
  selector: 'lib-customer-groups',
  templateUrl: './customer-groups.component.html',
  styleUrls: ['./customer-groups.component.css'],
})
export class CustomerGroupsComponent extends UIComponent {
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  @ViewChild('icon') icon!: TemplateRef<any>;
  @ViewChild('note') note!: TemplateRef<any>;
  @ViewChild('custGroupID') custGroupID!: TemplateRef<any>;
  @ViewChild('custGroupName') custGroupName!: TemplateRef<any>;
  @ViewChild('createdOn') createdOn!: TemplateRef<any>;
  @ViewChild('modifiedOn') modifiedOn!: TemplateRef<any>;
  @ViewChild('createdBy') createdBy!: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  funcID = '';
  authStore: any;
  views: Array<ViewModel> = [];
  entityName = 'CM_CustomerGroups';
  predicate: string;
  dataValue: string;
  idField = 'recID';
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  arrFieldIsVisible = [];
  dataSelected: any;
  funcList: any = {};
  columnsGrid = [];
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'CustomerGroupsBusiness';
  method = 'GetListAsync';
  gridViewSetup: any;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private notifySvr: NotificationsService,
    private userStore: AuthStore
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.authStore = userStore.get();
    this.cache.functionList(this.funcID?.trim()).subscribe((func) => {
      this.funcList = func;
    });
  }

  onInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteAsync';
    this.view.dataService.methodSave = 'AddAsync';
    this.view.dataService.methodUpdate = 'EditAsync';
    this.detectorRef.detectChanges();
  }

  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.gridViewSetup = gv;
          this.gridViewSetup.IconColor.isVisible = false;
          let arrField = Object.values(this.gridViewSetup).filter(
            (x: any) => x.isVisible
          );
          if (Array.isArray(arrField)) {
            this.arrFieldIsVisible = arrField
              .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
              .map((x: any) => x.fieldName);
            this.getColumnGrid(this.gridViewSetup);
          }

          this.detectorRef.detectChanges();
        });
    }
  }

  getColumnGrid(grid) {
    this.columnsGrid = [];

    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'Icon':
          template = this.icon;
          break;
        case 'CreatedOn':
          template = this.createdOn;
          break;
        case 'ModifiedOn':
          template = this.modifiedOn;
          break;
        default:
          break;
      }
      if (template) {
        colums = {
          field: field,
          headerText: grid[key].headerText,
          width: grid[key].width,
          template: template,
          // textAlign: 'center',
        };
      } else {
        colums = {
          field: field,
          headerText: grid[key].headerText,
          width: grid[key].width,
        };
      }

      this.columnsGrid.push(colums);
    });

    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          resources: this.columnsGrid,
          template2: this.templateMore,
        },
      },
    ];
  }

  viewChanged(evt: any, view: ViewsComponent) {}

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add(evt);
        break;
    }
  }

  clickMF(evt?: any, data?: any) {
    this.dataSelected = data;
    switch (evt.functionID) {
      case 'SYS03':
        this.edit(evt, data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(evt, data);
        break;
    }
  }

  changeDataMF(e: any, data) {}

  //#region  CRUDService
  add(evt) {
    this.view.dataService.service = 'CM'; //Lỗi k bắt được service khi add new && copy
    this.view.dataService.addNew().subscribe((res: any) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let customName =
        this.funcList?.customName || this.funcList?.description || '';
      let popupAdd = this.callfunc.openSide(
        PopupAddCustomerGroupsComponent,
        {
          data: this.view.dataService.dataSelected,
          action: 'add',
          headerText:
            evt.text +
            ' ' +
            customName.charAt(0).toLowerCase() +
            customName.slice(1),
          gridViewSetup: this.gridViewSetup,
        },
        option
      );

      popupAdd.closed.subscribe((res) => {
        if (!res?.event) this.view.dataService.clear();
        else {
          this.view.dataService.update(res.event).subscribe();
        }
      });
    });
  }

  edit(evt, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((res) => {
          this.dataSelected = this.view.dataService.dataSelected;
          let option = new SidebarModel();
          option.Width = '550px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.view?.formModel;
          let customName =
            this.funcList?.customName || this.funcList?.description || '';
          let popupEdit = this.callfunc.openSide(
            PopupAddCustomerGroupsComponent,
            {
              data: data,
              isAdd: 'edit',
              headerText:
                evt.text +
                ' ' +
                customName.charAt(0).toLowerCase() +
                customName.slice(1),
              gridViewSetup: this.gridViewSetup,
            },
            option
          );
          popupEdit.closed.subscribe((res) => {
            if (res?.event == null) {
              this.view.dataService.dataSelected = evt.data;
              this.view.dataService.clear();
            } else {
              this.view.dataService.update(res.event).subscribe();
            }
          });
        });
    }
  }

  copy(evt, data) {
    this.view.dataService.service = 'CM';
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let customName =
        this.funcList?.customName || this.funcList?.description || '';
      let popupCopy = this.callfunc.openSide(
        PopupAddCustomerGroupsComponent,
        {
          data: data,
          isAdd: 'copy',
          headerText:
            evt.text +
            ' ' +
            customName.charAt(0).toLowerCase() +
            customName.slice(1),
          gridViewSetup: this.gridViewSetup,
        },
        option
      );
      popupCopy.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event != null) {
          this.view.dataService.update(e.event).subscribe();

          this.detectorRef.detectChanges();
        }
      });
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion
}
