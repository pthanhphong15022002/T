import { AfterContentInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'pr-popup-add-payroll-list',
  templateUrl: './popup-add-payroll-list.component.html',
  styleUrls: ['./popup-add-payroll-list.component.css']
})
export class PopupAddPayrollListComponent implements OnInit,AfterContentInit{
  

  dialog:DialogRef;
  user:any;
  data:any;
  headerText:string = "Tính lương";
  hrTemplateExcel:any;
  adTemplateExcel:any;
  mssgConfirm:string;
  constructor
  (
    private api:ApiHttpService,
    private notiSV:NotificationsService,
    private cache:CacheService,
    private callFC:CallFuncService,
    private auth:AuthStore,
    private detectorRef:ChangeDetectorRef,
    @Optional() dialogRef?:DialogRef,
    @Optional() dialogData?:DialogData
  ) 
  {
    this.user = auth.get();
    this.dialog = dialogRef;
    if(dialogData && dialogData?.data)
    {
      let obj = dialogData.data;
      if(obj)
      {
        this.data = JSON.parse(JSON.stringify(obj.data));
        this.headerText = dialogData.data.headerText;
      }
    }
  }

  ngOnInit(): void {
    if(this.data)
    {
      this.getCurrentDowCode();
    }
    this.cache.message("HR066").subscribe((mssg:any) => {
      if(mssg)
      {
        this.mssgConfirm = mssg.defaultName ?? mssg.customName;
        this.detectorRef.detectChanges();
      }
    });
  }

  ngAfterContentInit(): void {
  }

  getCurrentDowCode(){
    let formName = "PRParameters", category = "1";
    this.api.execSv("SYS","SYS","SettingValuesBusiness","GetParameterByHRAsync",[formName,category])
    .subscribe((setting:any) => {
      if(setting)
      {
        let jsSetting = JSON.parse(setting)
        this.data["dowCode"] = jsSetting["CurrentPayrollDow"];
        this.data["yearID"] = this.data["dowCode"].split("/")[0];
        this.detectorRef.detectChanges();
      }
    });
  }

  skipPayroll:boolean = true;
  valueChange(event:any){
    if(event)
    {
      switch(event.field)
      {
        case"dowCode":
          this.data["dowCode"] = event.data;
          this.data["yearID"] = this.data["dowCode"].split("/")[0];
          break;
        case"hrTemplateID":
          this.data["hrTemplateID"] = event.data;
          this.getHRTemplate(event.data);
          break;
        case"note":
          this.data["note"] = event.data;
          break;
        case"skipPayroll":
          this.skipPayroll = event.data;
      }
      this.detectorRef.detectChanges();
    }
  }

  hrTemplate:any;
  getHRTemplate(hrTemplateID:string){
    this.api.execSv("HR","HR","TemplateExcelBusiness","GetByIDAsync",hrTemplateID)
    .subscribe((res:any) => {
      this.hrTemplate = res;
      this.data.templateID = res.templateID;
      this.detectorRef.detectChanges();
    });
  }

  onSaveForm(){
    if(this.validate())
    {
      let mssg = Util.stringFormat(this.mssgConfirm,this.hrTemplate.hrTemplateName,this.data.dowCode);
      this.notiSV.alert("",mssg)
      .closed.subscribe((confirm:any) => {
        if(confirm && confirm?.event?.status === "Y")
        {
          this.data.payrollID = Util.uid(); 
          this.data.createdBy = this.user.user;
          this.data.createdOn = new Date();
          this.api.execSv("HR","PR","PayrollListBusiness","SaveAsync",this.data)
          .subscribe((res:any) => {
            if(res && res?.length > 0 && res[0])
            {
              this.downloadFile(res[1]);
              this.notiSV.notifyCode("SYS006");
              this.dialog.close(this.data);
            }
            else this.notiSV.notifyCode("SYS023");
          });
        }
      });
    }
  }

  validate():boolean{
    if(!this.data) return false;
    if(!this.data.dowCode)
    {
      this.notiSV.notifyCode("HR064");
      return false;
    }
    if(!this.data.hrTemplateID && this.hrTemplate)
    {
      this.notiSV.notifyCode("HR065");
      return false;
    }
    return true;
  }

  downloadFile(data: any) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(sampleArr);
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  saveByteArray(byte) {
    var dataType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    var blob = new Blob([byte], {
      type: dataType,
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = "test.xlsx";
    link.download = fileName;
    link.click();
  }
}
