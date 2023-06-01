import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DialogRef, FormModel, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddRunPeriodicComponent } from './pop-add-run-periodic/pop-add-run-periodic.component';

@Component({
  selector: 'lib-run-periodic',
  templateUrl: './run-periodic.component.html',
  styleUrls: ['./run-periodic.component.css']
})
export class RunPeriodicComponent extends UIComponent{
  
  views: Array<ViewModel> = [];
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;

  button?: ButtonModel = { id: 'btnAdd' };
  dialog!: DialogRef;
  funcID: any;
  entityName: any;
  mfFormName: any = 'RunPeriodic';
  mfGrvName: any = 'grvCalculatingTheCostPrice';
  funcName: any;
  headerText: any;
  
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction(this.mfFormName, this.mfGrvName).subscribe((res: any) =>{
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACP10201');
        if (m) this.entityName = m.defaultName;
      }
    })
  }

  //region Init
  onInit(): void {
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
  }
  //endRegion Init

  //#region Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }
  //#endRegion Event

  //region Function

  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService
      .addNew()
      .subscribe((res: any) => {
        var obj = {
          formType: 'add',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width =  '550px';
        this.dialog = this.callfunc.openSide(
          PopAddRunPeriodicComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }

  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddRunPeriodicComponent,
          obj,
          option
        );
      });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddRunPeriodicComponent,
          obj,
          option
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
    });
  }
  //endRegion Function
}
