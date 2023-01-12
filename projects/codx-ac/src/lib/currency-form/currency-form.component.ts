import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { PopAddCurrencyComponent } from './pop-add-currency/pop-add-currency.component';
@Component({
  selector: 'lib-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.css']
})
export class CurrencyFormComponent extends UIComponent {
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;
  @ViewChild("morefunc") morefunc: TemplateRef<any>;

  
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
    this.columnsGrid = [
      { field: '', headerText: '', width: 20 },
      { field: 'currencyID', headerText: 'Mã tiền tệ', width: 100 },
      { field: 'currencyName', headerText: 'Tên tiền tệ', width: 200 },
      { field: 'symbol', headerText: 'Ký hiệu', width: 200 },
      { field: 'multiply', headerText: 'Nhân tỷ giá', width: 140 },
      { field: 'pRoundOff', headerText: 'Số lẻ đơn giá', width: 140 },
      { field: 'aRoundOff', headerText: 'Số lẻ thành tiền', width: 200 },
      { field: 'translateName', headerText: 'Phát âm', width: 140 },
      { field: 'precisionName', headerText: 'Đọc số nguyên', width: 140 },
    ];
  }
  ngAfterViewInit(): void {
    this.views = [
      {
      type: ViewType.grid,
      sameData: true,
      active: true,
      model : {
        // template2:this.morefunc,
        // frozenColumns:1
        resources: this.columnsGrid,
        template: this.itemTemplate,  
      }
      },
      
  ];
    this.dt.detectChanges();
  }
  clickMF(e: any, data?: any) {
    console.log(e.functionID);
    switch (e.functionID) {
      case 'SYS03':
        this.update(data);
        break;
      case 'SYS02':
        this.delete(data);
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
  update(data){
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      var obj = {
        formType: 'edit',
        headerText: data.currencyID,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(PopAddCurrencyComponent, obj, option);
    });
    this.dialog.closed.subscribe((x) => {
      if (x.event == null && this.view.dataService.hasSaved)
        this.view.dataService
          .delete([this.view.dataService.dataSelected])
          .subscribe(x => {
            this.dt.detectChanges();
          });
    });
  }
  delete(data){
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true, (option: RequestOption) =>
    this.beforeDelete(option,data)
  ).subscribe(() => {});
  }
  beforeDelete(opt: RequestOption,data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CurrenciesBusiness';
    opt.assemblyName = 'BS';
    opt.service = 'BS';
    opt.data = data;
    return true;
  }
}
