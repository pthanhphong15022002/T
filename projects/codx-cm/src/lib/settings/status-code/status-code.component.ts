import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  LayoutService,
  PageTitleService,
  CacheService,
  ViewType,
  ButtonModel,
  SidebarModel,
  CallFuncService,
  Util,
  RequestOption,
  FormModel,
} from 'codx-core';
import { CatagoryComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/catagory/catagory.component';
import { PopupAddStatusCodeComponent } from './popup-add-status-code/popup-add-status-code.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-status-code',
  templateUrl: './status-code.component.html',
  styleUrls: ['./status-code.component.scss'],
})
export class StatusCodeComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  headerText;
  currentView!: CatagoryComponent;
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('templateObjectStatus') templateObjectStatus: TemplateRef<any>;
  // config BE
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'StatusCodesBusiness';
  method = 'GetListStatusCodeAsync';
  entityName = 'CM_StatusCodes';

  idField = 'statusID';
  dataValue: any;
  predicate: any;

  // setting component core
  columnGrids = [];
  arrFieldIsVisible: any[];

  button: ButtonModel;
  dataSelected: any;
  gridViewSetup: any;
  // const set value
  readonly btnAdd: string = 'btnAdd';

  constructor(
    private inject: Injector,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private cacheService: CacheService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private callfunc: CallFuncService
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.promiseAll();
  }

  onInit(): void {
    // this.afterLoad();
    this.button = {
      id: this.btnAdd,
    };
  }

  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     type: ViewType.grid,
    //     active: false,
    //     sameData: true,
    //     model: {
    //       template2: this.template,
    //       resources: this.columnGrids,
    //       // frozenColumns: 1,
    //     },
    //   },
    // ];
    // this.changeDetectorRef.detectChanges();

    this.loadViewModel();
  }

  async promiseAll() {
    await this.getFunctionList();
  }

  getFunctionList() {
    this.cache.functionList(this.funcID).subscribe((f) => {
      this.getGridViewSetup(f.formName, f.gridViewName);
    });
  }

  getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.getColumsGrid(this.gridViewSetup);
      }
    });
  }

  getColumsGrid(grvSetup) {
    let arrField = Object.values(grvSetup).filter(
      (x: any) => x.isVisible
    );
    if (Array.isArray(arrField)) {
      this.arrFieldIsVisible = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map((x: any) => x.fieldName);
      // this.getColumsGrid(this.gridViewSetup);
    }
    if (this.arrFieldIsVisible?.length > 0) {
      this.arrFieldIsVisible.forEach((key) => {
        let field = Util.camelize(key);
        let template: any;
        let colums: any;
        debugger;
        switch (key) {
          case 'ObjectStatus':
            template = this.templateObjectStatus;
            break;
          default:
            break;
        }
      });
    }

  }

  click(evt: ButtonModel) {
    this.headerText = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.addStatusCode();
        break;
    }
  }
  addStatusCode() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      // let customName =
      //   this.funcList?.customName || this.funcList?.description || '';
      let obj = {
        data: this.view.dataService.dataSelected,
        action: 'add',
        headerText: this.headerText,
        gridViewSetup : this.gridViewSetup
      }
      let popupAdd = this.callfunc.openSide(
        PopupAddStatusCodeComponent,obj,
        option
      );

      popupAdd.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event != null) {
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    });
  }
  selectedChange(data) {
    if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
  }
  changeDataMFGird(e, data) {
    this.changeDataMF(e, data);
  }

  changeDataMF($event, data) {
    if ($event != null && data != null) {
      for (let eventItem of $event) {
        eventItem.disabled = !['SYS03', 'SYS02','SYS04'].includes(eventItem?.type);
      }
    }
  }
  clickMF(e, data) {
    this.dataSelected = data;
    this.headerText = e.text;
    const functionMapping = {
      SYS03: () => this.edit(data),
      SYS04: () => this.copy(data),
      SYS02: () => this.delete(data),
    };

    const executeFunction = functionMapping[e.functionID];
    if (executeFunction) {
      executeFunction();
    } else {

      // this.codxShareService.defaultMoreFunc(
      //   e,
      //   data,
      //   this.afterSave.bind(this),
      //   this.view.formModel,
      //   this.view.dataService,
      //   this,
      //   customData
      // );
      this.detectorRef.detectChanges();
    }
  }
  edit(data) {
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
          let obj = {
            data: this.view.dataService.dataSelected,
            action: 'edit',
            headerText: this.headerText,
            gridViewSetup : this.gridViewSetup
          }
          let popupEdit = this.callfunc.openSide(
            PopupAddStatusCodeComponent,obj,option
          );
          popupEdit.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event != null) {
              this.view.dataService.update(e?.event).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        });
    }
  }
  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
    }
    this.view.dataService.copy().subscribe((res) => {
      this.dataSelected = this.view.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      let obj = {
        data: this.view.dataService.dataSelected,
        action: 'copy',
        headerText: this.headerText,
        gridViewSetup : this.gridViewSetup
      }
      let popupEdit = this.callfunc.openSide(
        PopupAddStatusCodeComponent,obj,option
      );
      popupEdit.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event != null) {
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    });
  }
  delete(data: any) {
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
        this.changeDetectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteStatusCodeAsync';
    opt.data = [itemSelected.statusID];
    return true;
  }
  loadViewModel() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.template,
          // resources: this.columnGrids,
          // frozenColumns: 1,
        },
      },
    ];
  }
}
