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
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-inventory',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelsComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  headerText: any;
  funcName: any;
  itemSelected: any;
  private destroy$ = new Subject<void>();
  isSubView: boolean;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private acService: CodxAcService
  ) {
    super(inject);
    // this.router.data.subscribe((res) => {
    //   if (res && res['isSubView']) this.isSubView = res.isSubView;
    // });
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
  onDestroy() {
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
      if (res) {
        res.isAdd = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ModelsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
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
  edit(e, dataEdit) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataEdit) {
      this.view.dataService.dataSelected = dataEdit;
    }
    this.view.dataService.edit(dataEdit).subscribe((res: any) => {
      if (res) {
        res.isEdit = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ModelsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }
  copy(e, dataCopy) {
    this.headerText = (e.text + ' ' + this.funcName).toUpperCase();
    if (dataCopy) {
      this.view.dataService.dataSelected = dataCopy;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        res.isCopy = true;
        let data = {
          headerText: this.headerText,
          dataDefault: { ...res },
        };
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        let dialog = this.callfunc.openSide(
          ModelsAddComponent,
          data,
          option,
          this.view.funcID
        );
      }
    });
  }
  delete(dataDelete) {
    this.view.dataService
      .delete([dataDelete], true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && !res?.error) {
          if (this.view.dataService.data.length == 0) {
            this.itemSelected = undefined;
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  changeDataMF(event, type: any = '') {
    this.acService.changeMFCategories(event,type);
  }

  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }
  //#endregion
}
