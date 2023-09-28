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

    let data = {
      EmployeeID: '1123',
      RequestType: 'abc',
      Hours: 1,
      Days: 1,
      Minutes: 2,
      Minutes2: 3,
    };
    // this.api
    //   .execSv('PR', 'ERM.Business.PR', 'TimeKeepingRequest', 'AddAsync', data)
    //   .subscribe((res: any) => {
    //     console.log(res);
    //   });

    this.getSchedule();
  }

  getSchedule() {
    let resourceType = '1';

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'EP';
    this.modelResource.className = 'BookingsBusiness';
    this.modelResource.service = 'EP';
    this.modelResource.method = 'GetResourceAsync';
    this.modelResource.predicate = 'ResourceType=@0 ';
    this.modelResource.dataValue = resourceType;

    this.requestSchedule.service = 'PR';
    this.requestSchedule.assemblyName = 'PR';
    this.requestSchedule.className = 'TimeKeepingRequest';
    this.requestSchedule.method = 'GetListAsync';
    this.requestSchedule.idField = 'recID';
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
