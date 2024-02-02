import { Component, Inject, Injector, OnInit } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'lib-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent extends UIComponent implements OnInit {
  //#region Constructor
  viewID = '1';
  datas: Array<any> = [];
  lstGroup: Array<any> = [];
  selectedToolBar: string = '';
  imgDefault = 'assets/themes/ws/default/img/Report_Empty.svg';

  constructor(inject: Injector) {
    super(inject);
    this.router.queryParams.subscribe((res) => {
      if (res) {
        this.funcID = res['funcID'];
      }
    });
  }
  //#endregion

  //#region Init
  override onInit() {
    this.loadDataSource();
  }

  loadDataSource() {
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetCategoryFuncAsync', 'ACSG')
      .subscribe((res: any) => {
        if (res) {
          this.lstGroup = res;
          this.datas = this.lstGroup[0].childs;
          this.selectedToolBar = this.lstGroup[0].functionID;
        }
      });
  }
  //#endregion

  //#region Function
  viewChange(e: any) {
    this.viewID = e;
  }

  selectedChange(data: any) {
    this.codxService.navigate(data.functionID);
  }

  selectedChangeToolBar(data: any) {
    this.selectedToolBar = data?.functionID;
    this.datas = JSON.parse(JSON.stringify(data.childs));
  }
  //#endregion
}
