import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { isObservable } from 'rxjs';
import { DataVll } from 'projects/codx-hr/src/lib/model/HR_OrgChart.model';
import { PopupOverTimeComponent } from './popup-over-time/popup-over-time.component';
import { ViewDetailOtComponent } from './view-detail-over-time/view-detail-ot.component';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { PopupUpdateStatusComponent } from './popup-update-status/popup-update-status.component';

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
  @ViewChild('viewdetail') viewdetail: ViewDetailOtComponent;
  views: Array<ViewModel> = [];
  buttons: ButtonModel;
  popupTitle;
  funcIDName = '';
  user;
  userLogin;
  dataVll: Array<DataVll> = null;
  grvSetup: any;
  vllStatus = 'HRS104';
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  recID = null;
  itemSelected: any;
  registerForm = ['1', '2'];
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
  lblAdd: any;
  status: any;

  //#endregion

  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private cacheService: CacheService,
    private codxODService: CodxOdService,
    private codxShareService: CodxShareService,
    private hrService: CodxHrService
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
    if (data) {
      return moment(data).format('HH : mm');
    } else {
      return null;
    }
  }

  GetGvSetup() {
    this.cache.functionList(this.funcID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });
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
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });
    this.getUserLogin();
    this.getSchedule();

    this.GetGvSetup();
  }

  getSchedule() {
    //let resourceType = '1';
  }
  requestDetail: any = null;

  ngAfterViewInit() {
    this.requestDetail = new ResourceModel();
    this.requestDetail.assemblyName = 'PR';
    this.requestDetail.className = 'TimeKeepingRequest';
    this.requestDetail.service = 'PR';
    this.requestDetail.method = 'GetListAsync';

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'PR';
    this.modelResource.className = 'TimeKeepingRequest';
    this.modelResource.service = 'PR';
    this.modelResource.method = 'GetEmployeeAsync';
    // this.modelResource.method = 'GetEmployeeResourceAsync';

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
        sameData: false,
        request: this.requestDetail,
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

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
      case 'HRTPro11A00':
      case 'HRTPro11A03':
      case 'HRTPro11AU0':
      case 'HRTPro11AU3':
      case 'HRTPro11AU5':
        this.updateStatus(e, data);
        break;
      // case 'HRTPro11A03':
      //   this.submit(e, data);
      //   break;
      // case 'HRTPro11AU0':
      //   this.updateCancel(e, data);
      //   break;
      // case 'HRTPro11AU3':
      //   this.updateInProgress(e, data);
      //   break;
      // case 'HRTPro11AU5':
      //   this.updateApproved(e, data);
      //   break;
    }
  }

  changeDataMF(e, data) {
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(e, data, fc);
      });
    } else this.changeDataMFBefore(e, data, funcList);
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    this.flagChangeMF = true;

    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    } else {
      this.hrService.handleShowHideMF(e, data, this.view.formModel);
    }
  }

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
  }

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      if (evt?.startDate) {
        res.fromDate = evt.startDate;
      }
      if (evt?.endDate) {
        res.toDate = evt.endDate;
      }
      this.popupTitle = this.lblAdd + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [res, 'add', this.popupTitle, evt ? evt : null, this.userLogin],
        option
      );
      // dialogAdd.closed.subscribe((res) => {
      //   if (res?.event) {
      //     // let data = {};
      //     // data['recID'] = res.event.recID;
      //     // data['value'] = res.event.recID;
      //     // data['employeeID'] = res.event.employeeID;
      //     // data['ClassName'] = 'e-child-node';
      //     // data['fromDate'] = res.event.fromDate;
      //     // data['toDate'] = res.event.toDate;
      //     // data['fromTime'] = res.event.fromTime;
      //     // data['toTime'] = res.event.toTime;
      //     // data['emp'] = res.event.emp;
      //     // this.view.currentView['schedule'].resourceDataSource.push(data);
      //     // this.view.currentView['schedule'].dataSource.push(data);
      //     // this.view.currentView['schedule'].displayResource.push(data);
      //     // this.view.currentView.refesh();
      //     // this.view.currentView['schedule'].refresh();
      //     // this.detectorRef.detectChanges();
      //     // this.view.currentView.dataService.load().subscribe();
      //   } else {
      //     this.view.dataService.clear();
      //   }
      // });
    });
  }

  delete(data) {
    console.log('delete');
  }
  edit(evt, data) {
    this.view.dataService.edit(data).subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.popupTitle = evt.text + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [data, 'edit', this.popupTitle, null, this.userLogin],
        option
      );
      // dialogAdd.closed.subscribe((res) => {
      //   if (!res?.event) {
      //     this.view.dataService.clear();
      //   }
      // });
    });
  }
  copy(evt, data) {
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.popupTitle = evt.text + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [data, 'edit', this.popupTitle, null, this.userLogin],
        option
      );
      // dialogAdd.closed.subscribe((res) => {
      //   if (!res?.event) {
      //     this.view.dataService.clear();
      //   }
      // });
    });
  }
  // cancelSubmit(e, data) {
  //   this.updateStatus(data.recID, e.functionID);
  // }
  // submit(e, data) {
  //   this.updateStatus(data.recID, e.functionID);
  // }
  // updateCancel(e, data) {
  //   this.updateStatus(data.recID, e.functionID);
  // }
  // updateInProgress(e, data) {
  //   this.updateStatus(data.recID, e.functionID);
  // }
  // updateApproved(e, data) {
  //   this.updateStatus(data.recID, e.functionID);
  // }

  updateStatus(e, data) {
    switch(e.functionID){
      case 'HRTPro11A00':
        this.status = '' 
        break;
      case 'HRTPro11A03':
        this.status = '3' 
        break;
      case 'HRTPro11AU0':
        this.status = '' 
        break;
      case 'HRTPro11AU3':
        this.status = '' 
        break;
      case 'HRTPro11AU5':
        this.status = '' 
        break;
    }
    let obj = {
      funcID: e.functionID,
      status: this.status,
      statusName: e.text,
      recID: data.recID,
      title: e.text,
    };
    let dialogUpdateStatus = this.callfc.openForm(
      PopupUpdateStatusComponent,
      '',
      500,
      350,
      '',
      obj
    );
  }
  //#endregion

  //#region selectedChange
  selectedChange(e) {
    if (e?.data) {
      this.itemSelected = e.data;
      this.recID = e.data.recID;
    }
  }
  //#endregion

  receiveMF(e: any) {
    this.clickMF(e.e, e?.data);
  }
}
