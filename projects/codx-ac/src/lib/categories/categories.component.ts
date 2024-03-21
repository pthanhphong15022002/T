import { ChangeDetectionStrategy, Component, Inject, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxAcService } from '../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent extends UIComponent {
  //#region Constructor
  viewID: any;
  datas: Array<any> = [];
  lstGroup: any;
  selectedToolBar: string = '';
  title:any;
  private destroy$ = new Subject<void>();
  imgDefault = 'assets/themes/ws/default/img/Report_Empty.svg';
  constructor(inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  override onInit() {
    //this.acService.hideToolbar(true);
    this.loadDataSource();
  }

  ngAfterViewInit() {
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache
      .functionList(this.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.title = res?.defaultName || res?.customName;
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy();
    //this.acService.hideToolbar(false);
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  loadDataSource() {
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetCategoryFuncAsync', 'ACSG')
      .subscribe((res: any) => {
        if (res) {
          this.lstGroup = res;
          this.datas = this.lstGroup[0].childs;
          this.selectedToolBar = this.lstGroup[0].functionID;
        }else{
          this.lstGroup = [];
        }
        this.detectorRef.detectChanges();
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
