import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CallFuncService, DialogRef, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddVendorsComponent } from './pop-add-vendors/pop-add-vendors.component';

@Component({
  selector: 'lib-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.css']
})
export class VendorsComponent extends UIComponent {
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText :any;
  columnsGrid = [];
  dialog: DialogRef;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService
  ) { 
    super(inject);
  }

  onInit(): void {

  }
  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources:this.columnsGrid,
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
  }
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add();
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //this.delete(data);
        break;
      case 'SYS03':
        //this.edit(data);
        break;
    }
    
  }
  add() {
    this.headerText = "Thêm nhà cung cấp";
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '850px';
      this.dialog = this.callfunc.openSide(PopAddVendorsComponent, obj, option,this.view.funcID);
      this.dialog.closed.subscribe((x) => {
        if (x.event == null)
        this.view.dataService.clear();
      });
    });
  }
}
