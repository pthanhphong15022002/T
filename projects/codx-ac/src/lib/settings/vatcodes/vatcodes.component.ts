import {
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Button } from '@syncfusion/ej2-angular-buttons';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopAddVatcodesComponent } from './pop-add-vatcodes/pop-add-vatcodes.component';

@Component({
  selector: 'lib-vatcodes',
  templateUrl: './vatcodes.component.html',
  styleUrls: ['./vatcodes.component.css'],
})
export class VATCodesComponent extends UIComponent {
  //Constructor

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any = '';
  gridViewSetup: any;
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
          frozenColumns: 1,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) {
        this.funcName = res.defaultName;
      }
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

  //End Event

  //Method

  add(e) {
    console.log(this.view.dataService);
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopAddVatcodesComponent,
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
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddVatcodesComponent,
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
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopAddVatcodesComponent,
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
      if (res) {
        this.api
          .exec('ERM.Business.AC', 'VATPostingBusiness', 'DeleteAsync', [
            data.vatid,
          ])
          .subscribe((res: any) => {});
      }
    });
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
  //End Method
}
