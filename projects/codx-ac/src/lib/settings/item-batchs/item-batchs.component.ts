import {
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopAddItemBatchsComponent } from './pop-add-item-batchs/pop-add-item-batchs.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-item-batchs',
  templateUrl: './item-batchs.component.html',
  styleUrls: ['./item-batchs.component.css'],
})
export class ItemBatchsComponent extends UIComponent {
  //Constructor

  views: Array<ViewModel> = [];
  buttons: ButtonModel[] = [{ id: 'btnAdd' }];
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any = '';
  gridViewSetup: any;

  private destroy$ = new Subject<void>();

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  isSubView: boolean;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.router.data.subscribe((res) => {
      if (res && res['isSubView']) this.isSubView = res.isSubView;
    });
  }

  //End Constructor

  //Init

  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
    ];

    this.cache
      .functionList(this.view?.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.funcName = res.defaultName.toLowerCase();
      });
  }

  //End Init

  //Event

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
      case 'SYS102':
        this.delete(data);
        break;
      case 'SYS03':
      case 'SYS103':
        this.edit(e, data);
        break;
      case 'SYS04':
      case 'SYS104':
        this.copy(e, data);
        break;
    }
  }

  //End Event

  //Function

  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddItemBatchsComponent,
        obj,
        option,
        this.view.funcID
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event == null) this.view.dataService.clear();
      });
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
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddItemBatchsComponent,
          obj,
          option
        );
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      var obj = {
        formType: 'copy',
        headerText: e.text + ' ' + this.funcName,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddItemBatchsComponent,
        obj,
        option
      );
    });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {});
  }

  hideMoreFunction(e: any) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'SYS003' || x.functionID == 'SYS004'
    );
    bm.forEach((morefunction) => {
      morefunction.disabled = true;
    });
  }
  //End Function
}
