import { concat } from 'rxjs';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ButtonModel, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';

@Component({
  selector: 'lib-employee-annual-leave',
  templateUrl: './employee-annual-leave.component.html',
  styleUrls: ['./employee-annual-leave.component.scss']
})
export class EmployeeAnnualLeaveComponent extends UIComponent {

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EAnnualLeave';
  className = 'EAnnualLeavesBusiness';
  method = 'GetListEmployeeAnnualLeaveAsync';
  idField = 'recID';

  views: Array<ViewModel> = []
  button: ButtonModel = null;
  funcID: string = null;
  grvSetup: any;
  grvEDaysOff: any;
  popupLoading: boolean = false;
  request: ResourceModel;

  @ViewChild('templateListHRTAL01') templateListHRTAL01?: TemplateRef<any>;
  @ViewChild('headerTemplateHRTAL01') headerTemplateHRTAL01?: TemplateRef<any>;

  @ViewChild('templateListHRTAL02') templateListHRTAL02?: TemplateRef<any>;
  @ViewChild('headerTemplateHRTAL02') headerTemplateHRTAL02?: TemplateRef<any>;

  @ViewChild('treeTemplate') treeTemplate: TemplateRef<any>;
  @ViewChild('rightTemplateHRTAL01') rightTemplateHRTAL01: TemplateRef<any>;

  itemSelected: any = null;
  itemListDaysOff: any = null;
  currentViewModel: any;
  pageIndex = 0;
  pageSize = 5;
  listDaysOff: any = [];
  currentItem: any;
  scrolling: boolean = true;

  viewsDefault: any;
  viewCrr: any;
  crrFuncID: any;
  constructor(
    private injector: Injector,
    //private notiService: NotificationsService,
    //private shareService: CodxShareService,
    private hrService: CodxHrService,
    private routerActive: ActivatedRoute,
  ) {
    super(injector);

    this.routerActive.params.subscribe((params: Params) => {
      this.funcID = params['funcID'];
      this.initViewSetting();
    })
  }
  onInit(): void {
    this.crrFuncID = this.funcID;
    // this.api.execSv<any>("HR", "ERM.Business.HR", 'ScheduleBusiness', 'ScheduleUpdateExpiredContractsAsync')
    //   .subscribe((res) => {
    //     if (res) {
    //     }
    //   });
  }

  ngAfterViewInit(): void {
    this.initRequest();
    this.initViewSetting();
    this.getFunction(this.funcID);
    this.getEDaysOffGrvSetUp();
    this.viewsDefault = this.views;
  }
  changeFunction() {
    this.hrService.childMenuClick.subscribe((res) => {
      if (res && res.func) {
        if (this.funcID != res.func.functionID)
          this.funcID = res.func.functionID;
        this.hrService.childMenuClick.next(null);
      }
    });
  }
  initRequest(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EAnnualLeavesBusiness';
    this.request.method = 'GetListEmployeeAnnualLeaveAsync';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.request.idField = 'orgUnitID';
  }
  initViewSetting() {
    switch (this.funcID) {
      case 'HRTAL01':
        this.views = [
          {
            //id: '1',
            type: ViewType.list,
            sameData: true,
            //active: true,
            model: {
              template: this.templateListHRTAL01,
              headerTemplate: this.headerTemplateHRTAL01,
            },
          },
          {
            //id: '2',
            type: ViewType.tree_list,
            request: this.request,
            sameData: false,
            model: {
              resizable: true,
              isCustomize: true,
              template: this.treeTemplate,
              panelRightRef: this.rightTemplateHRTAL01,
              resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
            },
          },
        ];
        break;
      case 'HRTAL02':
        this.views = [
          {
            //id: '1',
            type: ViewType.list,
            sameData: true,
            //active: true,
            model: {
              template: this.templateListHRTAL02,
              headerTemplate: this.headerTemplateHRTAL02,
            },
          },
          {
            //id: '2',
            type: ViewType.tree_list,
            request: this.request,
            sameData: false,
            model: {
              resizable: true,
              isCustomize: true,
              template: this.treeTemplate,
              panelRightRef: this.rightTemplateHRTAL01,
              resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
            },
          }
        ];
        break;
    }
  }
  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }
  viewChanging(event: any) {
    if (event?.view?.id === '2' || event?.id === '2') {
      this.view.dataService.parentIdField = 'ParentID';
      this.view.dataService.idField = 'orgUnitID';
      this.view.idField = 'orgUnitID';
    } else if (event?.view?.id === '1' || event?.id === '1') {
      this.view.dataService.parentIdField = '';
      this.view.dataService.idField = 'recID';
      this.view.idField = 'recID';
    }
    // if (event?.view?.id === '1' || event?.id === '1'){
    //   this.currentViewModel = event?.view || event;
    // }
  }
  viewChanged(event: any) {
    this.viewCrr = event?.view?.type;
    this.initViewSetting();
    if (this.crrFuncID != this.funcID) {
      this.cache.viewSettings(this.funcID).subscribe(views => {
        if (views) {
          this.crrFuncID = this.funcID;
          this.views = [];
          let idxActive = -1;
          let viewOut = false;
          this.viewsDefault.forEach((v, index) => {
            let idx = views.findIndex(x => x.view == v.type);
            if (idx != -1) {
              v.hide = false;
              if (v.type != this.viewCrr) views.active = false;
              else views.active = true;
              if (views[idx].isDefault) idxActive = index;
            } else {
              v.hide = true;
              v.active = false;
              if (this.viewCrr == v.type) viewOut = true;
            }
            this.views.push(v);
          });
          if (!this.views.some((x) => x.active)) {
            if (idxActive != -1) this.views[idxActive].active = true;
            else this.views[0].active = true;

            let viewModel =
              idxActive != -1 ? this.views[idxActive] : this.views[0];
            this.view.viewActiveType = viewModel.type;
            this.view.viewChange(viewModel);
            if (viewOut) this.view.load();
          }
          this.detectorRef.detectChanges();
        }
      })
      //this.view.viewChange(this.view[0]);
      //this.view.load();
    }
    return;
  }
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
    }
  }
  getEDaysOffGrvSetUp() {
    this.cache.functionList('HRTPro09').subscribe((func: any) => {
      if (func?.formName && func?.gridViewName) {
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            if (grd) {
              this.grvEDaysOff = grd;
            }
          });
      }
    })
  }
  onShowDaysOff(data: any) {
    if (this.itemListDaysOff?.recID != data?.recID) {
      this.itemListDaysOff = data;
      this.resetPage();
    }
    if (this.listDaysOff?.length <= 0)
      this.popupLoading = true;
    //var item = this.view.dataService.data.findIndex(x => x.recID == data.recID);
    this.api.execSv('HR', 'ERM.Business.HR', 'EAnnualLeavesBusiness', 'GetDaysOffByEAnnualLeaveAsync',
      [data.employeeID, data.alYear, data.alYearMonth, data.isMonth, this.pageIndex, this.pageSize]).subscribe((res: any) => {
        if (res && res.length > 0) {
          //this.view.dataService.data[item].listDaysOff = res;
          this.listDaysOff = this.listDaysOff.concat(res);
          this.pageIndex = this.pageIndex + 1;
        } else {
          this.scrolling = false;
        }
        this.popupLoading = false;
      });
  }
  onScrollList(ele: HTMLDivElement) {
    var totalScroll = ele.clientHeight + ele.scrollTop;
    if (this.scrolling && (totalScroll == ele.scrollHeight)) {
      this.onShowDaysOff(this.itemListDaysOff);
    }
  }
  resetPage() {
    this.pageIndex = 0;
    this.pageSize = 5;
    this.listDaysOff = [];
    this.scrolling = true;
  }

}
