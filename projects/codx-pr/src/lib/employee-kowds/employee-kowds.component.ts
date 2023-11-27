import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CRUDService, CodxService, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { KowdsScheduleComponent } from './kowds-schedule/kowds-schedule.component';

@Component({
  selector: 'lib-employee-kowds',
  templateUrl: './employee-kowds.component.html',
  styleUrls: ['./employee-kowds.component.css']
})
export class EmployeeKowdsComponent extends UIComponent{
  views: Array<ViewModel>;
  request: any = null;
  requestTitle: any = null;
  buttonAdd: ButtonModel[];
  viewActive: string = '';
  orgUnitID: string = '';
  formModelEmployee;
  filterOrgUnit: any;
  isAfterViewSelect = false;
  itemSelected: any;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('leftPanel') leftPanel: TemplateRef<any>;
  @ViewChild('tmpPanelRight') tmpPanelRight: TemplateRef<any>;
  @ViewChild('KowdsScheduleComponent') kowdsSchedule: KowdsScheduleComponent;
  dtService: CRUDService;
  constructor(inject: Injector, private hrService: CodxHrService,
    public override codxService : CodxService
    ) {
    super(inject);
    this.dtService = new CRUDService(inject);
    this.dtService.idField = "orgUnitID";
  }
  
  onInit(): void {

    
    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });

    this.buttonAdd = [{
      id: 'btnAdd',
    }];
  }

  ngAfterViewInit(): void {
    // var objectRequest = {
    //   service: 'HR',
    //   assemblyName: 'ERM.Business.HR',
    //   className: 'OrganizationUnitsBusiness',
    //   method: 'GetDataOrgAsync',
    //   autoLoad: false,
    //   parentIDField: 'ParentID',
    // };

    // this.request = new ResourceModel();
    // this.request.service = objectRequest.service;
    // this.request.assemblyName = objectRequest.assemblyName;
    // this.request.className = objectRequest.className;
    // this.request.method = objectRequest.method;
    // this.request.autoLoad = objectRequest.autoLoad;
    // this.request.parentIDField = objectRequest.parentIDField;

    // this.requestTitle = new ResourceModel();
    // this.requestTitle.service = objectRequest.service;
    // this.requestTitle.assemblyName = objectRequest.assemblyName;
    // this.requestTitle.className = objectRequest.className;
    // this.requestTitle.method = objectRequest.method;
    // this.requestTitle.autoLoad = objectRequest.autoLoad;
    // this.requestTitle.parentIDField = objectRequest.parentIDField;
    // //gridModel.DataObj Check mode chart not get employee
    // this.requestTitle.dataObj = 'NoEmployee';

    // if (this.funcIDCheck.includes('WP')) {
    //   this.views = [
    //     {
    //       id: '1',
    //       type: ViewType.list,
    //       sameData: true,
    //       model: {
    //         template: this.templateList,
    //       },
    //     },
    //   ];
    // } else {
    this.views = [
      // {
      //   id: '3',
      //   type: ViewType.tree_list,
      //   sameData: false,
      //   request: this.requestTitle,
      //   model: {
      //     template: this.tempTree,
      //     panelRightRef: this.tmpOrgChart,
      //     collapsed: true,
      //     resizable: true,
      //   },
      // },
      {
        id: '3',
        type: ViewType.content,
        sameData: false,
        model: {
          panelRightRef: this.tmpPanelRight,
          panelLeftRef: this.leftPanel,
          collapsed: true,
          resizable: true,
        },
      },
    ];
    // }
  }

  clickMF(event, data){

  }

  onSelectionChanged(evt){
    this.filterOrgUnit = evt.data.orgUnitID
    this.isAfterViewSelect = true;

    // if (this.view) {
    //   this.itemSelected = evt.data;
    //   //Fix load when click on mode list
    //   let viewActive = this.view.views.find((e) => e.active == true);
    //   if (viewActive?.id == '1') {
    //     return;
    //   } else {
    //     var data = evt.data || evt;
    //     this.orgUnitID = data.orgUnitID;
    //   }
    //   // this.detectorRef.detectChanges();
    // }
  }

  btnClick(event){

  }

  viewChanged(event: any) {
    if (this.viewActive !== event.view.id) {
      // if (this.viewActive !== event.view.id && this.flagLoaded) {
      if (event?.view?.id === '1') {
        this.view.dataService.data = [];
        this.view.dataService.parentIdField = '';
      } else {
        this.view.dataService.parentIdField = 'ParentID';
      }
      if (
        this.view.currentView.dataService &&
        this.view.currentView.dataService.currentComponent
      ) {
        this.view.currentView.dataService.data = [];
        this.view.currentView.dataService.currentComponent.dicDatas = {};
      }

      //check update data when CRUD or not
      // this.flagLoaded = false;
      this.view.dataService.page = 0;

      //Prevent load data when click same id
      this.viewActive = event.view.id;
      this.view.currentView.dataService.load().subscribe();
      //this.view.dataService.load().subscribe();
    }
  }

}
