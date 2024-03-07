import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { UIComponent } from 'codx-core';
import { CodxAcService } from '../codx-ac.service';

@Component({
  selector: 'lib-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent
  extends UIComponent
  implements OnInit, OnDestroy
{
  //#region Constructor
  viewID = '1';
  datas: Array<any> = [];
  lstGroup: Array<any> = [];
  selectedToolBar: string = '';
  imgDefault = 'assets/themes/ws/default/img/Report_Empty.svg';
  constructor(inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  override onInit() {
    this.acService.hideToolbar(true);
    this.loadDataSource();
  }

  ngOnDestroy() {
    this.acService.hideToolbar(false);
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
