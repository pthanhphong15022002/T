import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CRUDService, CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TS_KowDs } from '../../../models/kowds.model';
import moment from 'moment';
import { DateTime } from '@syncfusion/ej2-angular-charts';
@Component({
  selector: 'pr-popup-ekowds',
  templateUrl: './popup-ekowds.component.html',
  styleUrls: ['./popup-ekowds.component.css']
})
export class PopupEkowdsComponent implements OnInit, AfterViewInit {

  data:any;
  dialog:DialogRef;
  headerText:string = "Dữ liệu công theo ngày";
  columnGrids:any[];
  dowCode:string;
  employeeID:string;
  userPermission:any;
  minDate:Date;
  maxDate:Date;
  maxDays:number;
  minDays:number = 1;
  workDate:Date;
  beginDate:Date;
  endDate:Date;
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  vllHR057:any;
  modeSaveData:any = "1";
  dataSources:any = [];
  @ViewChild('codxGridview') codxGridview: CodxGridviewV2Component;

  constructor(
    private api:ApiHttpService,
    private notiSV: NotificationsService,
    private cache: CacheService,
    private callFCSV: CallFuncService,
    private dt: ChangeDetectorRef,
    @Optional() dialogRef?: DialogRef,
    @Optional() dialogData?: DialogData
  ) 
  {
    this.dialog = dialogRef;
    this.headerText = dialogData.data?.headerText;
    this.employeeID = dialogData.data?.employeeID;
    this.dowCode = dialogData.data?.dowCode;
    this.workDate = dialogData.data?.workDate;
    this.beginDate = dialogData.data?.workDate;
    this.endDate = dialogData.data?.workDate;
    this.userPermission = dialogData.data?.userPermission;
    if(this.dowCode)
    {
      let year = Number.parseInt(this.dowCode.split("/")[0]) , month = Number.parseInt(this.dowCode.split("/")[1]) - 1;
      this.minDate = new Date(year,month,1);
      this.maxDate = new Date(year,month + 1,0);
      this.maxDays = this.maxDate.getDate();
    }
  }
  
  
  ngOnInit(): void {
    // get vll
    this.cache.valueList("HR057").subscribe((vll:any) => {
      if(vll && vll?.datas)
      {
        this.vllHR057 = vll.datas;
        this.dt.detectChanges();
      }
    });
    // get column grid
    this.cache.gridViewSetup(this.dialog.formModel.formName,this.dialog.formModel.gridViewName)
    .subscribe((grd:any) => {
      if(grd) 
      {
        let field1 = grd.KowCode;
        let field2 = grd.DayNum;
        field1.field = "kowCode";
        field1.allowEdit = true;
        field2.field = "dayNum";
        field2.allowEdit = true;
        this.columnGrids = [];
        this.columnGrids.push(field1);
        this.columnGrids.push(field2);
      }
    });
    this.getDataKowD(this.employeeID,this.dowCode,this.workDate);
  }

  ngAfterViewInit(): void {
    
  }
  // get kowD by workDate
  getDataKowD(employeeID:string,dowCode:string,workDate:Date){
    this.api.execSv("HR","PR","KowDsBusiness","GetDataByWorkDateAsync",[employeeID,dowCode,Util.toUTC00(workDate)])
    .subscribe((res:any) => {
      if(!res)
        res = [];
      this.dataSources = [...res];
      this.dt.detectChanges();
      this.codxGridview?.refresh();
    });
  }

  //value input change
  valueChange(event:any){
    let field = event.field;
    let data = event.data;
    switch(field)
    {
      case "employeeID":
        this.employeeID = data.value.join(";");
        break;
      case "vllHR057":
        this.modeSaveData = data;
        break;
    }
  }

  //value Cell Change
  valueCellChange(event:any){
    if(event.field == "kowCode")
    {
      let count = this.codxGridview.dataSource.filter(x => x.kowCode == event.value).length;
      if(count > 1)
      {
        this.notiSV.notifyCode("HR050");
        this.codxGridview.rowDataSelected.kowCode = "";
        this.codxGridview.updateRow(this.codxGridview.rowDataSelected._rowIndex,this.codxGridview.rowDataSelected);
      }
    }
  }

  //value daterangepicker change
  dateRangePickerChange(event){
    if(event && event?.length > 0)
    {
      this.beginDate = event[0];
      this.endDate = event[1];
    }
  }

  // add new row codx grid
  addNewRowGrid() {
    if(this.codxGridview)
    {
      let row = new TS_KowDs(Util.uid(), this.employeeID, this.dowCode,"", 0, 0);
      let idx = this.codxGridview.dataSource.length > 0 ? this.codxGridview.dataSource.length - 1 : 0;
      this.codxGridview.addRow(row,idx);
    }
  }

  // click save
  onSaveForm(){
    if(!this.employeeID){
      this.notiSV.notifyCode("HR040");
      return;
    }
    if(!this.codxGridview || this.codxGridview?.dataSource?.length == 0)
    {
      if(this.modeSaveData == "1")
      {
        this.notiSV.notifyCode("HR041");
        return;
      }
      else if(this.modeSaveData == "2")
      {
        this.notiSV.alertCode("HR042")
        .subscribe((confirm:any) => {
          if(confirm && confirm?.event?.status == "Y")
          {
            let beginDate = Util.toUTC00(this.beginDate), endDate = Util.toUTC00(this.endDate);
            this.deleteData(this.employeeID,this.dowCode,beginDate,endDate);
          }
        });
      }
    }
    else this.saveData();
  }

  // save data
  saveData(){
    let kowDs = this.codxGridview.dataSource.map(x => ({ "kowCode": x.kowCode,"dayNum":x.dayNum}));
    let beginDate = Util.toUTC00(this.beginDate), endDate = Util.toUTC00(this.endDate);
    this.api.execSv("HR","PR","KowDsBusiness","UpdateKowDByDayAsync",[this.employeeID,this.dowCode,beginDate,endDate,this.modeSaveData,kowDs])
    .subscribe((res:any) => {
      if(res)
      {
        this.notiSV.notifyCode("SYS007");
        this.dialog.close(true);
      }
      else this.notiSV.notifyCode("SYS021");
    });
  }

  // delete data
  deleteData(employeeIDs:string,dowCode:string,beginDate:Date,endDate:Date){
    this.api.execSv("HR","PR","KowDsBusiness","DeteleByTimeAsync",[employeeIDs,dowCode,beginDate,endDate])
    .subscribe((res:any) => {
      if(res)
      {
        this.notiSV.notifyCode("SYS008");
        this.dialog.close(true);
      }
      else this.notiSV.notifyCode("SYS022");
    });
  }

  // click MFC
  clickMF(event, data) {
    this.notiSV.alertCode('SYS030').subscribe((x) => {
      if (x.event?.status == 'Y') {
        this.codxGridview.deleteRow(data, true);
      }
    });
  }

  // show/hide MFC
  changeDataMF(event){
    event.forEach(x => {
      if(x.functionID == "SYS02" && (this.userPermission.delete == "9" || this.userPermission.isAdmin))
        x.disabled == false;
      else 
        x.disabled = true;
    });
  }

}


