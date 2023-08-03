import { Component, Injector, TemplateRef, ViewChild} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ButtonModel, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';

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

  itemSelected: any;
  currentViewModel: any;
  constructor(
    private injector: Injector,
    //private notiService: NotificationsService,
    //private shareService: CodxShareService,
    private routerActive: ActivatedRoute,
  ) {
    super(injector);

    this.routerActive.params.subscribe((params: Params) => {
      this.funcID = params['funcID'];
      this.initViewSetting();
      if (this.view) {
        this.view.dataService.parentIdField = '';
        this.view.dataService.idField = 'recID';
        this.view.idField = 'recID';
      }
    })
  }
  onInit(): void {
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
            id: '1',
            type: ViewType.list,
            sameData: true,
            //active: true,
            model: {
              template: this.templateListHRTAL01,
              headerTemplate: this.headerTemplateHRTAL01,
            },
          },
          {
            id: '2',
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
            id: '3',
            type: ViewType.list,
            sameData: true,
            //active: true,
            model: {
              template: this.templateListHRTAL02,
              headerTemplate: this.headerTemplateHRTAL02,
            },
          },
          {
            id: '4',
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
    console.log(val);
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
    this.popupLoading = true;
    var item = this.view.dataService.data.findIndex(x => x.recID == data.recID);
    this.api.execSv('HR', 'ERM.Business.HR', 'EAnnualLeavesBusiness', 'GetDaysOffByEAnnualLeaveAsync',
      [data.employeeID, data.alYear, data.alYearMonth, data.isMonth]).subscribe((res: any) => {
        if (res) {
          this.view.dataService.data[item].listDaysOff = res;
        }
        this.popupLoading = false;
      });
  }

}
