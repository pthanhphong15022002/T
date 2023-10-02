import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupOverTimeComponent } from './popup-over-time/popup-over-time.component';
import { DataVll } from 'projects/codx-hr/src/lib/model/HR_OrgChart.model';
import moment from 'moment';

@Component({
  selector: 'lib-over-time',
  templateUrl: './over-time.component.html',
  styleUrls: ['./over-time.component.css'],
})
export class OverTimeComponent extends UIComponent {
  console = console;
  //#region declare properties
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  popupTitle;
  funcIDName = '';
  user;
  userLogin;
  dataVll: Array<DataVll>;
  vllStatus = 'HRS104';

  //View schedule
  requestSchedule: ResourceModel;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  modelResource: ResourceModel;
  eventModel = {
    id: 'recID',
    subject: { name: 'employeeID' },
    startTime: { name: 'fromDate' },
    endTime: { name: 'toDate' },
    resourceId: { name: 'employeeID' }, //trung voi idField của resourceModel
  };
  resourceModel = {
    Name: 'employeeID',
    Field: 'employeeID',
    IdField: 'employeeID',
    TextField: 'employeeID',
    Title: 'employeeID',
  };

  //#endregion

  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private cacheService: CacheService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
      }
    });
  }

  //Get user default login
  getUserLogin() {
    this.user = this.authStore.get();
    if (this.user.userID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'GetEmployeeByUserIDAsync',
          this.user.userID
        )
        .subscribe((res: any) => {
          this.userLogin = res;
        });
    }
  }

  getColorItem(data: any) {
    return this.dataVll
      .filter((item) => item.value === data)
      .map((obj) => obj.color)
      .toString();
  }

  getHour(data) {
    return moment(data).format('HH : mm');
  }

  //#region Init components
  onInit() {
    this.cacheService.valueList(this.vllStatus).subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
      }
    });

    this.buttons = {
      id: 'btnAdd',
    };
    this.getUserLogin();
    this.getSchedule();
  }

  getSchedule() {
    //let resourceType = '1';
  }

  getCellContent(evt: any) {}

  ngAfterViewInit() {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'PR';
    this.modelResource.className = 'TimeKeepingRequest';
    this.modelResource.service = 'PR';
    this.modelResource.method = 'GetEmployeeAsync';

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'PR';
    this.requestSchedule.assemblyName = 'ERM.Business.PR';
    this.requestSchedule.className = 'TimeKeepingRequest';
    this.requestSchedule.method = 'GetListAsync';
    // this.requestSchedule.idField = 'recID';

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
        sameData: true,
        //request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.eventModel,
          resourceModel: this.resourceModel,
          template: this.cardTemplate,
          template4: this.resourceHeader,
          template6: this.mfButton, //header
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
      option.Width = '550px';
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [res, 'add', this.popupTitle, evt ? evt : null, this.userLogin],
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
