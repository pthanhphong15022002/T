import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CallFuncService,
  LayoutService,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
  CRUDService,
  SidebarModel,
  CacheService,
  RequestOption,
} from 'codx-core';
import { PopupAddCustgroupComponent } from './popup-add-custgroup/popup-add-custgroup.component';

@Component({
  selector: 'lib-customergroups',
  templateUrl: './customergroups.component.html',
  styleUrls: ['./customergroups.component.css'],
})
export class CustomergroupsComponent extends UIComponent {
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  @ViewChild('icon') icon!: TemplateRef<any>;
  @ViewChild('note') note!: TemplateRef<any>;
  @ViewChild('custGroupID') custGroupID!: TemplateRef<any>;
  @ViewChild('custGroupName') custGroupName!: TemplateRef<any>;
  @ViewChild('createdOn') createdOn!: TemplateRef<any>;
  @ViewChild('createdBy') createdBy!: TemplateRef<any>;
  funcID: any;
  authStore: any;
  views: Array<ViewModel> = [];
  entityName: string = 'CM_CustomerGroups';
  predicate: string;
  dataValue: string;
  idField: string = 'recID';
  buttons: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
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
          this.columnsGrid = [
            {
              field: 'custGroupID',
              headerText: gv
                ? gv['CustGroupID'].headerText || 'CustGroupID'
                : 'custGroupID',
              template: this.custGroupID,
              width: 100,
            },
            {
              field: 'custGroupName',
              headerText: gv
                ? gv['CustGroupName'].headerText || 'CustGroupName'
                : 'CustGroupName',
              template: this.custGroupName,
              width: 200,
            },
            {
              field: 'icon',
              headerText: gv ? gv['Icon'].headerText || 'Icon' : 'Icon',
              template: this.icon,
              width: 80,
            },
            {
              field: 'note',
              headerText: gv ? gv['Note'].headerText || 'Note' : 'Note',
              template: this.note,
              width: 200,
            },
            {
              field: 'createdBy',
              headerText: gv
                ? gv['CreatedBy'].headerText || 'CreatedBy'
                : 'CreatedBy',
              template: this.createdBy,
              width: 200,
            },
            {
              field: 'createdOn',
              headerText: gv
                ? gv['CreatedOn'].headerText || 'CreatedOn'
                : 'CreatedOn',
              template: this.createdOn,
              width: 200,
            },
          ];

          this.views = [
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnsGrid,
                hideMoreFunc: true,
              },
            },
          ];
          this.detectorRef.detectChanges();
        });
    }
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
    this.view.dataService.addNew().subscribe((res: any) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let popupAdd = this.callfunc.openSide(
        PopupAddCustgroupComponent,
        {
          data: this.view.dataService.dataSelected,
          action: 'add',
          headerText: evt.text + ' ' + this.funcList?.customName ?? '',
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
          let popupEdit = this.callfunc.openSide(
            PopupAddCustgroupComponent,
            {
              data: data,
              isAdd: 'edit',
              headerText: evt.text + ' ' + this.funcList?.customName ?? '',
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
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let popupCopy = this.callfunc.openSide(
        PopupAddCustgroupComponent,
        {
          data: data,
          isAdd: 'copy',
          headerText: evt.text + ' ' + this.funcList?.customName ?? '',
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

  delete(data){
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
