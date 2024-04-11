import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogRef, CodxGridviewV2Component, CodxFormComponent, ApiHttpService, CacheService, AuthStore, NotificationsService, DialogData, Util } from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ep-popup-add-payment',
  templateUrl: './popup-add-payment.component.html',
  styleUrls: ['./popup-add-payment.component.css']
})
export class PopupAddPaymentComponent implements OnInit,AfterViewInit,OnDestroy {
  

  dialog:DialogRef;
  data:any;
  subcriptions = new Subscription();
  actionType:string = "";
  user:any;
  grvSetup:any;
  editSettings: any = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  @ViewChild("codxGridViewV2") codxGridViewV2:CodxGridviewV2Component;
  @ViewChild("form") form:CodxFormComponent;

  releaseCategory:any;
  RefEPRequest:any;
  hideFooter = false;
  constructor
  (
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthStore,
    private codxCommonSV : CodxCommonService,
    private detectorChange:ChangeDetectorRef,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData
  ) 
  {
    this.dialog = dialogRef;
    if(dialogData?.data)
    {
      let obj = dialogData.data;
      this.data = obj.data;
      this.actionType = obj.actionType;
      if(this.actionType == "add")
      {
        if(!this.data.currencyID)
        {
          this.subcriptions.add(this.cache.companySetting()
          .subscribe((res:any) => {
            if(res)
              this.data.currencyID = res[0]["baseCurr"] || "";
          }));
        }
        if(this.data.refID)
          this.getAdvanceRequest(this.data.refID,"AD");

        this.subcriptions.add(this.api.execSv(
          'ES',
          'ERM.Business.ES',
          'CategoriesBusiness',
          'GetCategoryByEntityNameAsync',
          [this.dialog.formModel.entityName])
          .subscribe((res:any) => 
          {
            this.releaseCategory = res;
          }));
      }
      else if(this.actionType == "edit")
      {
        this.getRequestDetail(this.data.recID);
      }
      else if(this.actionType == "coppy")
      {
        let requestID = obj.requestID;
        this.coppyRequestByID(requestID);
      }
      else
      {
        this.getRequestDetail(this.data.recID);
        this.hideFooter = true;
      }
    }
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.subcriptions.add(this.cache.gridViewSetup(this.dialog.formModel.formName,this.dialog.formModel.gridViewName)
    .subscribe((grv:any) => {
      if(grv)
        this.grvSetup = grv;
    }));
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  getRequestDetail(recID:string){
    let subcribe = this.api.execSv("EP","EP","RequestsBusiness","ConvertRequestDetailAsync",recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        if(res.lines)
        {
          let total = res.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
          this.data.totalAmount = total;
          this.data.requestAmt = total;
        }
        if(res.refID)
          this.getRefRequest(this.data.refID);
        this.detectorChange.detectChanges();
      }
    });
    this.subcriptions.add(subcribe);
  }

  coppyRequestByID(recID:string){
    let subcribeApi = this.api.execSv("EP","EP","RequestsBusiness","GetByIDAsync",recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.data.employeeID = res.employeeID;
        this.data.positionID = res.positionID;
        this.data.requestType = res.requestType;
        this.data.toDate = res.toDate;
        this.data.reasonID = res.reasonID;
        this.data.memo = res.memo;
        this.data.lines = res.lines;
        this.data.requestAmt = res.requestAmt;
        this.data.pmtMethodID = res.pmtMethodID;
        this.data.currencyID = res.currencyID;
        this.data.refID = res.refID;
        this.data.refType = res.refType;
        this.data.refNo = res.refNo;
        if(this.data.lines)
          this.data.totalAmount = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
        else
        {
          this.data.lines = [];
          this.data.totalAmount = 0;
        }
        if(this.data.refID)
          this.getRefRequest(this.data.refID);
        this.detectorChange.detectChanges();
      }
    });
    this.subcriptions.add(subcribeApi);
  }

  getRefRequest(recID:string){
    let subcribe = this.api.execSv("EP","EP","RequestsBusiness","GetByIDAsync",recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.RefEPRequest = res;
        this.data.pmtMethodID = res.pmtMethodID;
        if(this.RefEPRequest.status <= 5)
          this.RefEPRequest.requestAmt = 0;
        this.detectorChange.detectChanges();
      }
    });
    this.subcriptions.add(subcribe);
  }

  getAdvanceRequest(refID:string,requestType:string){
    let subcribe = this.api.execSv("EP","EP","RequestsBusiness","GetRequestByIDTypeAsync",[refID,requestType])
    .subscribe((res:any) => {
      if(res)
      {
        this.RefEPRequest = res;
        this.data.pmtMethodID = res.pmtMethodID;
        if(res.status <= 5)
        {
          this.RefEPRequest.requestAmt = 0;
        }
      }
      this.detectorChange.detectChanges();
    });
    this.subcriptions.add(subcribe);
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
        this.data.phone = value.Mobile;
        this.data.email = value.Email;
        break;
      case "reasonID":
        value = event.data;
        this.data.reasonID = value;
        if(event.component.itemsSelected?.length > 0)
        {
          this.data.memo =  event.component.itemsSelected[0].ReasonName;
        }
        break;
      case "memo":
        value = event.data;
        this.data.memo = value;
        break;
      case "refID":
        value = event.data.dataSelected[0].dataSelected;
        if(value)
        {
          this.data.refID = value.RecID;
          this.data.refType = value.RequestType;
          this.data.refNo = value.RequestNo;
          this.data.pmtMethodID = value.PmtMethodID;
          this.getRefRequest(this.data.refID);
        }
        else
        {
          this.data.refID = "";
          this.data.refType = "";
          this.data.refNo = "";
          this.RefEPRequest = null;
        }
        break;
      default:
        break;
    }
    this.detectorChange.detectChanges();
  }

  valueCellChange(event:any){
    let field = event.field;
    if(field == "itemID") event.data.itemName = event.itemData.CostItemName;
    let EPRequestsLine = {
      recID :  event.data.recID,
      transID : this.data.recID,
      itemID :  event.data.itemID,
      itemName :  event.data.itemName,
      amount :  event.data.amount
    };
    let idx = this.data.lines.findIndex((item:any) => item.recID == event.data.recID);
    if(idx > -1)
      this.data.lines[idx] = EPRequestsLine;
    else this.data.lines.push(EPRequestsLine);

    if(field == "amount")
    {
      let total = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
      this.data.totalAmount = total
      this.data.requestAmt = total;
      if(this.RefEPRequest)
        this.data.requestAmt = this.data.requestAmt - this.RefEPRequest.requestAmt;
    }
    this.detectorChange.detectChanges();
  }

  addNewRow(){
    if(!this.codxGridViewV2) return;
    let data = { recID : Util.uid(),itemID : "", itemName: "", amount : 0};
    this.codxGridViewV2.addRow(data,this.codxGridViewV2.dataSource.length,false,true);
  }

  changeDataMF(event){
    if(!event) return;
    event.forEach(x => x.disabled = x.functionID != "SYS02");
  }

  clicGridViewkMF(event:any,data:any){
    if(event.functionID == "SYS02" && data)
    {
      this.codxGridViewV2.deleteRow(data,true);
      if(this.data.lines.length > 0)
      {
        this.data.lines = this.data.lines.filter(x => x.itemID != data.itemID);
        if(this.data.lines.length > 0)
        {
          let total = this.data.lines.reduce((accumulator, currentValue) => accumulator + currentValue.amount,0);
          this.data.totalAmount = total;
          this.data.requestAmt = total;
        }
        else
        {
          this.data.requestAmt = 0;
          this.data.totalAmount = 0;
        }
        if(this.RefEPRequest)
          this.data.requestAmt = this.data.requestAmt - this.RefEPRequest.requestAmt;
        this.detectorChange.detectChanges();
      }
    }
  }

  onSave(isRelease:boolean = false){
    if(this.actionType == "edit")
    {
      this.data._isEdit = true;
      this.dialog.dataService.dataSelected = this.data;
    }
    this.form.save(null, 0, '', '', true,{ allowCompare:false })
    .subscribe((res:any) => {
      if(res && !res.update?.error && !res.save?.error)
      {
        if(isRelease)
          this.codxCommonSV.codxReleaseDynamic("EP",this.data,this.releaseCategory,this.dialog.formModel.entityName,this.dialog.formModel.funcID,this.data.memo,(res) => {this.callBackApproval(res,this)});
        else
          this.dialog.close(this.data);
      }
    });
  }

  callBackApproval(res:any,t:any){
    if(res?.rowCount > 0)
    {
      t.data.status = res.returnStatus;
      t.dialog.close(t.data);
    }
    else t.notiSV.notify("Gửi duyệt không thành công","2");
  }

}
