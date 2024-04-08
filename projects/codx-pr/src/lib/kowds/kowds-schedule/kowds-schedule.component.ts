import { AfterViewInit, Component, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'pr-kowds-schedule',
  templateUrl: './kowds-schedule.component.html',
  styleUrls: ['./kowds-schedule.component.css']
})
export class KowdsScheduleComponent extends UIComponent implements AfterViewInit, OnChanges {
  @ViewChild('cardTemplate') cardTemplate: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton: TemplateRef<any>;
  @ViewChild('contentMF') contentMF: TemplateRef<any>;
  
  views: Array<ViewModel> | any = [];
  @Input() filterOrg: string;
  scheduleHeader?: ResourceModel;
  scheduleEvent?: ResourceModel;
  resourceType: any;
  scheduleEvtModel: any;
  lstEmp : any = [];
  override funcID = 'PRTPro18';
  grvSetupHrEmp: any;
  filterMonth = new Date().getMonth();
  filterYear = new Date().getFullYear();
  scheduleHeaderModel: any;

  onInit(): void {
    this.cache.functionList('HRT03a1').subscribe((func: any) => {
      if (func?.formName && func?.gridViewName) {
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grd: any) => {
            if (grd) {
              this.grvSetupHrEmp = grd;
            }
          });
      }
    });
  }

  onLoading(event){
    this.getSchedule()
  }

  getSchedule() {
    this.getData();
    let strEmp = this.lstEmp.join(';')
    let strPredicate ='';
    for(let i = 0; i < this.lstEmp.length; i++){
      strPredicate+= `OrgUnitID=@${i}`
      if(i < this.lstEmp.length - 1){
        strPredicate += '||'
      }
    }

        // this.scheduleEvent = new ResourceModel();
    // this.scheduleEvent.assemblyName = 'EP';
    // this.scheduleEvent.className = 'BookingsBusiness';
    // this.scheduleEvent.service = 'EP';
    // //this.scheduleEvent.method = 'GetListBookingAsync';
    // this.scheduleEvent.method = 'GetListBookingScheduleAsync';
    // this.scheduleEvent.predicate = 'ResourceType=@0';
    // this.scheduleEvent.dataValue = this.resourceType;
    // if (this.queryParams?.predicate && this.queryParams?.dataValue) {
    //   this.scheduleEvent.predicate = this.queryParams?.predicate;
    //   this.scheduleEvent.dataValue = this.queryParams?.dataValue;
    // }
    // this.scheduleEvent.idField = 'recID';

    //lấy list resource vẽ header schedule
    this.scheduleHeader = new ResourceModel();
    this.scheduleHeader.assemblyName = 'HR';
    this.scheduleHeader.className = 'EmployeesBusiness_Old';
    this.scheduleHeader.service = 'HR';
    this.scheduleHeader.method = 'LoadDataForKowAsync';
    this.scheduleHeader.predicate = strPredicate;
    this.scheduleHeader.dataValue = strEmp;

    this.scheduleEvtModel = {
      id: 'recID',
      subject: { name: 'memo' },
      startTime: { name: 'begDay' },
      endTime: { name: 'endDay' },
      resourceId: { name: 'employeeID' }, // field mapping vs resource Schedule
      status: 'approveStatus',
    };

    this.scheduleHeaderModel = {
      Name: 'employee',
      Field: 'employeeID',
      IdField: 'employeeID', // field mapping vs event Schedule
      TextField: 'employeeID',
      Title: 'employee',
    };

    this.views = [
      {
        type: ViewType.schedule,
        active: true,
        sameData: false,
        model: {
          currentView: 'TimelineMonth',
          eventModel: this.scheduleEvtModel, // mapping hàng nghỉ phép với cột nhân viên
          resourceModel: this.scheduleHeaderModel, // mapping cột nhân viên vs hàng nghỉ phép
          // resources: this.resources,
          // resourceDataSource: this.resources,
          template: this.cardTemplate, // template ghi thong tin nghi phep cua nhan vien
          // template3: this.cellTemplate,
          template4: this.resourceHeader, // template cot nhan vien
          // template6: this.mfButton, // template more func
          // template8: this.contentMF, // content ben duoi more func
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filterOrg) {
      console.log('filterOrg changed:', changes.filterOrg.currentValue);
      this.getData();
    }
  }


  getData(){
    // lay data dang chon trong bo loc ngay thang
    // let ele = document.getElementsByTagName('codx-schedule')[0];
    //   if (ele) {
    //     let scheduleEle = ele.querySelector('ejs-schedule');
    //     if ((scheduleEle as any).ej2_instances[0]) {
    //      let curDate = (scheduleEle as any).ej2_instances[0].selectedDate ;
    //       let curMonth = new Date(curDate).getMonth() + 1
    //       let curYear = new Date(curDate).getFullYear();

    //     }
    //   }
    this.getEmpList().subscribe((res) => {
      console.log('ds nhan vien lay dc theo org', this.filterOrg, res);
      this.lstEmp = res;
    })
        // //lấy list booking để vẽ schedule
        // this.scheduleEvent = new ResourceModel();
        // this.scheduleEvent.assemblyName = 'EP';
        // this.scheduleEvent.className = 'BookingsBusiness';
        // this.scheduleEvent.service = 'EP';
        // //this.scheduleEvent.method = 'GetListBookingAsync';
        // this.scheduleEvent.method = 'GetListBookingScheduleAsync';
        // this.scheduleEvent.predicate = 'ResourceType=@0';
        // this.scheduleEvent.dataValue = this.resourceType;
        // if (this.queryParams?.predicate && this.queryParams?.dataValue) {
        //   this.scheduleEvent.predicate = this.queryParams?.predicate;
        //   this.scheduleEvent.dataValue = this.queryParams?.dataValue;
        // }
        // this.scheduleEvent.idField = 'recID';

        // //lấy list resource vẽ header schedule
        // this.scheduleHeader = new ResourceModel();
        // this.scheduleHeader.assemblyName = 'EP';
        // this.scheduleHeader.className = 'BookingsBusiness';
        // this.scheduleHeader.service = 'EP';
        // this.scheduleHeader.method = 'GetResourceAsync';
        // this.scheduleHeader.predicate = 'ResourceType=@0 ';
        // this.scheduleHeader.dataValue = this.resourceType;


  }


  ngAfterViewInit(): void {

  }

  getEmpList() {
    console.log('chay ham get emp', this.filterMonth, this.filterYear);
    
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness_Old',
      'GetEmpByOrgUnitIDAsync',
      [this.filterOrg, this.filterMonth, this.filterYear]
    );
  }

  onAction(event: any) {
    debugger
    if(event.type == 'navigate'){
      let crrDate = event.data.currentDate;
      this.filterMonth = new Date(crrDate).getMonth();
      this.filterYear = new Date(crrDate).getFullYear();
      this.getData();
    }
    else if (event.type == 'doubleClick' || event.type == 'edit') { //truong hop double click vao 1 o tren luoi
    }
  }


}
