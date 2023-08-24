import { load } from '@syncfusion/ej2-angular-charts';
import { type } from 'os';
import { concat } from 'rxjs';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthStore, ButtonModel, DialogModel, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupCalculateAnnualLeaveComponent } from './popup-calculate-annual-leave/popup-calculate-annual-leave.component';
import { EmployeeAnnualLeaveByOrgComponent } from './employee-annual-leave-by-org/employee-annual-leave-by-org.component';

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
  showButton: boolean = true;
  funcID: string = null;
  grvSetup: any;
  grvEDaysOff: any;
  popupLoading: boolean = false;
  request: ResourceModel;
  lang: any;
  @ViewChild('treeViewDetail') treeViewDetail: EmployeeAnnualLeaveByOrgComponent;

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

  resetView: boolean = false;
  headerText: string = '';
  btnCalculate: string = 'Tính';
  btnCancel: string = 'Hủy';
  constructor(
    private injector: Injector,
    private hrService: CodxHrService,
    private autStore: AuthStore,
  ) {
    super(injector);
    this.router.params.subscribe((params: Params) => {
      this.resetView = true;
      this.funcID = params['funcID'];
      this.initViewSetting();
      this.getFunction(this.funcID);
    })
  }
  onInit(): void {
    // this.api.execSv<any>("HR", "ERM.Business.HR", 'EAnnualLeavesBusiness', 'AddEmployeeAnnualLeaveAsync')
    //   .subscribe((res) => {
    //     if (res) {
    //     }
    //   });
    // this.api.execSv<any>("HR", "ERM.Business.HR", 'EAnnualLeavesBusiness', 'AddEmployeeAnnualLeaveMonthAsync')
    //   .subscribe((res) => {
    //     if (res) {
    //     }
    //   });
  }
  ngAfterViewInit(): void {
    this.button = { id: 'btnAdd' , text: 'Thêm'};
    this.initRequest();
    this.initViewSetting();
    this.getEDaysOffGrvSetUp();
    this.getLanguage();
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
        this.showButton = false;
        this.views = [
          {
            // id: ViewType.list.toString(),
            type: ViewType.list,
            sameData: true,
            active: false,
            model: {
              template: this.templateListHRTAL01,
              headerTemplate: this.headerTemplateHRTAL01,
            },
          },
          {
            // id: ViewType.tree_list.toString(),
            type: ViewType.tree_list,
            request: this.request,
            sameData: false,
            active: false,
            model: {
              resizable: false,
              isCustomize: true,
              template: this.treeTemplate,
              panelRightRef: this.rightTemplateHRTAL01,
              resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
            },
          },
        ];
        break;
      case 'HRTAL02':
        this.showButton = true;
        this.views = [
          {
            // id: ViewType.list.toString(),
            type: ViewType.list,
            sameData: true,
            active: false,
            model: {
              template: this.templateListHRTAL02,
              headerTemplate: this.headerTemplateHRTAL02,
            },
          },
          {
            // id: ViewType.tree_list.toString(),
            type: ViewType.tree_list,
            request: this.request,
            sameData: false,
            active: false,
            model: {
              resizable: false,
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
    if (event?.view?.type === 151 || event?.type === 151) {
      this.view.dataService.parentIdField = 'ParentID';
      this.view.dataService.idField = 'orgUnitID';
      this.view.idField = 'orgUnitID';
    } else if (event?.view?.type === 1 || event?.type === 1) {
      this.view.dataService.parentIdField = '';
      this.view.dataService.idField = 'recID';
      this.view.idField = 'recID';
    }
  }
  viewChanged(event: any) {
    // fix bug when chang funcID and from first view tree to  list
    // the view reuse data because same data of list is true
    // reset view data and recall get data
    if (event?.view?.type === 1 || event?.type === 1) {
      if (this.resetView) {
        // this.view.currentView.dataService.data = [];
        // this.view.currentView.dataService.oriData = [];
        this.view.dataService.data = [];
        this.view.dataService.oriData = [];
        this.view.loadData();
        this.resetView = false;
      }
    }
  }
  clickButton(event) {
    let popupData = {
      funcID: this.funcID,
      headerText: this.headerText.length > 0 ? this.headerText : 'Tính phép tiêu chuẩn',
      btnCancel: this.btnCancel,
      btnCalculate: this.btnCalculate,
      grvSetup: this.grvSetup ? this.grvSetup : null,
    }
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let popup = this.callfc.openForm(PopupCalculateAnnualLeaveComponent,
      this.headerText,
      1000,
      600,
      this.funcID,
      popupData,
      null,
      option);

    popup.closed.subscribe(e => {
      // if (e?.event) {
      //   if(this.view.currentView.viewModel.type == 1){
      //     this.view.dataService.data = [];
      //     this.view.dataService.oriData = [];
      //     this.view.loadData();
      //   }else if(this.view.currentView.viewModel.type == 151){
      //     if(this.treeViewDetail){
      //       let ins = setInterval(() => {
      //         if (this.treeViewDetail) {
      //           // this.grid.dataService.rowCount = 0;
      //           // this.grid.dataService.data = [];
      //           clearInterval(ins);
      //           this.treeViewDetail.grid.refresh();
      //         }
      //       }, 500);
        
      //       this.detectorRef.detectChanges();
      //     }
      //   }

      // }
      this.view.dataService.removeIndex(1).subscribe();
    })
  }
  getLanguage() {
    let lang = this.autStore.get().language;
    if (lang.toLowerCase() === 'en') {
      this.headerText = 'Calculate Annual Leave';
      this.btnCancel = 'Cancel';
      this.btnCalculate = 'Calculate';
    } else {
      this.headerText = 'Tính phép tiêu chuẩn';
      this.btnCancel = 'Hủy';
      this.btnCalculate = 'Tính';
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
    this.hrService.getDaysOffByEAnnualLeaveAsync(data.employeeID, data.alYear, data.alYearMonth, 
      data.isMonth, this.pageIndex, this.pageSize).subscribe((res: any) => {
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
