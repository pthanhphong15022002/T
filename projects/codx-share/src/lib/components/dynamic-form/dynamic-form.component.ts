import { FormGroup } from '@angular/forms';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
  SidebarModel,
  DialogRef,
  CodxFormDynamicComponent,
  ButtonModel,
  CRUDService,
  DataRequest,
  CallFuncService,
  LayoutService,
} from 'codx-core';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { CodxExportComponent } from '../codx-export/codx-export.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  service: string;
  entityName: string;
  predicate: string;
  dataValue: string;
  views: Array<ViewModel> = [];
  columnsGrid = [];
  data = [];
  dialog: DialogRef;
  buttons: ButtonModel;
  formGroup: FormGroup;
  funcID: string;
  idField: string = 'recID';
  dataSelected: any;
  function: any = {};
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private route: ActivatedRoute,
    private layout: LayoutService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    debugger;
    this.route.params.subscribe((routeParams) => {
      this.layout.setLogo(null);
      this.layout.setUrl(null);
      var state = history.state;
      if (state) {
        if (state.urlOld) this.layout.setUrl(state.urlOld);
      }
    });
    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    debugger;
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          resources: this.columnsGrid,
          template2: this.morefunction,
          frozenColumns: 1,
        },
      },
    ];
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.cache
      .gridViewSetup(view.function.formName, view.function.gridViewName)
      .subscribe(() => {});
  }

  clickMF(evt?: any, data?: any) {
    this.function = evt;
    switch (evt.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      //Export file
      case 'SYS002':
        this.export(data);
        break;
      default:
        break;
    }
  }

  click(evt: ButtonModel) {
    this.function = evt;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  private addNew() {
    debugger;
    this.viewBase.dataService.addNew().subscribe((res) => {
      debugger;
      this.dataSelected = this.viewBase.dataService.dataSelected;
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      var dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          function: this.function,
          dataService: this.viewBase.dataService,
          isAddMode: true,
        },
        option
      );
      //Xử lý riêng của OD
      if(this.viewBase?.currentView?.formModel?.funcID == "ODS21")
        dialog.closed.subscribe(item=>{
          var dt = item?.event?.save;
          if(dt && !dt?.error && dt?.data && dt?.data?.approval)
          {
            //Kiểm tra xem tồn tại hay không ? Nếu không có thì lưu ES_Category
            this.api.execSv("ES","ES","CategoriesBusiness","ExistAsync",dt?.data).subscribe();
          }
        })
    });
  }

  private edit(evt?) {
    this.dataSelected = this.viewBase.dataService.dataSelected;
    if (evt) this.dataSelected = evt;
    this.viewBase.dataService.edit(this.dataSelected).subscribe(() => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase?.currentView?.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      this.dialog = this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: this.dataSelected,
          function: this.function,
          dataService: this.viewBase.dataService,
          isAddMode: false,
        },
        option
      );
    });
  }

  private copy(evt: any) {
    this.dataSelected = this.viewBase.dataService.dataSelected;
    if (!this.dataSelected && evt) {
      this.viewBase.dataService.dataSelected = this.dataSelected = evt;
    }
    (this.viewBase.dataService as CRUDService).copy().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.viewBase.dataService;
      option.FormModel = this.viewBase?.currentView?.formModel;
      //this.dialog =
      this.callfc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          function: this.function,
          dataService: this.viewBase.dataService,
        },
        option
      );
    });
  }

  private delete(evt?) {
    let delItem = this.viewBase.dataService.dataSelected;
    if (evt) delItem = evt;
    this.viewBase.dataService.delete([delItem]).subscribe((res) => {
      this.dataSelected = res;
    });
  }

  private export(evt: any) {
    debugger;
    var id = 'recID';
    this.cache.entity(this.viewBase.formModel.entityName).subscribe((res) => {
      if (res) {
        id = res.isPK;
      }
    });
    var gridModel = new DataRequest();
    gridModel.formName = this.viewBase.formModel.formName;
    gridModel.entityName = this.viewBase.formModel.entityName;
    gridModel.funcID = this.viewBase.formModel.funcID;
    gridModel.gridViewName = this.viewBase.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.viewBase.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, evt[id]],
      null
    );
  }
}
