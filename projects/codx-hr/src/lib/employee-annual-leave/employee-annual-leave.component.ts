import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  
  constructor(
    inject: Injector,
    //private notiService: NotificationsService,
    //private shareService: CodxShareService,
    private routerActive: ActivatedRoute,
  ) {
    super(inject);
    this.funcID = this.routerActive.snapshot.params['funcID'];
  }
    
  onInit(): void {
    // this.api.execSv<any>("HR", "ERM.Business.HR", 'EAnnualLeaveBusiness', 'AddAsync')
    //   .subscribe((res) => {
    //     if (res) {
    //     }
    //   });
    this.getFunction(this.funcID);
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
  ngAfterViewInit(): void {
  this.views =[
    {
      id: '1',
      type: ViewType.list,
      sameData: true,
      //active: true,
      model: {
        template: this.templateList,
        //headerTemplate: this.headerTemplate,
      },
    },
  ];
  }

}
