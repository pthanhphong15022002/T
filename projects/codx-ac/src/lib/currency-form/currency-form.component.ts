import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopAddCurrencyComponent } from './pop-add-currency/pop-add-currency.component';
@Component({
  selector: 'lib-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.css']
})
export class CurrencyFormComponent extends UIComponent {
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService
    ) {
    super(inject);
  }
  views: Array<ViewModel> = [];
  columnsGrid = [];
  itemSelected: any;
  dialog: DialogRef;
  button?: ButtonModel;
  headerText = '';
  moreFunction = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  ngAfterViewInit(): void {
    this.views = [
      {
      type: ViewType.grid,
      sameData: true,
      active: true,
      },
  ];
    this.dt.detectChanges();
  }
  // viewChanged(evt: any, view: ViewsComponent) {
  //   this.cache
  //     .gridViewSetup(view.function.formName, view.function.gridViewName)
  //     .subscribe(() => {});
  // }
  // selectedChange(val: any) {
  //   console.log(val);
  //   this.itemSelected = val.data;
  //   this.dt.detectChanges();
  // }
  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'edit':
        // this.update(data);
        break;
      case 'delete':
        // this.delete(data);
        break;
    }
  }
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
      case 'edit':
        
        break;
    }
  }
  add() {
    this.headerText = "Thêm tiền tệ";
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddCurrencyComponent, obj, option,this.view.funcID);
      this.dialog.closed.subscribe((x) => {
        if (x.event == null && this.view.dataService.hasSaved)
          this.view.dataService
            .delete([this.view.dataService.dataSelected])
            .subscribe(x => {
              this.dt.detectChanges();
            });
      });
    });
  }
}
