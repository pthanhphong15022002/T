import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, NotificationsService, CacheService, CallFuncService, DialogRef, DialogData, CodxGridviewV2Component, Util } from 'codx-core';
import { TS_KowDs } from '../../../models/kowds.model';

@Component({
  selector: 'pr-popup-kowd-month',
  templateUrl: './popup-kowd-month.component.html',
  styleUrls: ['./popup-kowd-month.component.css']
})
export class PopupKowdMonthComponent implements OnInit,AfterViewInit {

  dialog:DialogRef;
  headerText:string = "Dữ liệu công theo ngày";
  columnGrids:any[];
  dowCode:string;
  kowCode:string = "";
  employee:any
  userPermission:any;
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
    private dt: ChangeDetectorRef,
    @Optional() dialogRef?: DialogRef,
    @Optional() dialogData?: DialogData
  ) 
  {
    this.dialog = dialogRef;
    this.headerText = dialogData.data?.headerText;
    this.employee = dialogData.data?.employee;
    this.dowCode = dialogData.data?.dowCode;
    this.kowCode = dialogData.data?.kowCode;
    this.userPermission = dialogData.data?.userPermission;
  }
  ngOnInit(): void {
    // get column grid
    this.cache.gridViewSetup(this.dialog?.formModel?.formName,this.dialog?.formModel?.gridViewName)
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
    this.getDataKowD(this.employee.employeeID,this.dowCode,this.kowCode);
  }

  ngAfterViewInit(): void {
  }

  //get data TS_KowD by kowCode
  getDataKowD(employeeID:string,dowCode:string,kowCode:string){
    if(employeeID)
    {
      this.api.execSv("HR","PR","KowDsBusiness","GetDataByKowCodeAsync",[employeeID,dowCode,kowCode])
      .subscribe((res:any) => {
        if(!res)
          res = [];
        this.dataSources = [...res];
        this.dt.detectChanges();
        this.codxGridview?.refresh();
      });
    }
  }

  // value codxInput Change
  valueInputChange(event){
    if(event.data)
      this.getDataKowD(this.employee.employeeID,this.dowCode,"");
    else
      this.getDataKowD(this.employee.employeeID,this.dowCode,this.kowCode);
  }

  // value cell codxgrid change
  valueCellChange(event){

  }

  // add new row codx grid
  addNewRowGrid() {
    if(this.userPermission.isAdmin || this.userPermission.write == "9")
    {
      let row = new TS_KowDs(Util.uid(), this.employee.employeeID, this.dowCode,"", 0, 0);
      let idx = this.codxGridview.dataSource.length > 0 ? this.codxGridview.dataSource.length - 1 : 0;
      this.codxGridview.addRow(row,idx);
    }
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

  // on save form
  onSaveForm(){
    if(this.userPermission && (this.userPermission.isAdmin || this.userPermission.write == "9"))
    {
      if(this.codxGridview && this.codxGridview?.dataSource?.length > 0)
      {
        let year = Number.parseInt(this.dowCode.split("/")[0]), month = Number.parseInt(this.dowCode.split("/")[1]) - 1; 
        let workDate = Util.toUTC00(new Date(year,month,1));  
        let kowDs = this.codxGridview.dataSource.map(x => ({ "kowCode": x.kowCode,"dayNum":x.dayNum}));
        this.api.execSv("HR","PR","KowDsBusiness","UpdateKowDSummaryAsync",[this.employee.employeeID,this.dowCode,workDate,kowDs])
        .subscribe((res:boolean) => {
          if(res)
          {
            this.notiSV.notifyCode("SYS007");
            this.dialog.close(true);
          }
          else this.notiSV.notifyCode("SYS021");
        });
      }
      else this.notiSV.notifyCode("HR041");
    }
  }
}
