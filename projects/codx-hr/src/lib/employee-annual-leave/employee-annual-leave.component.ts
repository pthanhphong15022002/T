import { concat } from 'rxjs';
import { change } from '@syncfusion/ej2-grids';
import { Component, Injector, TemplateRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ButtonModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-employee-annual-leave',
  templateUrl: './employee-annual-leave.component.html',
  styleUrls: ['./employee-annual-leave.component.scss']
})
export class EmployeeAnnualLeaveComponent extends UIComponent {

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EAnnualLeave';
  className = 'EAnnualLeaveBusiness';
  method = 'GetListEmployeeAnnualLeaveAsync';
  idField = 'recID';

  views: Array<ViewModel> = []
  button: ButtonModel = null;
  funcID: string = null;
  grvSetup: any;
  grvEDaysOff: any;
  popupLoading: boolean = false;

  @ViewChild('templateListHRTAL01') templateListHRTAL01?: TemplateRef<any>;
  @ViewChild('headerTemplateHRTAL01') headerTemplateHRTAL01?: TemplateRef<any>;

  @ViewChild('templateListHRTAL02') templateListHRTAL02?: TemplateRef<any>;
  @ViewChild('headerTemplateHRTAL02') headerTemplateHRTAL02?: TemplateRef<any>;

  currentEmp;



  constructor(
    inject: Injector,
    //private notiService: NotificationsService,
    //private shareService: CodxShareService,
    private routerActive: ActivatedRoute,
  ) {
    super(inject);

    this.routerActive.params.subscribe((params: Params) => {
      this.funcID = params['funcID'];
      this.initViewSetting();
    })
  }
  onInit(): void {
    // this.api.execSv<any>("HR", "ERM.Business.HR", 'EAnnualLeaveBusiness', 'AddAsync')
    //   .subscribe((res) => {
    //     if (res) {
    //     }
    //   });
  }

  ngAfterViewInit(): void {
    this.initViewSetting();
    this.getFunction(this.funcID);
    this.getEDaysOffGrvSetUp();
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
            type: ViewType.tree_masterdetail,
            sameData: false,
            //active: true,
            model: {
              // template: this.templateListHRTAL01,
              // headerTemplate: this.headerTemplateHRTAL01,
            },
          },
        ];
        break;
      case 'HRTAL02':
        this.views = [
          {
            id: '1',
            type: ViewType.list,
            sameData: true,
            //active: true,
            model: {
              template: this.templateListHRTAL02,
              //headerTemplate: this.headerTemplateHRTAL02,
            },
          },
          {
            id: '2',
            type: ViewType.tree_masterdetail,
            sameData: false,
            //active: true,
            model: {
              // template: this.templateListHRTAL01,
              // headerTemplate: this.headerTemplateHRTAL01,
            },
          },
        ];
        break;
    }
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
  getEDaysOffGrvSetUp(){
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
    this.api.execSv('HR', 'ERM.Business.HR', 'EAnnualLeaveBusiness', 'GetDaysOffByEAnnualLeaveAsync',
      [data.employeeID, data.alYear, data.alYearMonth, data.isMonth]).subscribe((res: any) => {
        if (res) {
          this.view.dataService.data[item].listDaysOff = res;
        }
        this.popupLoading = false;
      });
  }

}
