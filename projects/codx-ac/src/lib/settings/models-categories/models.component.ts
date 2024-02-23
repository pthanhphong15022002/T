import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ModelsAddComponent } from './models-add/models-add.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-inventory',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css'],
})
export class ModelsComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  headerText: any;
  funcName: any;
  itemSelected:any;
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
          hideMoreFunc:true,
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

  //#region Function
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
  }
  clickMoreFunction(e, data) {
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
  add(e) {
    // this.headerText = e.text + ' ' + this.funcName;
    // this.view.dataService.addNew().subscribe((res: any) => {
    //   var obj = {
    //     formType: 'add',
    //     headerText: this.headerText,
    //   };
    //   let option = new SidebarModel();
    //   option.DataService = this.view.dataService;
    //   option.FormModel = this.view.formModel;
    //   option.Width = '800px';
    //   this.dialog = this.callfunc.openSide(
    //     PopAddInventoryComponent,
    //     obj,
    //     option,
    //     this.view.funcID
    //   );
    //   this.dialog.closed.subscribe((x) => {
    //     if (x.event == null) this.view.dataService.clear();
    //   });
    // });
  }
  edit(e, data) {
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .edit(this.view.dataService.dataSelected)
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'edit',
    //       headerText: e.text + ' ' + this.funcName,
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '800px';
    //     this.dialog = this.callfunc.openSide(
    //       PopAddInventoryComponent,
    //       obj,
    //       option
    //     );
    //   });
  }
  copy(e, data) {
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .copy()
    //   .subscribe((res: any) => {
    //     var obj = {
    //       formType: 'copy',
    //       headerText: e.text + ' ' + this.funcName,
    //     };
    //     let option = new SidebarModel();
    //     option.DataService = this.view.dataService;
    //     option.FormModel = this.view.formModel;
    //     option.Width = '800px';
    //     this.dialog = this.callfunc.openSide(
    //       PopAddInventoryComponent,
    //       obj,
    //       option
    //     );
    //   });
  }
  delete(data) {
    // if (data) {
    //   this.view.dataService.dataSelected = data;
    // }
    // this.view.dataService
    //   .delete([data], true, (option: RequestOption) =>
    //     this.beforeDelete(option, data)
    //   )
    //   .subscribe((res: any) => {
    //     if (res) {
    //     }
    //   });
  }

  changeDataMF(event,type:any=''){
    event.reduce((pre,element) => {
      if(type === 'views') element.isbookmark = true;
      if(!['SYS03','SYS02','SYS04'].includes(element.functionID)) element.disabled = true;
    },{})
  }

  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }
  //#endregion
}
