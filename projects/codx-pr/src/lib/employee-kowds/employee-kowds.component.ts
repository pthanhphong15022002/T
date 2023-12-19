import { map } from 'rxjs';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CRUDService, CallFuncService, CodxGridviewV2Component, CodxService, NotificationsService, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { KowdsScheduleComponent } from './kowds-schedule/kowds-schedule.component';
import { PopupEkowdsComponent } from './popup-ekowds/popup-ekowds.component';
import { ActivatedRoute } from '@angular/router';
import { PopupCopyEkowdsComponent } from './popup-copy-ekowds/popup-copy-ekowds.component';

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
  lstHrKow: any = []
  viewActive: string = '';
  orgUnitID: string = '';
  formModelEmployee;
  filterDowCode : any = '2023/12';
  filterGroupSalCode : any = '';
  filterOrgUnit: any;
  filterMonth: any;
  filterYear: any;
  scheduleEvent?: ResourceModel;
  scheduleHeader?: ResourceModel;
  itemSelected: any;
  lstEmp: any = [];
  viewDetailData = true;
  viewStatistic = false;
  timeKeepingMode : any;
  calendarGridColumns: any = [];
  gridStatisticColumns: any = [];

  dataValues: any;

  addHeaderText;
  editHeaderText;
  formHeaderText;

  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempDayData', { static: true }) tempDayData: TemplateRef<any>;
  @ViewChild('tempEmployeeTC', { static: true }) tempEmployeeTC: TemplateRef<any>;
  @ViewChild('calendarGrid') calendarGrid: CodxGridviewV2Component;
  @ViewChild('calendarGrid2') calendarGrid2: CodxGridviewV2Component;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('leftPanel') leftPanel: TemplateRef<any>;
  @ViewChild('tmpPanelRight') tmpPanelRight: TemplateRef<any>;
  @ViewChild('KowdsScheduleComponent') kowdsSchedule: KowdsScheduleComponent;
  dtService: CRUDService;
  constructor(inject: Injector, private hrService: CodxHrService,
    public override codxService : CodxService,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private routeActive: ActivatedRoute,
    ) {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.dtService = new CRUDService(inject);
    this.dtService.idField = "orgUnitID";
  }

  initHeaderText() {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if(res){
        if(res[0]){
          this.addHeaderText = res[0].customName;
        }
        if(res[2]){
          this.editHeaderText = res[2].customName;
        }
      }
    });
  }

  onInit(): void {
    let date = new Date();
    this.filterDowCode = `${date.getFullYear()}/${date.getMonth()+1}`
    console.log('gtri dowcode', this.filterDowCode);
     
    this.initHeaderText();
    this.getTimeKeepingMode().subscribe((res) => {
      console.log('get time keeping', res);
      this.timeKeepingMode = res.timeKeepingMode;
      if(this.timeKeepingMode == '2'){
        this.viewStatistic = false;
        this.viewDetailData = true;
      }
    })

    this.getHrKows().subscribe((res) => {
      this.lstHrKow = res;
    })

    // this.testAPILoadDetailData().subscribe((res) => {
    //   console.log('load data mau', res);
    //   debugger
    // })

    // this.testAPILoadStatisticData().subscribe((res) => {
    //   console.log('load data statistic mau', res);
    // })

    this.cache.functionList(this.funcID).subscribe((res) => {
      console.log('load tt func', res);
      this.formHeaderText = res.description;
    })

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
          collapsed: true,
          resizable: true,
        },
      },
    ];
    // }

  }

  clickMF(event){
    switch (event.functionID){
      // case 'SYS04': //copy
      // break;
      // case 'SYS02': //delete
      // let lstEmpID2 = this.calendarGrid.arrSelectedRows.map((data) => {
      //   return data.employeeID;
      // })

      // console.log('lst emp map dc', lstEmpID2);
      // break;
      case 'SYS104':
        if(this.calendarGrid.arrSelectedRows.length > 1){
          this.notify.notifyCode('HR038');
          return;
        }
        else if(this.calendarGrid.arrSelectedRows.length < 0)
        {

        }
        else{
          this.handleCopyEmpKows('Sao chép', 'copy', this.calendarGrid.arrSelectedRows[0])
        }
      break;
      case 'SYS102':
        let lstEmpID = this.calendarGrid.arrSelectedRows.map((data) => {
          return data.employeeID;
        })

        this.notify.alertCode('SYS030').subscribe((x) => {
          if(x.event?.status == 'Y'){
            console.log('lst emp map dc', lstEmpID);
            this.deleteEmpKowByDowCode(lstEmpID.join(';'), this.filterDowCode).subscribe((res) =>{
              if(res == true){
                this.notify.notifyCode('SYS008');
                this.calendarGrid.refresh();
              }
            });
          }
        })
      break;
    }
  }

  doubleClickGrid(event){
    console.log('event double click', event);
    // document.querySelector('[data-colindex="2"]').textContent
    let date = event.column.index;
    let data = event.rowData[`workDate${date}`]
    let employeeId = event.rowData.emp.employeeID;
    this.handleEmpKows(this.editHeaderText, 'edit', data, employeeId, date)
  }

  handleEmpKows(actionHeaderText, actionType: string, data: any, employeeId, date){
    let option = new SidebarModel();
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialog = this.callfunc.openSide(
      PopupEkowdsComponent,
      {
        funcID: this.funcID,
        headerText: actionHeaderText + ' ' + this.formHeaderText,
        dataObj: data,
        employeeId: employeeId,
        selectedDate : date,
        crrYear: this.filterYear,
        crrMonth: this.filterMonth,
        dowCode: this.filterDowCode
      },
      option
    )

    dialog.closed.subscribe((res) => {
      if(res?.event){
        if(this.viewDetailData == true) {
          this.calendarGrid.refresh();
        }
        else if(this.viewStatistic == true){
          this.calendarGrid2.refresh();
        }
      }
    })
  }

  handleCopyEmpKows(actionHeaderText, actionType: string, data: any){
    debugger
    let option = new SidebarModel();
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialog = this.callfunc.openSide(
      PopupCopyEkowdsComponent,
      {
        funcID: this.funcID,
        employeeId: data.employeeID,
        dowCode: this.filterDowCode,
        // headerText: actionHeaderText + ' ' + this.formHeaderText,
        headerText: 'Sao chép dữ liệu công',
        dataObj: data
      },
      option
    )

    dialog.closed.subscribe((res) => {
      if(res?.event){
        if(this.viewDetailData == true) {
          this.calendarGrid.refresh();
        }
        else if(this.viewStatistic == true){
          this.calendarGrid2.refresh();
        }
      }
    })
  }

  handleShowHideMF(event){
    for(let i = 0; i < event.length; i++){
      if(event[i].functionID == 'SYS04'){
        event[i].disabled = true;
      }
      else if(event[i].functionID == 'SYS104' || event[i].functionID == 'SYS102'){
        event[i].disabled = false;
      }
    }
  }

  switchModeView(mode){
    if(mode == 1){
      this.viewDetailData = true;
      this.viewStatistic = false;
    }
    else if(mode == 2){
      this.viewStatistic = true;
      this.viewDetailData = false;
    }
    this.loadDataInGrid();
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

  getLstEmpKowStatistic(data){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetListEmpKowStatisticAsync',
      [data, this.filterMonth, this.filterYear]
    );
  }

  getTimeKeepingMode(){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetTimeKeepingModeAsync'
    );
  }

  copyEmpKow(empIDResources, empIDsCopy, dowCode){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'CopyEmpKowAsync',
      [empIDResources, empIDsCopy, dowCode]
    );
  }

  deleteEmpKowByDowCode(empIDS, dowCode){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'DeleteEmpKowAsyncByDowCodeAsync',
      [empIDS, dowCode]
    );
  }

  getHrKows() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetHrKows',
      []
    );
  }

  testAPILoadDetailData() {
    console.log('chay ham get emp',this.filterOrgUnit, this.filterMonth, this.filterYear);
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'LoadDataForGridAsync',
      []
    );
  }

  testAPILoadStatisticData() {
    console.log('chay ham get emp',this.filterOrgUnit, this.filterMonth, this.filterYear);
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'LoadDataForGridStatisticAsync',
      []
    );
  }

  loadDataEmp(){
    // this.getEmpList().subscribe((res) =>{
    // debugger
    // console.log('nv tra ve', res);
    //   this.lstEmp = res[0]
    //   for(let i = 0; i < this.lstEmp.length; i++){
    //     if(this.lstEmp[i].employeeID){
    //       this.lstEmp[i].positionName = res[1][i];
    //     }
    //     else{
    //       console.log('nv k co id', this.lstEmp[i]);
    //     }
    //   }
    //   this.loadDataInGrid()
    // }
    // )

    this.loadDataInGrid()

  }

  loadDataInGrid(){
    if(this.viewDetailData == true){
      // this.gridDataSource = this.lstEmp;
      // for(let i = 0; i < this.gridDataSource.length; i++){
      //   for(let j = 0; j < this.daysInMonth[this.filterMonth]; j++){
      //     let strField = `day${j+1}`
      //     this.gridDataSource[i][strField] = [{kowCode: j+1,
      //       dayNum: j+2}, {kowCode: j+1,
      //         dayNum: j+2},
      //         {kowCode: j+1,
      //           dayNum: j+2},
      //           {kowCode: j+1,
      //             dayNum: j+2}];
      //   }
      // }
      // this.gridDataSource = [...this.gridDataSource]
      // console.log('griddd dts', this.gridDataSource);

      debugger
      if(!this.calendarGridColumns.length){
        
        this.calendarGridColumns = []

        this.calendarGridColumns.push({
          headerTemplate: 'Nhân viên',
          template: this.tempEmployee,
          field: 'employeeID'
        })

        this.calendarGridColumns.push({
          refField: 'workDate',
          loopTimes: this.daysInMonth[this.filterMonth],
          // loopTimes: 30,
          template: this.tempDayData,
        })

        // for(let i = 0; i < this.daysInMonth[this.filterMonth]; i++){
        //   let date = new Date(this.filterYear, this.filterMonth, i+1);
        //   let dayOfWeek = date.getDay();
        //   this.calendarGridColumns.push({
        //     field: `day${i+1}`,
        //     headerTemplate:
        //     ` ${this.daysOfWeek[dayOfWeek]}
        //     <div> ${i + 1} </div> `,
        //     template: this.tempDayData,
        //     width: '150',
        //   })
        // }
      this.calendarGridColumns = [...this.calendarGridColumns]
      }

    if(this.calendarGrid){
      this.calendarGrid.refresh(true);
    }
  }
    else if(this.viewStatistic == true){
      if( !this.gridStatisticColumns.length)
        this.gridStatisticColumns = [
          {
            headerTemplate: 'Nhân viên',
            template: this.tempEmployee,
            width: '350',
          },
          {
            headerTemplate: 'Tổng công',
            field: `tc`,
            template: this.tempEmployeeTC,
            width: '150',
          },
          {
            headerTemplate: 'OT15 (h)',
            field: `oT15`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'OT20 (h)',
            field: `oT20`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'L',
            field: `l`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'P',
            field: `p`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'H',
            field: `h`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'Ro',
            field: `ro`,
            // template: this.tempEmployee,
            width: '150',
          },
          {
            headerTemplate: 'CO',
            field: `co`,
            // template: this.tempEmployee,
            width: '150',
          },
        ]

      let lstEmpID = this.lstEmp.map((obj) => {
        return obj.employeeID;
      })

      console.log(lstEmpID);
      this.getLstEmpKowStatistic(lstEmpID).subscribe((res) => {
        // console.log('lst emp co data', res[`E-0019`]);
        // console.log('lst emp ko data', this.lstEmp);

        let lstResult = [];
        for(let i = 0; i < lstEmpID.length; i++){
          lstResult.push({
            ...this.lstEmp[i], ...res[this.lstEmp[i].employeeID]
          })
        }
        // for(let i = 0; i < lstResult.length; i++){
        //   if(lstResult[i].employeeID == 'E-0019'){
        //     console.log('lst result', lstResult[i]);
        //   }
        // }
        this.gridDataSourceStatistic = [...lstResult];
        // if(this.calendarGrid2){
        //   this.calendarGrid2.dataSource = this.gridDataSourceStatistic;
        // }
        if(this.calendarGrid2){
          console.log('data moi', this.gridDataSourceStatistic);

          this.calendarGrid2.refresh(true);
        }
      })

    }
  }

  onSelectionChanged(evt){

  }

  logData(data){
    console.log('Data tra ve template detail', data)

    if(data != null){
      console.log('Data tra ve template detail', data)
    }
  }

  onSelectionChangedTreeOrg(evt){
    this.filterOrgUnit = evt.data.orgUnitID
    this.dataValues = [this.filterOrgUnit, this.filterMonth, this.filterYear, this.filterGroupSalCode, this.filterDowCode].join(';');
    this.loadDataEmp();
  }

  btnClick(event){
    this.handleEmpKows(this.addHeaderText, 'add', null, null, new Date());
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
      console.log('filter thay doi', event)
      this.filterDowCode =  event?.data[0].value;
      let temp = event?.data[0].value.split('/');
      this.filterMonth = temp[1];
      this.filterYear = temp[0];

      let groupSalCode = event?.data[1];
      console.log('filter month', this.filterMonth);
      console.log('filter year', this.filterYear);
      console.log('filter groupSalCode', groupSalCode);
  }}

  // callFunc(event){
  //   debugger
  // }

}
