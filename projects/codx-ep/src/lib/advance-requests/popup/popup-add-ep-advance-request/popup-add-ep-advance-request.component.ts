import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogRef, CodxGridviewV2Component, LayoutAddComponent, ApiHttpService, CacheService, AuthStore, NotificationsService, DialogData, Util, CodxFormComponent } from 'codx-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ep-popup-add-ep-advance-request',
  templateUrl: './popup-add-ep-advance-request.component.html',
  styleUrls: ['./popup-add-ep-advance-request.component.css']
})
export class PopupAddEpAdvanceRequestComponent implements OnInit,AfterViewInit,OnDestroy {
  

  dialog:DialogRef;
  data:any;
  subscriptions = new Subscription();
  actionType:string = "";
  user:any;
  grvSetup:any;
  vllEP010:any;
  EPResource:any;
  ADResourcesIDs:string = "";
  columnGrids:any[] = [];
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  @ViewChild("codxGridViewV2") codxGridViewV2:CodxGridviewV2Component;
  @ViewChild("form") form:CodxFormComponent;


  constructor
  (
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthStore,
    private notiSV:NotificationsService,
    private detectorChange:ChangeDetectorRef,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData
  ) 
  {
    this.dialog = dialogRef;
    if(dialogData && dialogData.data)
    {
      let obj = dialogData.data;
      this.data = obj.data;
      this.actionType = obj.actionType;
    }
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.cache.valueList("EP010")
    .subscribe((vll:any) => {
      if(vll)
        this.vllEP010 = vll.datas;
    }));
    this.subscriptions.add(this.cache.gridViewSetup(this.dialog.formModel.formName,this.dialog.formModel.gridViewName)
    .subscribe((grv:any) => {
      if(grv)
        this.grvSetup = grv;
    }));
    if(this.user && this.actionType == "add")
    {
      this.data.employeeID = this.user.employee?.employeeID;
      this.data.employeeName = this.user.employee?.employeeName;
      this.data.positionID = this.user.employee?.positionID;
      this.data.phone = this.user.mobile;
      this.data.email = this.user.email;
      this.data.lines = [];
      this.data.resources = [];
      this.data.resources.push({transID : this.data.recID, userID : this.user.userID, userName : this.user.userName, roleType : "1"});
      this.ADResourcesIDs = this.user.userID + ";";
      this.subscriptions.add(this.cache.companySetting()
      .subscribe((res:any) => {
        if(res)
        {
          this.data.currencyID = res[0]["baseCurr"] || "";
        }
      }));
      if(this.data.refID)
        this.getEPRequest(this.data.refID);
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getEPRequest(recID:string){
    let subcribe = this.api.execSv("EP","EP","RequestsBusiness","GetByIDAsync",recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.data.employeeID = res.employeeID;
        this.data.positionID = res.positionID;
        this.data.fromDate = res.fromDate;
        this.data.toDate = res.toDate;
        this.data.memo = res.memo;
        this.data.requestAmt = res.requestAmt;
        this.data.pmtMethodID = res.pmtMethodID;
        this.data.reasonID = res.reasonID;
        if(res.lines?.length > 0)
        {
          this.data.lines = res.lines.map(item => ({ recID : Util.uid(), itemID : item.itemID, itemName: item.itemName, amount : item.amount}));
          this.data.totalAmount = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
          this.data.requestAmt = this.data.totalAmount;
        }
        this.data.refID = res.recID;
        this.data.refType = res.requestType;
        this.data.refNo = res.requestNo;
        this.detectorChange.detectChanges();
      }
    });
    this.subscriptions.add(subcribe);
  }
  valueChange(event:any){
    let field = event.field;
    let value = null;
    switch(field)
    {
      case "employeeID":
        value = event.data.dataSelected[0].dataSelected;
        this.data.employeeID = value.EmployeeID;
        this.data.employeeName = value.EmployeeName;
        this.data.phone = value.Phone;
        this.data.email = value.Email;
        this.data.bUID = value.BUID;
        this.data.positionID = value.PositionID;
        this.data.orgUnitID = value.OrgUnitID;
        this.data.departmentID = value.DepartmentID;
        this.data.divisionID = value.DivisionID;
        this.data.companyID = value.CompanyID;
        break;
      case "requestAmt":
          value = event.data;
          this.data.requestAmt = event.data;
          break;
      case "toDate":
        value = event.data.fromDate;
        this.data.toDate = value;
        break;
      case "pmtMethodID":
        value = event.data;
        this.data.pmtMethodID = event.data;
        break;
      case "reasonID":
        value = event.data;
        this.data.reasonID = event.data;
        break;
      case "memo":
        value = event.data;
        this.data.memo = value;
        break;
      case "refID":
        value = event.data;
        this.data.refID = value;
        break;
      default:
        break;
    }
    this.detectorChange.detectChanges();
  }

  valueCellChange(event:any){
    let field = event.field;
    if(field == "itemID") event.data.itemName = event.itemData.ItemName;
    let EPRequestsLine = {
      recID :  event.data.recID,
      transID : this.data.recID,
      itemID :  event.data.itemID,
      itemName :  event.data.itemName,
      amount :  event.data.amount
    };
    if(!this.data.lines) this.data.lines = [];
    let idx = this.data.lines.findIndex((item:any) => item.recID == event.data.recID);
    if(idx > -1)
      this.data.lines[idx] = EPRequestsLine;
    else this.data.lines.push(EPRequestsLine);
    if(field == "amount" && this.data.lines.length > 0)
      this.data.totalAmount = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
    this.detectorChange.detectChanges();
  }

  addNewRow(){
    let data = { recID : Util.uid(),itemID : "", itemName: "", amount : 0};
    this.codxGridViewV2.addRow(data,this.codxGridViewV2.dataSource.length,false,true);
  }

  changeDataMF(event){
    event.forEach(x => x.disabled = x.functionID != "SYS02");
  }

  clicGridViewkMF(event:any,data:any){
    if(event.functionID == "SYS02" && data)
    {
      this.codxGridViewV2.deleteRow(data,true);
    }
  }

  driver:any;
  getEPResource(resourceID:string){
    let subcribe = this.api.execSv("EP","EP","ResourcesBusiness","GetResourceAsync",resourceID)
    .subscribe((res:any) => {
      if(res)
      {
        this.driver = res;
        let idx = this.data.resources.findIndex(x => x.roleType == "2");
        if(idx > -1)
          this.data.resources.splice(idx,1);
        this.data.resources.push({transID : this.data.recID, userID : this.driver.resourceID, userName : this.driver.resourceName, roleType : "2"});
        this.detectorChange.detectChanges();
      }
    });
    this.subscriptions.add(subcribe);
  }

  onSave(){
    this.form.save(null, 0, '', '', false,{allowCompare:false})
    .subscribe((res:any) => {
      if(res.save && res.save.data)
      {
        this.dialog.close(this.data);
      }
    });
  }
}
