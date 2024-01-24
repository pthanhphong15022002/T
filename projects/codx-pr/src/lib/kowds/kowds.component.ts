import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CRUDService,
  CallFuncService,
  CodxGridviewV2Component,
  CodxService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RealHub,
  RealHubService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { PopupEkowdsComponent } from './popup/popup-ekowds/popup-ekowds.component';
import { PopupCopyEkowdsComponent } from './popup/popup-copy-ekowds/popup-copy-ekowds.component';
import { KowdsScheduleComponent } from './kowds-schedule/kowds-schedule.component';
import { ViewKowcodeComponent } from '../request-kowds/view-kowcode/view-kowcode.component';

@Component({
  selector: 'pr-kowds',
  templateUrl: './kowds.component.html',
  styleUrls: ['./kowds.component.css'],
})
export class KowdsComponent extends UIComponent {
  daysOfWeek = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ];
  days = [];
  daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  gridDataSource: any = [];
  gridDataSourceStatistic: any = [];
  views: Array<ViewModel>;
  request: any = null;
  requestTitle: any = null;
  buttonAdd: ButtonModel[];
  lstHrKow: any = [];
  viewActive: string = '';
  orgUnitID: string = '';
  formModelEmployee;
  rowCountCalendarGrid: any;
  filterDowCode: any = '2023/12';
  filterGroupSalCode: any = '';
  filterOrgUnit: any;
  filterMonth: any;
  filterYear: any;
  scheduleEvent?: ResourceModel;
  scheduleHeader?: ResourceModel;
  itemSelected: any;
  lstEmp: any = [];
  viewDetailData = true;
  viewStatistic = false;
  timeKeepingMode: any;
  calendarGridColumns: any = [];
  columnTotalKow = [];
  isOnlyReadSavedData = false;
  dataValues: any;
  entityName: any;
  addHeaderText;
  editHeaderText;
  userPermission: any;
  formHeaderText;
  grvSetup: any;
  arrSearchField: any = [];
  gridKow: any;
  @ViewChild('tempDayHeader', { static: true }) tempDayHeader: TemplateRef<any>;
  @ViewChild('calendarGrid') calendarGrid: CodxGridviewV2Component;
  @ViewChild('gridTotal') gridTotal: CodxGridviewV2Component;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('leftPanel') leftPanel: TemplateRef<any>;
  @ViewChild('tmpPanelRight') tmpPanelRight: TemplateRef<any>;
  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempKowTotal', { static: true }) tempKowTotal: TemplateRef<any>;
  @ViewChild('tempKow', { static: true }) tempKow: TemplateRef<any>;

  @ViewChild('tmpPopupKowD') tmpPopupKowD: TemplateRef<any>;

  dtService: CRUDService;
  cbbKowCode: any;
  loadedTotalGrid = false;
  gridTotalFM: FormModel;
  setHeighted = false;
  funcList: any;
  weekDayVLL = [];
  showCalendarGrid=false;
  loadedCalendarGrid: boolean;
  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    public override codxService: CodxService,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private routeActive: ActivatedRoute,
    private realHub: RealHubService,
  ) {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.dtService = new CRUDService(inject);
    this.dtService.idField = 'orgUnitID';
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.gridTotalFM = new FormModel();
    this.gridTotalFM.formName = 'KowDs';
    this.gridTotalFM.gridViewName = 'grvKowDsUIByKow';
    this.gridTotalFM.entityName = 'TS_KowDs';
    this.loadGridTotal();

    let tempDate = new Date();
    this.filterMonth = tempDate.getMonth();
    this.filterYear = tempDate.getFullYear();
    if(this.filterMonth + 1 < 10)
      this.filterDowCode = this.filterYear + '/0' + (this.filterMonth + 1);
    else
      this.filterDowCode = this.filterYear + '/' + (this.filterMonth + 1);

    this.initHeaderText();

    this.getTimeKeepingMode().subscribe((res) => {
      this.timeKeepingMode = res.timeKeepingMode;
      if (this.timeKeepingMode == '2') {
        this.viewStatistic = false;
        this.viewDetailData = true;
      }
    });

    this.cache.functionList(this.funcID).subscribe((res) => {
      this.funcList = res;
      this.formHeaderText = res?.description ?? 'Bảng công tháng';
      this.entityName = res?.entityName;
      this.getUserPermission().subscribe((res2) => {
        this.userPermission = res2;
      });
    });

    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });

    this.buttonAdd = [
      {
        id: 'btnAdd',
      },
    ];

    this.realHub.start("hr").then((x: RealHub) => {
      if(x)
      {
        x.$subjectReal.asObservable().subscribe((z) => {
          // process 
          if(z && (z.event == 'GenKowDsAsync') && z.message == this.session) 
          {
            let idx = z.data["id"] - 1;
            let value =  z.data["value"];
            let iteration =  z.data["iteration"];
            let totalIteration =  z.data["totalIteration"];

            if(this.processObj[idx])
            {
              this.processObj[idx].value = value.toFixed(2);
              this.processObj[idx].iteration = iteration;
              this.processObj[idx].totalIteration = totalIteration;
            }
            if(value == 100)
            {
              setTimeout(() => {
                this.clickRemoveProcess(idx);
              },3000);
            }
            this.detectorRef.detectChanges();
          }
        });
      }
    });

    
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '3',
        type: ViewType.content,
        sameData: false,

        model: {
          panelRightRef: this.tmpPanelRight,
          panelLeftRef: this.leftPanel,
          widthLeft: 300,
          collapsed: true,
          resizable: true,
        },
      },
    ];
  }
  afterRenderList() {
    if (!this.setHeighted) {
      let html = document
        ?.getElementById('chartOrg')
        ?.getElementsByClassName('card-body');
      if (html?.length > 0) {
        let body = Array.from(html as HTMLCollectionOf<HTMLElement>)[0];
        body.style.height = body.offsetHeight - 50 + 'px';
      }
      this.setHeighted = true;
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  loadGridTotal() {
    this.cache
      .gridViewSetup('KowDs', 'grvKowDsUIByKow')
      .subscribe((res: any) => {
        if (res) {
          this.columnTotalKow = [];
          this.gridKow = Util.camelizekeyObj(res);
          for (let field in this.gridKow) {
            if (this.gridKow[field]?.fieldName == 'EmployeeID') {
              this.columnTotalKow.push({
                width:300,
                template: this.tempEmployee,
                field: 'employeeID',
              });
            } else if (this.gridKow[field]?.fieldName == 'KowCode') {
              let gridModel = new DataRequest();
              gridModel.pageLoading = false;
              gridModel.comboboxName = this.gridKow[field]?.referedValue;
              this.api
                .execSv(
                  'HR',
                  'ERM.Business.Core',
                  'DataBusiness',
                  'LoadDataCbxAsync',
                  [gridModel]
                )
                .subscribe((cbx: any) => {
                  if (cbx && cbx[0] != null) {
                    this.cbbKowCode = JSON.parse(cbx[0]);
                    if (this.cbbKowCode?.length > 0) {
                      this.cbbKowCode.forEach((kow) => {
                        this.columnTotalKow.push({
                          headerText: kow?.KowID,
                          template: this.tempKowTotal,
                          field: kow?.KowID,
                          refField: 'kowCode',
                        });
                      });
                    }
                    this.loadedTotalGrid = true;
                    this.detectorRef.detectChanges();
                  }
                });
            }
          }
        }
      });
  }

  createMonthColumn(){
    let dates = new Date(this.filterYear, this.filterMonth+1, 0)?.getDate();
    let weekDay;
    for (let day = 1; day <= dates; day++) {
      if (day == 1) {
        weekDay = new Date(
          this.filterYear,
          this.filterMonth,
          1
        ).getDay();
      } else {
        weekDay = weekDay >= 6 ? 0 : weekDay + 1;
      }
      let dayInWeek = this.weekDayVLL?.find((x) => x.value == weekDay)?.text ?? '';
      this.calendarGridColumns.push({
        field: day.toString(),
        refField: 'workDate',
        headerTemplate: ` ${dayInWeek}
            <div> ${day} </div> `,
        template: this.tempKow,
      });
    }
    this.loadedCalendarGrid=true;
    this.detectorRef.detectChanges();
  }

  loadDataInGrid(reloadColumn = false) {
    if (this.viewDetailData == true) {
      if (!this.calendarGridColumns.length || reloadColumn) {
        this.calendarGridColumns = [];
        this.loadedCalendarGrid=false;
        this.detectorRef.detectChanges();
        this.calendarGridColumns.push({
          width:300,
          template: this.tempEmployee,
          field: 'employeeID',
        });
        
        if (this.weekDayVLL?.length == 0) {
          this.cache.valueList('L0012').subscribe((vll) => {
            if (vll) {
              this.weekDayVLL = vll?.datas;
              this.createMonthColumn();
            }
          });
        } else {
          this.createMonthColumn();          
        }
      }

      if (this.calendarGrid ) {
        this.calendarGrid.refresh(true);
      }
    } else if (this.viewStatistic == true) {
      if (!this.columnTotalKow.length) {
        this.columnTotalKow = [];
        this.cache
          .gridViewSetup('KowDs', 'grvKowDsUIByKow')
          .subscribe((res: any) => {
            if (res) {
              this.columnTotalKow = [];
              this.gridKow = Util.camelizekeyObj(res);
              for (let field in this.gridKow) {
                if (this.gridKow[field]?.fieldName == 'EmployeeID') {
                  this.columnTotalKow.push({
                    headerTemplate: 'Nhân viên',
                    template: this.tempEmployee,
                    field: 'employeeID',
                  });
                } else if (this.gridKow[field]?.fieldName == 'KowCode') {
                  let gridModel = new DataRequest();
                  gridModel.pageLoading = false;
                  gridModel.comboboxName = this.gridKow[field]?.referedValue;
                  this.api
                    .execSv(
                      'HR',
                      'ERM.Business.Core',
                      'DataBusiness',
                      'LoadDataCbxAsync',
                      [gridModel]
                    )
                    .subscribe((cbx: any) => {
                      if (cbx && cbx[0] != null) {
                        this.cbbKowCode = JSON.parse(cbx[0]);
                        if (this.cbbKowCode?.length > 0) {
                          this.cbbKowCode.forEach((kow) => {
                            this.columnTotalKow.push({
                              headerText: kow?.KowID,
                              template: this.tempKowTotal,
                              field: kow?.KowID,
                              refField: 'kowCode',
                            });
                          });
                        }
                        this.detectorRef.detectChanges();
                      }
                    });
                }
              }
            }
          });
      }
      if (this.gridTotal) {
        this.gridTotal.refresh(true);
      }
      
    }
    this.detectorRef.detectChanges();
  }

  onLoadedData(event) {
    if (this.view?.gridViewSetup != null) {
      this.grvSetup = this.view.gridViewSetup;
      let arrObj = Object.keys(this.view?.gridViewSetup).map((key) => ({
        [key]: this.view?.gridViewSetup[key],
      }));
      let arrTemp = arrObj.map((item) => {
        let key = Object.keys(item);
        if (item[key[0]].isQuickSearch) {
          return key;
        }
        return null;
      });
      this.arrSearchField = [];
      for (let i = 0; i < arrTemp.length; i++) {
        if (
          arrTemp[i] != null &&
          this.arrSearchField.indexOf(arrTemp[i][0]) == -1
        ) {
          let str = arrTemp[i][0];
          this.arrSearchField.push(Util.camelize(str));
        }
      }
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  onChangeIsReadSavedData(event) {
    if (event.data != null) {
      this.isOnlyReadSavedData = event.data;
      this.dataValues = [
        this.filterOrgUnit,
        this.filterMonth +1,
        this.filterYear,
        this.filterGroupSalCode,
        this.filterDowCode,
        this.isOnlyReadSavedData.toString(),
      ].join(';');
      this.detectorRef.detectChanges();
      this.loadDataInGrid();
    }
  }

  
  handleShowHideMF(event) {
    if(event && event.length > 0)
    {
      event.forEach((mfc:any) => 
      {
        switch(mfc.functionID)
        {
          case "SYS104":
            if(this.userPermission?.write != 0 || this.userPermission?.isAdmin == true)
            {
              mfc.disabled = false;
              mfc.isbookmark = true;
            }
          break;
          case "SYS102":
            if(this.userPermission?.delete != 0 || this.userPermission?.isAdmin == true)
            {
              mfc.disabled = false;
              mfc.isbookmark = true;
            }
          break;
          case "HRTPro18A14":
            if(this.modeView == 1 && this.userPermission?.write != 0 || this.userPermission?.isAdmin == true)
            {
              mfc.disabled = false;
              mfc.isbookmark = true;
              mfc.isblur = false;
            }
            else
            {
              mfc.disabled = true;
            }
          break;
          default:
            mfc.disabled = true;
            break;
        }
      });
    }
  }

  // clikc morefunction
  clickMF(event) {
    switch (event.functionID) {
      case 'SYS104':
        if (this.calendarGrid.arrSelectedRows.length > 1) {
          this.notify.notifyCode('HR038');
          return;
        } else if (this.calendarGrid.arrSelectedRows.length < 0) {
          this.notify.notifyCode('HR040');
          return;
        } else 
        {
          this.handleCopyEmpKows(
            'Sao chép',
            'copy',
            this.calendarGrid.arrSelectedRows[0]
          );
        }
        break;
      case 'SYS102':
        let lstEmpID = this.calendarGrid.arrSelectedRows.map((data) => {
          return data.employeeID;
        });

        this.notify.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            this.deleteEmpKowByDowCode(
              lstEmpID.join(';'),
              this.filterDowCode
            ).subscribe((res) => {
              if (res == true) {
                this.notify.notifyCode('SYS008');
                this.calendarGrid.refresh();
              }
            });
          }
        });
        break;
      case 'HRTPro18A14':
        this.openPopupGenKowD();
        break;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  modeView:number = 1; // 1: Chi tiết theo ngày; 2: Bảng công tổng hợp
  switchModeView(mode) {
    if (mode == 1) 
    {
      this.viewDetailData = true;
      this.viewStatistic = false;
    } 
    else if (mode == 2) 
    {
      this.viewStatistic = true;
      this.viewDetailData = false;
    }
    let elements = document.getElementsByClassName("icon-system_update_alt");
    if(elements.length > 0)
    {
      let btn = elements[0].parentElement;
      if(btn)
      {
        mode == 1 ? btn.classList.remove("d-none") : btn.classList.add("d-none");
      }
    }
    this.modeView = mode;
    this.detectorRef.detectChanges();
    this.loadDataInGrid();
  }

  initHeaderText() {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res) {
        if (res[0]) {
          this.addHeaderText = res[0].customName;
        }
        if (res[2]) {
          this.editHeaderText = res[2].customName;
        }
      }
    });
  }
  
  handleSearch(event) {
    if (event == '') {
      if (this.viewDetailData == true) {
        this.calendarGrid.refresh();
      }
    } else {
      let data = this.calendarGrid.dataSource;
      let resData = [];
      if (this.viewDetailData == true) {
        let data = this.calendarGrid.dataSource;
        for (let i = 0; i < this.arrSearchField.length; i++) {
          for (let j = 0; j < data.length; j++) {
            if (data[j][this.arrSearchField[i]] == event) {
              resData.push(data[j]);
            }
          }
        }
      }
      this.calendarGrid.dataSource = resData;
    }
  }

  doubleClickGrid(event) {
    let data = event.rowData[event.column.field];
    let employeeId = event?.rowData?.EmployeeID;
    if (this.userPermission.write != 0 || this.userPermission.isAdmin == true) {
      this.handleEmpKows(
        this.editHeaderText,
        'edit',
        data,
        employeeId,
        event.column.field
      );
    }
  }

  onSelectionChangedTreeOrg(evt) {
    this.afterRenderList();
    this.filterOrgUnit = evt?.data?.orgUnitID;
    this.dataValues = [
      this.filterOrgUnit,
      this.filterMonth +1,
      this.filterYear,
      this.filterGroupSalCode,
      this.filterDowCode,
      this.isOnlyReadSavedData.toString(),
    ].join(';');
    this.detectorRef.detectChanges();
    this.loadDataInGrid();
  }

  btnClick(event) {
    if (this.userPermission.write != 0 || this.userPermission.isAdmin == true) {
      this.handleEmpKows(this.addHeaderText, 'add', null, null, new Date());
    }
  }

  handleKowColor(dataArr) {
    for (let i = 0; i < dataArr.length; i++) {
      for (let j = 0; j < this.lstHrKow.length; j++) {
        if (dataArr[i].kowCode == this.lstHrKow[j].kowID) {
          dataArr[i].background = this.lstHrKow[j].background;
          dataArr[i].fontColor = this.lstHrKow[j].fontColor;
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

  onAction(event) {
    // thay doi gia tri filter
    if (event.type == 'pined-filter') {
      let oldFilterDow = this.filterDowCode;
      let oldFilterGroupSal = this.filterGroupSalCode;
      if (event?.data?.length > 0) {
        let dowCode = event?.data?.find((x) => x.field == 'DowCode');
        this.filterDowCode = dowCode?.value ?? null;

        let temp = this.filterDowCode?.split('/');
        this.filterMonth = temp[1] - 1;
        this.filterYear = temp[0];

        let groupSC = event?.data?.find((x) => x.field == 'GroupSalCode');
        this.filterGroupSalCode = groupSC?.value ?? null;
      } else {
        this.filterMonth = null;
        this.filterYear = null;
        this.filterDowCode = null;
        this.filterGroupSalCode = null;
      }
      this.detectorRef.detectChanges();
      if (
        this.filterDowCode != oldFilterDow ||
        this.filterGroupSalCode != oldFilterGroupSal
      ) {
        if (this.viewDetailData == true) {
          this.loadDataInGrid(true);
        }
      }
    }
  }

  onSelectionChanged(evt) {}

  handleColHeader(data) {
    let searchStr = 'workDate';
    let date = parseInt(data.field.replace(searchStr, ''));
    let day = new Date(this.filterYear, this.filterMonth, date);
    let dayOfWeek = day.getDay();
    return this.daysOfWeek[dayOfWeek];
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//

  explanPopup() {
    let dialogKowCode = this.callfc.openForm(
      ViewKowcodeComponent,
      '',
      350,
      500,
      null,
      this.cbbKowCode
    );
  }

  handleEmpKows(
    actionHeaderText,
    actionType: string,
    data: any,
    employeeId,
    date
  ) {
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
        selectedDate: date,
        crrYear: this.filterYear,
        crrMonth: this.filterMonth,
        dowCode: this.filterDowCode,
      },
      option
    );

    dialog.closed.subscribe((res) => {
      if (res?.event) {
        if (this.viewDetailData == true) {
          this.calendarGrid.refresh();
        } else if (this.viewStatistic == true) {
          this.gridTotal.refresh();
        }
      }
    });
  }

  handleCopyEmpKows(actionHeaderText, actionType: string, data: any) {
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
        dataObj: data,
      },
      option
    );

    dialog.closed.subscribe((res) => {
      if (res?.event) {
        if (this.viewDetailData == true) {
          this.calendarGrid.refresh();
        } else if (this.viewStatistic == true) {
          this.gridTotal.refresh();
        }
      }
    });
  }

  getEmpList() {
    console.log(
      'chay ham get emp',
      this.filterOrgUnit,
      this.filterMonth,
      this.filterYear
    );
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetEmpByOrgUnitIDAsync',
      [this.filterOrgUnit, this.filterMonth, this.filterYear]
    );
  }

  getLstEmpKowStatistic(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetListEmpKowStatisticAsync',
      [data, this.filterMonth, this.filterYear]
    );
  }

  getTimeKeepingMode() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetTimeKeepingModeAsync'
    );
  }

  copyEmpKow(empIDResources, empIDsCopy, dowCode) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'CopyEmpKowAsync',
      [empIDResources, empIDsCopy, dowCode]
    );
  }

  deleteEmpKowByDowCode(empIDS, dowCode) {
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
    console.log(
      'chay ham get emp',
      this.filterOrgUnit,
      this.filterMonth,
      this.filterYear
    );
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'LoadDataForGridAsync',
      []
    );
  }

  testAPILoadStatisticData() {
    console.log(
      'chay ham get emp',
      this.filterOrgUnit,
      this.filterMonth,
      this.filterYear
    );
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

  getUserPermission() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetUserPermission',
      [this.funcID, this.entityName]
    );
  }

  openPopupGenKowD(){
    let arrIdx = this.calendarGrid.selectedIndexes;
    if(arrIdx && arrIdx.length > 0)
    {
      let dialog = new DialogModel();
      dialog.FormModel = this.view.formModel;
      this.kowDOption = "1";
      this.callfc.openForm(this.tmpPopupKowD,"",500,300,"",null,"",dialog);
    }
    else this.notify.notifyCode("HR040");
    
  } 

  kowDOption:string;
  kowCode:string;
  valueChange(event){
    let field = event.field;
    let value = event.data;
    switch(field)
    {
      case "kowDOption":
        this.kowDOption = value;
      break;
      case "kowCode":
        this.kowCode = value;
      break;
    }
  }


  clickBtn(dialog:DialogRef){
    if(!this.filterDowCode)
    {
      this.notify.notify("Vui lòng chọn kỳ công");
      return;
    }
    if(!this.kowCode)
    {
      this.notify.notifyCode("HR041");
      return;
    }
    let empIDs = this.calendarGrid.selectedIndexes.map(idx => this.calendarGrid.dataSource[idx].EmployeeID);
    if(empIDs.length > 0)
    {
      this.processObj = [];
      this.genKowD(empIDs.join(";"),this.filterDowCode,this.kowCode);
      dialog.close();
    }
    else this.notify.notifyCode("HR040");
  }

  processing:boolean = false;
  processObj:any[] = [];
  session:string = "";
  // click gen kowd with dowCode and kowCode
  genKowD(employeeID:any,dowCode:string,kowCode:string){
    if(employeeID && dowCode && kowCode)
    {
      this.api.execSv("HR","PR","KowDsBusiness","GenKowDsAsync",[employeeID,dowCode,kowCode])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.session = res[0];
          for (let index = 0; index < res[1]; index++) {
              let obj = {
                id : index + 1,
                value : 0,
                iteration: 0,
                totalIteration: 0,
              };
            this.processObj.push(obj);
          }
          this.processing = true;
          this.detectorRef.detectChanges();
        }
      });
    }
    
  }

  // click remove proccess
  clickRemoveProcess(idx:number){
    if(idx > -1 && idx < this.processObj.length)
    {
      this.processObj.splice(idx,1);
      if(this.processObj.length == 0)
      {
        this.processing = false;
        this.calendarGrid.refresh();
      }
      this.detectorRef.detectChanges();
    }
  }


}
