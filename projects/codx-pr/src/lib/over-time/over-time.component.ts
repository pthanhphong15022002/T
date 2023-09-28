import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-over-time',
  templateUrl: './over-time.component.html',
  styleUrls: ['./over-time.component.css'],
})
export class OverTimeComponent extends UIComponent {
  //#region declare properties
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;

  //View schedule
  requestSchedule: ResourceModel;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  modelResource: ResourceModel;
  fields = {
    id: 'recID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' }, //trung voi idField của resourceField
  };
  resourceField = {
    Name: 'Resources',
    Field: 'owner',
    IdField: 'owner',
    TextField: 'userName',
    Title: 'Resources',
  };
  vllStatus = 'EP022';

  //#endregion

  constructor(injector: Injector) {
    super(injector);
  }

  //#region Init components
  onInit() {
    this.buttons = {
      id: 'btnAdd',
    };

    this.api
      .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'AddAsync')
      .subscribe((res: any) => {
        console.log(res);
      });

    this.getSchedule();
  }

  getSchedule() {
    this.modelResource.assemblyName = 'HR';
    this.modelResource.className = 'OrganizationUnitsBusiness';
    this.modelResource.service = 'HR';
    this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';

    this.requestSchedule.service = 'TM';
    this.requestSchedule.assemblyName = 'TM';
    this.requestSchedule.className = 'TaskBusiness';
    this.requestSchedule.method = 'GetTasksWithScheduleAsync';
    this.requestSchedule.idField = 'taskID';
    this.requestSchedule.dataObj = '';
  }

  getCellContent(evt: any) {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
      {
        type: ViewType.schedule,
        active: true,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          template3: this.cellTemplate,
          template8: this.contentTmp, //content
          statusColorRef: this.vllStatus,
        },
      },
    ];
  }

  //#endregion

  clickMF(e, data) {}

  changeDataMF(e, data) {}
}
