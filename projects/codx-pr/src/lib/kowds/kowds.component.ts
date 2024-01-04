import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CRUDService, CallFuncService, CodxGridviewV2Component, CodxService, NotificationsService, ResourceModel, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { PopupEkowdsComponent } from './popup/popup-ekowds/popup-ekowds.component';
import { PopupCopyEkowdsComponent } from './popup/popup-copy-ekowds/popup-copy-ekowds.component';
import { KowdsScheduleComponent } from './kowds-schedule/kowds-schedule.component';

@Component({
  selector: 'pr-kowds',
  templateUrl: './kowds.component.html',
  styleUrls: ['./kowds.component.css']
})
export class KowdsComponent extends UIComponent{
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
  rowCountCalendarGrid : any;
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
  isOnlyReadSavedData = false;
  dataValues: any;
  entityName: any;
  addHeaderText;
  editHeaderText;
  userPermission: any;
  formHeaderText;
  grvSetup: any;
  arrSearchField : any = [];

  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempDayData', { static: true }) tempDayData: TemplateRef<any>;
  @ViewChild('tempDayHeader', { static: true }) tempDayHeader: TemplateRef<any>;
  @ViewChild('tempEmployeeTC', { static: true }) tempEmployeeTC: TemplateRef<any>;
  @ViewChild('calendarGrid') calendarGrid: CodxGridviewV2Component;
  @ViewChild('calendarGrid2') calendarGrid2: CodxGridviewV2Component;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  // @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
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
      this.timeKeepingMode = res.timeKeepingMode;
      if(this.timeKeepingMode == '2'){
        this.viewStatistic = false;
        this.viewDetailData = true;
      }
    })

    this.getHrKows().subscribe((res) => {
      this.lstHrKow = res;
    })

    //console.log('grv setup' , this.view.gridViewSetup);
    
    
    // this.cache
    // .gridViewSetup(this.view., 'grvKowDsUIByDay')
    // .subscribe((res) => {
    //   this.grvSetup = res;
    // });
    

    // this.testAPILoadDetailData().subscribe((res) => {
    //   console.log('load data mau', res);
    // })

    // this.testAPILoadStatisticData().subscribe((res) => {
    //   console.log('load data statistic mau', res);
    // })

    this.cache.functionList(this.funcID).subscribe((res) => {
      console.log('load tt func', res);
      this.formHeaderText = res.description;
      this.entityName = res.entityName;
      this.getUserPermission().subscribe((res2) => {
        this.userPermission = res2;
        console.log('user per', res2);
      })
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

  onChangeIsReadSavedData(event){
    if(event.data != null){
      this.isOnlyReadSavedData = event.data;
      this.dataValues = [this.filterOrgUnit, this.filterMonth, this.filterYear, this.filterGroupSalCode, this.filterDowCode, this.isOnlyReadSavedData.toString()].join(';');
      // if(this.viewDetailData){
      //   this.calendarGrid.refresh();
      // }
    }
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
  }

  handleSearch(event){
    if(event == ''){
      if(this.viewDetailData == true){
        this.calendarGrid.refresh();
      }
    }
    
    else{
      let data = this.calendarGrid.dataSource
      let resData = []
      if(this.viewDetailData == true){
        let data = this.calendarGrid.dataSource
        for(let i =0; i < this.arrSearchField.length; i++){
          for(let j = 0; j < data.length; j++){
            if(data[j][this.arrSearchField[i]] == event){
              resData.push(data[j])
            }
          }
        }
      }
      this.calendarGrid.dataSource = resData;
    }
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
          this.notify.notifyCode('HR040');
          return;
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
    // let date = event.column.field.substr(8);
    let searchStr = 'workDate'
    let date = parseInt(event.column.field.replace(searchStr,''))
    let data = event.rowData[`workDate${date}`]
    let employeeId = event.rowData.emp.employeeID;
    if(this.userPermission.write != 0 || this.userPermission.isAdmin == true){
      this.handleEmpKows(this.editHeaderText, 'edit', data, employeeId, date)
    }
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
      else if(event[i].functionID == 'SYS104' && (this.userPermission?.write != 0 || this.userPermission?.isAdmin == true)) {
        event[i].disabled = false;
      }
      else if(event[i].functionID == 'SYS102' && (this.userPermission?.delete != 0 || this.userPermission?.isAdmin == true)){
        event[i].disabled = false;
      }
    }
  }

  onLoadedData(event){
    console.log('load data xong', event);
    if(this.view?.gridViewSetup != null){
      this.grvSetup = this.view.gridViewSetup
      let arrObj = Object.keys(this.view?.gridViewSetup).map(key => ({ [key]: this.view?.gridViewSetup[key] }))
      // this.arrSearchField = this.grvSetup.filter((item) => {
      //   return item.isQuickSearch == true;
      // })
      let arrTemp = arrObj.map((item) => {
        let key = Object.keys(item);
        if(item[key[0]].isQuickSearch){
          return key;
        }
        return null;
      })
      this.arrSearchField = []
      for(let i = 0; i < arrTemp.length; i++){
        if(arrTemp[i] != null && this.arrSearchField.indexOf((arrTemp[i])[0]) == -1){
          let str = (arrTemp[i])[0];
          this.arrSearchField.push(Util.camelize(str))
        }
      }
      console.log('arr search field ', this.arrSearchField);
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

  getFunctionList(funcID: string) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'FunctionListBusiness',
      'GetByParentAsync',
      [funcID, true]
    );
  }

  getUserPermission(){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetUserPermission',
      [this.funcID, this.entityName]
    );
  }

  loadDataEmp(){
    // this.getEmpList().subscribe((res) =>{
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

      if(!this.calendarGridColumns.length){
        
        this.calendarGridColumns = []

        this.calendarGridColumns.push({
          //1headerTemplate: 'Nhân viên',
          template: this.tempEmployee,
          field: 'employeeID'
        })

        // this.calendarGridColumns.push({
        //   refField: 'workDate',
        //   loopTimes: this.daysInMonth[this.filterMonth],
        //   // loopTimes: 30,
        //   headerTemplate: this.tempDayHeader,
        //   template: this.tempDayData,
        // })

        debugger
        for(let i = 0; i < this.daysInMonth[this.filterMonth]; i++){
          let date = new Date(this.filterYear, this.filterMonth, i+1);
          let dayOfWeek = date.getDay();
          this.calendarGridColumns.push({
            field: `workDate${i+1}`,
            refField: 'workDate',
            headerTemplate:
            ` ${this.daysOfWeek[dayOfWeek]}
            <div> ${i + 1} </div> `,
            template: this.tempDayData,
          })
        }

      //   let ins = setInterval(() => {
      //   if (this.calendarGrid) {
      //     clearInterval(ins);
      //     let t = this;
      //     this.calendarGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.rowCountCalendarGrid = 0;
      //           t.rowCountCalendarGrid = res['data']?.length;
      //         }
      //       }
      //       console.log('dem rowcount', this.rowCountCalendarGrid);
      //     });
      //     this.rowCountCalendarGrid =
      //       this.calendarGrid.dataService.rowCount;
      //       console.log('dem rowcount', this.rowCountCalendarGrid);
      //   }
      // }, 200);
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

  handleColHeader(data){
    let searchStr = 'workDate'
    let date = parseInt(data.field.replace(searchStr,''))
    let day = new Date(this.filterYear, this.filterMonth, date)
    let dayOfWeek = day.getDay()
    return this.daysOfWeek[dayOfWeek];
  }

  logData(data){
    console.log('Data tra ve template detail', data)

    if(data != null){
      console.log('Data tra ve template detail', data)
    }
  }

  onSelectionChangedTreeOrg(evt){
    this.filterOrgUnit = evt.data.orgUnitID
    this.dataValues = [this.filterOrgUnit, this.filterMonth, this.filterYear, this.filterGroupSalCode, this.filterDowCode, this.isOnlyReadSavedData.toString()].join(';');
    this.loadDataEmp();
  }

  btnClick(event){
    if(this.userPermission.write != 0 || this.userPermission.isAdmin == true){
      this.handleEmpKows(this.addHeaderText, 'add', null, null, new Date());
    }
  }

  handleKowColor(dataArr){
    for(let i =0; i < dataArr.length; i++){
      for(let j = 0; j< this.lstHrKow.length; j++){
        if(dataArr[i].kowCode == this.lstHrKow[j].kowID){
          dataArr[i].background = this.lstHrKow[j].background 
          dataArr[i].fontColor = this.lstHrKow[j].fontColor 
        }
      }
    }
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
      let oldFilterDow = this.filterDowCode;
      let oldFilterGroupSal = this.filterGroupSalCode;
      this.filterDowCode =  event?.data[0].value;
      let temp = event?.data[0].value.split('/');
      this.filterMonth = temp[1];
      this.filterYear = temp[0];

      this.filterGroupSalCode = event?.data[1].value;

      if((this.filterDowCode != oldFilterDow) || this.filterGroupSalCode != oldFilterGroupSal){
        if(this.viewDetailData == true){
          this.calendarGrid.refresh();
        }
      }
  }}
}
