import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CodxGridviewV2Component, DialogData, DialogRef, LayoutAddComponent, NotificationsService, Util } from 'codx-core';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'ep-popup-add-request',
  templateUrl: './popup-add-request.component.html',
  styleUrls: ['./popup-add-request.component.css']
})
export class PopupAddRequestComponent implements OnInit,AfterViewInit,OnDestroy {
  dialog:DialogRef;
  data:any;
  subscriptions = new Subscription();
  actionType:string = "";
  user:any;
  grvSetup:any;
  vllEP010:any;
  columnGrids:any[] = [];
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  EPResource:any;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tab1',
    },
    {
      icon: 'icon-monetization_on',
      text: 'Chí phí công tác',
      name: 'tab2',
    }
  ];

  @ViewChild("codxGridViewV2") codxGridViewV2:CodxGridviewV2Component;
  @ViewChild("form") form:LayoutAddComponent;


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
      this.data = JSON.parse(JSON.stringify(obj.data));
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
      this.data.resourceIDs = this.data.resources.map(x => x.userID).join(";");
      this.subscriptions.add(this.cache.companySetting()
      .subscribe((res:any) => {
        if(res)
        {
          this.data.currencyID = res[0]["baseCurr"] || "";
        }
      }));
    }
    else if(this.actionType == "edit")
    {
      this.getRequestDetail(this.data.recID);
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getRequestDetail(recID:string){
    let subcribe = this.api.execSv("EP","EP","RequestsBusiness","ConvertRequestDetailAsync",recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.data._isEdit = true;
        this.dialog.dataService.dataSelected = this.data;
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
      case "fromDate":
      case "toDate":
        value = event.data.fromDate;
        this.data[field] = value;
        break;
      case "subType":
        value = event.data;
        this.data.subType = value;
        break;
      case "objectID":
        this.data.objectID = event.data;
        this.data.objectType = event.type;
        break;
      case "reasonID":
        value = event.data;
        this.data.reasonID = event.data;
        break;
      case "memo":
        value = event.data;
        this.data.memo = value;
        break;
      case "hasBooking":
        value = event.data;
        this.data.hasBooking = event.data;
        if(!this.data.hasBooking) 
        {
          this.data.resourceID = null;
          this.EPResource = null;
        }
        break;
      case "hasResources":
        value = event.data;
        this.data.hasResources = event.data;
        if(!this.data.hasResources)
        {
          this.data.resources = [];
          this.data.resources.push({transID : this.data.recID, userID : this.user.userID, userName : this.user.userName, roleType : "1" });
          if(this.data.resourceID && this.EPResource)
            this.data.resources.push({transID : this.data.recID, userID : this.EPResource.ResourceID, userName : this.EPResource.ResourceName, roleType : "2"});
          this.data.resourceIDs = this.data.resources.map(x => x.userID).join(";");
        }
        break;
      case "resourceID":
        value = event.data.dataSelected[0].dataSelected;
        this.data.resourceID = value.ResourceID;
        this.data.resourceRecID = value.RecID;
        this.data.resourceName = value.ResourceName;
        this.data.resourceCode = value.Code;
        this.data.resourceEquipments = value.Equipments;
        let idx = this.data.resources.findIndex(x => x.roleType == "2");
        if(idx > -1)
          this.data.resources.splice(idx,1);
        this.data.resources.push({transID : this.data.recID, userID : value.ResourceID, userName : value.ResourceName, roleType : "2"});
        break;
      case "resources":
        value = event.data.dataSelected;
        if(value.length > 0)
        {
          this.data.resources = this.data.resources.filter((item:any) => item.roleType != "3");
          value.forEach((item:any) => {
            let exists = this.data.resources.some(x => x.userID == item.id);
            if(!exists)
              this.data.resources.push({transID : this.data.recID, userID : item.id, userName : item.text, roleType : "3"})
          });
        }
        else
        {
          this.data.resources = [];
          this.data.resources.push({transID : this.data.recID, userID : this.user.userID, userName : this.user.userName, roleType : "1" });
          if(this.data.resourceID && this.EPResource)
            this.data.resources.push({transID : this.data.recID, userID : this.EPResource.ResourceID, userName : this.EPResource.ResourceName, roleType : "2"});
        }
        this.data.resourceIDs = this.data.resources.filter(x => x.roleType != "2").map(x => x.userID).join(";");
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

  clickMF(event:any,data:any){
    if(event.functionID == "SYS02" && data)
    {
      this.codxGridViewV2.deleteRow(data,true);
      if(this.data.lines.length > 0)
      {
        this.data.lines = this.data.lines.filter(x => x.itemID != data.itemID);
        if(this.data.lines.length > 0)
          this.data.totalAmount = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
        else this.data.totalAmount = 0;
        this.detectorChange.detectChanges();
      }
    }
  }

  onSave(){
    this.form.form.save(null, 0, '', '', false,{allowCompare:false})
    .subscribe((res:any) => {
      if(res)
      {
        let save = this.actionType == "add" ? res.save.error : res.update.error;
        if(!save)
        {
          this.dialog.close(this.data);
        }
      }
    });
  }
}
