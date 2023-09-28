import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupOverTimeComponent } from './popup-over-time/popup-over-time.component';

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
  popupTitle;
  funcIDName = '';

  //View schedule
  requestSchedule: ResourceModel;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  modelResource: ResourceModel;
  eventModel = {
    id: 'recID',
    //subject: { name: 'title' },
    startTime: { name: 'fromDate' },
    endTime: { name: 'toDate' },
    resourceId: { name: 'resourceID' }, //trung voi idField của resourceModel
  };
  resourceModel = {
    Name: 'Resources',
    Field: 'resourceID',
    IdField: 'resourceID',
    TextField: 'resourceName',
    Title: 'Resources',
  };
  vllStatus = 'EP022';

  //#endregion

  constructor(injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
      }
    });
  }

  //#region Init components
  onInit() {
    this.buttons = {
      id: 'btnAdd',
    };

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

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'PR';
    this.requestSchedule.assemblyName = 'ERM.Business.PR';
    this.requestSchedule.className = 'TimeKeepingRequest';
    this.requestSchedule.method = 'GetListAsync';
    // this.requestSchedule.idField = 'recID';
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
          eventModel: this.eventModel,
          resourceModel: this.resourceModel,
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

  //#region CRUD
  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  onActionClick(event?) {
    if (event.type == 'add') {
      this.addNew(event.data);
    }
    // if (event.type == 'doubleClick' || event.type == 'edit') {
    //   this.viewDetail(event.data);
    // }
  }

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [res, 'add', this.popupTitle, evt ? evt : null],
        option
      );
      dialogAdd.closed.subscribe((res) => {
        if (res?.event) {
          //this.updateData(returnData?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }
  //#endregion
}
