import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CRUDService, CacheService, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { PR_SalCoeffCode } from '../../../models/PR_SalCoeffCode';

@Component({
  selector: 'pr-popup-add-salcoeffemp',
  templateUrl: './popup-add-salcoeffemp.component.html',
  styleUrls: ['./popup-add-salcoeffemp.component.css']
})
export class PopupAddSalCoeffEmpComponent implements OnInit,AfterViewInit {
 
  user:any;
  dialog:DialogRef;
  data:any;
  headerText:string;
  columnGrids:any[] = [];
  dataSources:any[] = [];
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  dowCode:string;
  userPermission:any;
  lstSalCoeffs:any[] = [];
  @ViewChild("codxGridViewV2") codxGridViewV2:CodxGridviewV2Component;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private notiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData,
  ) 
  {
    this.user = auth.get();
    this.dialog = dialogRef;
    this.data = dialogData.data?.data;
    this.dowCode = dialogData.data?.dowCode;
    this.userPermission = dialogData.data?.userPermission;
    this.headerText = dialogData.data?.headerText;
  }

  ngOnInit(): void {
    this.cache.gridViewSetup(this.dialog.formModel.formName,this.dialog.formModel.gridViewName)
    .subscribe((grd:any) => {
      if(grd) {
        let field1 = grd.CoeffCode;
        field1.field = "coeffCode";
        field1.allowEdit = true;
        let field2 = grd.Coefficient;
        field2.field = "coefficient";
        field2.allowEdit = true;
        this.columnGrids.push(field1);
        this.columnGrids.push(field2);
        this.getDataSalCoeffEmp();
      }
    });
  }

  ngAfterViewInit(): void {
    this.getListSalCoeff();
  }

  // get data PR_SalCoeffEmp
  getDataSalCoeffEmp(){
    this.api.execSv("HR","PR","SalCoeffEmpBusiness","GetByEmployeeIDAsync",[this.data.employeeID,this.dowCode])
      .subscribe((res:any) => {
        if(res)
        {
          this.dataSources = res;
          this.dt.detectChanges();
          if(this.codxGridViewV2)
          {
            this.codxGridViewV2.dataSource = [...this.dataSources];
            this.codxGridViewV2.refresh();
          }
        }
      });
  }

  // get list LS_SalCoeff
  getListSalCoeff(){
    this.api.execSv("HR","LS","SalCoeffBusiness","GetAsync")
    .subscribe((res:any) => {
      if(res.length > 0)
      {
        this.lstSalCoeffs = res;
      }
    });
  }

  // addRowGrid
  addRowGrid(){
    if(this.data == null || !this.data?.employeeID)
    {
      this.notiSV.notifyCode("HR040");
      return;
    }
    let data = new PR_SalCoeffCode(Util.uid(),this.data.employeeID,this.dowCode,"",0)
    this.codxGridViewV2.addRow(data,this.codxGridViewV2.dataSource.length,false,true);
  }

  // value change
  viewAllCoeffCode(event:any){
    if(this.data == null || !this.data?.employeeID)
    {
      this.notiSV.notifyCode("HR040");
      return;
    }
    if(event.data)
    {
      let dataSource = [...this.codxGridViewV2.dataSource];
      let arrSalcoeffCode = this.lstSalCoeffs.filter(x => !dataSource.some(y => y.coeffCode == x.coeffCode));
      if(arrSalcoeffCode.length > 0)
      {
        arrSalcoeffCode.forEach((x:any) => 
        {
          let data = new PR_SalCoeffCode(Util.uid(),this.data.employeeID,this.dowCode,x.coeffCode,0);
          this.codxGridViewV2.addRow(data,dataSource.length,false,true);
        });
      }
    }
    else this.getDataSalCoeffEmp();
  }

  //valueChange
  valueChange(event:any){
    if(event?.data?.value)
    {
      this.data.employeeID = event.data.value[0];
    }
  }

  //valueCellChange
  valueCellChange(event:any){
    if(event.field == "coeffCode"){
      let isCount = this.codxGridViewV2.dataSource.filter(x => x.coeffCode == event.value).length;
      if(isCount > 1)
      {
        this.notiSV.notifyCode("HR050");
        this.codxGridViewV2.rowDataSelected.coeffCode = "";
        this.codxGridViewV2.updateRow(this.codxGridViewV2.rowDataSelected._rowIndex,this.codxGridViewV2.rowDataSelected);
      }
    }
  }
  
  // Save
  onSave(){
    if(this.validate())
    {
      this.api.execSv("HR","PR","SalCoeffEmpBusiness","SaveUpdateAsync",[this.data.employeeID,this.dowCode,this.codxGridViewV2.dataSource])
      .subscribe((res:boolean) => {
        if(res) 
        {
          this.notiSV.notifyCode("SYS007");
          this.dialog.close(res);
        }
        else this.notiSV.notifyCode("SYS021");
      });
    }
  }

  // changeDataMF
  changeDataMF(event){
    event.forEach(x => {
      if(x.functionID == "SYS02" && (this.userPermission.delete == "9" || this.userPermission.isAdmin))
        x.disabled == false;
      else 
        x.disabled = true;
    });
  }

  // clickMF
  clickMF(event:any,data:any){
    if(event.functionID == "SYS02" && data)
    {
      this.codxGridViewV2.deleteRow(data,true);
    }
  }

  validate():boolean{
    if(!this.data || !this.data?.employeeID)
    {
      this.notiSV.notifyCode("HR040");
      return false;
    }
    if(this.codxGridViewV2.dataSource.length == 0)
    {
      this.notiSV.notifyCode("HR051");
      return false;
    }
    return true;
  }
}
