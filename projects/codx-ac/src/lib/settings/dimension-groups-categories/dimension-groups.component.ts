import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  DialogRef,
  CallFuncService,
  ViewType,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { DimensionGroupsAddComponent } from './dimension-groups-add/dimension-groups-add.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-dimension-groups',
  templateUrl: './dimension-groups.component.html',
  styleUrls: ['./dimension-groups.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DimensionGroupsComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  headerText: any;
  funcName: any;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
  ) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.cache
      .functionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) this.funcName = res.defaultName;
      });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateGrid,
        },
      },
    ];
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }
  //#endregion

  //#region Functione
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.addNew(e);
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
  addNew(e) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    this.view.dataService.addNew().subscribe((res: any) => {
      if(res){
        res.isAdd = true;
        let data = {
          headerText: this.headerText,
          dataDefault:{...res}
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          DimensionGroupsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }       
    });
  }
  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) {
      this.view.dataService.dataSelected = dataEdit;
    }
    this.view.dataService
      .edit(dataEdit)
      .subscribe((res: any) => {
        if(res){
          res.isEdit = true;
          let data = {
            headerText: this.headerText,
            dataDefault:{...res}
          };
          let option = new SidebarModel();
          option.DataService = this.view?.dataService;
          option.FormModel = this.view?.formModel;
          option.Width = '550px';
          let dialog = this.callfunc.openSide(
            DimensionGroupsAddComponent,
            data,
            option,
            this.view.funcID
          );
        }    
      });
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .edit(this.view.dataService.dataSelected)
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'edit',
    //       headerText: e.text + ' ' + this.funcName.toLowerCase(),
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '550px';
    //     this.dialog = this.callfunc.openSide(
    //       PopAddDimensionGroupsComponent,
    //       obj,
    //       option
    //     );
    //   });
  }
  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) {
      this.view.dataService.dataSelected = dataCopy;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if(res){
        res.isCopy = true;
        let data = {
          headerText: this.headerText,
          dataDefault:{...res}
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          DimensionGroupsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }   
    });
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .copy()
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'copy',
    //       headerText: e.text + ' ' + this.funcName.toLowerCase(),
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '550px';
    //     this.dialog = this.callfunc.openSide(
    //       PopAddDimensionGroupsComponent,
    //       obj,
    //       option
    //     );
    //   });
  }
  delete(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {});
  }
  //#endregion
}
