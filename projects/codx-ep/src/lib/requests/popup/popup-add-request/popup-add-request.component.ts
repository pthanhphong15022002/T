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
  EPResource:any;
  ADResourcesIDs:string = "";
  columnGrids:any[] = [];
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  EPRequestsLines:any[] = [];
  cbbWidth: number = 720;
  cbbHeight: number = window.innerHeight;
  isShowCBB:boolean = false;
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
      let EPBookingAttendee = {transID : this.data.recID, userID : this.user.userID, userName : this.user.userName, roleType : "1"};
      this.data.resources = [];
      this.data.resources.push(EPBookingAttendee);
      this.ADResourcesIDs = this.user.userID + ";";
      this.subscriptions.add(this.cache.companySetting()
      .subscribe((res:any) => {
        if(res)
        {
          this.data.currencyID = res[0]["baseCurr"] || "";
        }
      }));
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
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
          this.EPResource = null;
          this.driver = null;
        }
        break;
      case "hasResources":
        value = event.data;
        this.data.hasResources = event.data;
        if(!this.data.hasResources)
        {
          let EPBookingAttendee = {transID : this.data.recID, userID : this.user.userID, userName : this.user.userName, roleType : "1"};
          this.data.resources.push(EPBookingAttendee);
          this.ADResourcesIDs = this.user.userID + ";"
        }
        break;
      case "resourceID":
        value = event.data.dataSelected[0].dataSelected;
        this.data.resourceID = value.ResourceID;
        this.EPResource = value;
        if(this.EPResource?.LinkID)
          this.getEPResource(this.data.resourceID);
        else 
        {
          this.driver = null;
          let idx = this.data.resources.findIndex(x => x.roleType == "2");
          if(idx > -1)
            this.data.resources.splice(idx,1);
        }
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
          if(this.data.resourceID == this.EPResource.ResourceID && this.driver.resourceID && this.EPResource.LinkID)
            this.data.resources.push({transID : this.data.recID, userID : this.driver.resourceID, userName : this.driver.resourceName, roleType : "2"});
        }
        this.ADResourcesIDs = this.data.resources.filter(x => x.roleType != "2").map(x => x.userID).join(";"); 
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
    this.form.form.save(null, 0, '', '', false,{allowCompare:false})
    .subscribe((res:any) => {
      if(res.save && res.save.data)
      {
        this.dialog.close(this.data);
      }
    });
  }
}
