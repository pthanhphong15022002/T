import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CRUDService, CodxGridviewV2Component, CodxService, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { KowdsScheduleComponent } from './kowds-schedule/kowds-schedule.component';

@Component({
  selector: 'lib-employee-kowds',
  templateUrl: './employee-kowds.component.html',
  styleUrls: ['./employee-kowds.component.css']
})
export class EmployeeKowdsComponent extends UIComponent{
  daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  days = [];
  daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  gridDataSource: any = [];
  gridDataSourceStatistic: any = [];
  views: Array<ViewModel>;
  request: any = null;
  requestTitle: any = null;
  buttonAdd: ButtonModel[];
  viewActive: string = '';
  orgUnitID: string = '';
  formModelEmployee;
  filterOrgUnit: any;
  filterMonth: any;
  filterYear: any;
  scheduleEvent?: ResourceModel;
  scheduleHeader?: ResourceModel;
  itemSelected: any;
  lstEmp: any = [];
  viewDetailData = true;
  viewStatistic = false;

  calendarGridColumns: any = [];
  gridStatisticColumns: any = [];
  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempDayData', { static: true }) tempDayData: TemplateRef<any>;
  @ViewChild('calendarGrid') calendarGrid: CodxGridviewV2Component;
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
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }

    let tempDate = new Date();
    this.filterMonth = tempDate.getMonth();
    this.filterYear = tempDate.getFullYear();

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
          collapsed: false,
          resizable: false,
          widthLeft: 350
        },
      },
    ];
    // }

    this.calendarGridColumns.push({
      headerTemplate: 'Nhân viên',
      template: this.tempEmployee,
      width: '350',
    })

    this.gridStatisticColumns = [
      {
        headerTemplate: 'Nhân viên',
        template: this.tempEmployee,
        width: '350',
      },
      {
        headerTemplate: 'Tổng công',
        field: `TC`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'OT15 (h)',
        field: `OT15`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'OT20 (h)',
        field: `OT20`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'L',
        field: `L`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'P',
        field: `P`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'H',
        field: `H`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'Ro',
        field: `Ro`,
        // template: this.tempEmployee,
        width: '150',
      },
      {
        headerTemplate: 'CO',
        field: `CO`,
        // template: this.tempEmployee,
        width: '150',
      },
    ]
    // this.loadDataInGrid();
  }

  clickMF(event, data){

  }

  doubleClickGrid(event){
    console.log('event double click', event);
    debugger
    // document.querySelector('[data-colindex="2"]').textContent

    let date = event.column.index;
    let employeeId = event.rowData.employeeID;
  }

  getEmpList() {
    console.log('chay ham get emp',this.filterOrgUnit, this.filterMonth, this.filterYear);
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetEmpByOrgUnitIDAsync',
      [this.filterOrgUnit, this.filterMonth, this.filterYear]
    );
  }

  loadDataInGrid(){
    this.getEmpList().subscribe((res) =>{
    debugger
    console.log('nv tra ve', res);
    
      this.lstEmp = res[0]
      for(let i = 0; i < this.lstEmp.length; i++){
        if(this.lstEmp[i].employeeID){
          this.lstEmp[i].positionName = res[1][i];
        }
        else{
          console.log('nv k co id', this.lstEmp[i]);
        }
      }
      if(this.viewDetailData == true){
        this.gridDataSource = this.lstEmp;
        for(let i = 0; i < this.gridDataSource.length; i++){
          for(let j = 0; j < this.daysInMonth[this.filterMonth]; j++){
            let strField = `day${j+1}`
            this.gridDataSource[i][strField] = [j+1, j+1, j+1,j+1, j+1];
          }
        }
        for(let i = 0; i < this.daysInMonth[this.filterMonth]; i++){
          let date = new Date(this.filterYear, this.filterMonth, i+1);
          let dayOfWeek = date.getDay();
          this.calendarGridColumns.push({
            field: `day${i+1}`,
            headerTemplate: 
            ` ${this.daysOfWeek[dayOfWeek]} 
            <div> ${i + 1} </div> `,
            template: this.tempDayData,
            width: '150',
          })
        }
      }
      else if(this.viewStatistic == true){

      }
    
    }
    )


    console.log('gridColGrid', this.calendarGridColumns);
  }

  onSelectionChanged(evt){

  }

  onSelectionChangedTreeOrg(evt){
    this.filterOrgUnit = evt.data.orgUnitID
    this.loadDataInGrid();
  }

  btnClick(event){

  }

  viewChanged(event: any) {
    // if (this.viewActive !== event.view.id) {
    //   // if (this.viewActive !== event.view.id && this.flagLoaded) {
    //   if (event?.view?.id === '1') {
    //     this.view.dataService.data = [];
    //     this.view.dataService.parentIdField = '';
    //   } else {
    //     this.view.dataService.parentIdField = 'ParentID';
    //   }
    //   if (
    //     this.view.currentView.dataService &&
    //     this.view.currentView.dataService.currentComponent
    //   ) {
    //     this.view.currentView.dataService.data = [];
    //     this.view.currentView.dataService.currentComponent.dicDatas = {};
    //   }

    //   //check update data when CRUD or not
    //   // this.flagLoaded = false;
    //   this.view.dataService.page = 0;

    //   //Prevent load data when click same id
    //   this.viewActive = event.view.id;
    //   this.view.currentView.dataService.load().subscribe();
    //   //this.view.dataService.load().subscribe();
    // }
  }

  onAction(event){
    // thay doi gia tri filter
    if(event.type == 'pined-filter'){

    }
  }

  // callFunc(event){
  //   debugger
  // }

}
