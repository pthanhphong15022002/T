import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'pr-popup-coppy-salcoeffemp',
  templateUrl: './popup-coppy-salcoeffemp.component.html',
  styleUrls: ['./popup-coppy-salcoeffemp.component.css']
})
export class PopupCoppySalCoeffEmpComponent implements OnInit, AfterViewInit {

  user:any;
  dialog:DialogRef;
  dowCode:string;
  headerText:string;
  fromEmp:any;
  toEmps:string = "";
  lstPRSalCoeffEmp:any[] = [];
  lstToEmp:any[] = [];
  vllHR057:any[] = [];
  modeSave:number;
  // popup
  showCBB: boolean = false;
  width: number = 720;
  height: number = window.innerHeight;
  messageConfirm:string = "";
  constructor
  (
    private api:ApiHttpService,
    private cache:CacheService,
    private notiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData
  )
  {
    this.user = auth.get();
    this.dialog = dialogRef;
    this.fromEmp = dialogData.data?.data;
    this.dowCode = dialogData.data?.dowCode;
    this.headerText = dialogData.data?.headerText;
  }
  ngOnInit(){
    this.cache.valueList("HR057")
    .subscribe((vll:any) => {
      if(vll && vll.datas)
      {
        this.vllHR057 = [...vll.datas];
        this.dt.detectChanges();
      }
    });
    this.cache.message("HR052")
    .subscribe((mssg:any) => {
      if(mssg)
      {
        this.messageConfirm = mssg.defaultName ?? mssg.customName;
      }
    });
    this.modeSave = 1;
    this.getPRSalCoeff(this.fromEmp.employeeID,this.dowCode);
  }

  ngAfterViewInit(){
  }

  // get PR_SalCoeffEmp by formEmp
  getPRSalCoeff(employeeID:string,dowCode:string){
    this.api.execSv("HR","PR","SalCoeffEmpBusiness","GetByEmployeeIDAsync",[employeeID,dowCode])
    .subscribe((res:any) => {
      if(res && res.length > 0)
      {
        res.forEach(ele => ele["checked"] = true);
        this.lstPRSalCoeffEmp = [...res];
        this.dt.detectChanges();
      }
    });
  }

  valueInputChange(event:any){
    this.modeSave = event.data;
  }

  valueCheckBoxChange(event){
    this.lstPRSalCoeffEmp.forEach(x => {
      if(x.coeffCode == event.field)
      {
        x.checked = event.data;
        return;
      }
    });
  }

  openPopupEmployees() {
    this.showCBB = !this.showCBB;
    this.dt.detectChanges();
  }

  valueCbbChange(event){
    if(event && event.dataSelected)
    {
      this.lstToEmp =  [...event.dataSelected];
      this.toEmps = event.id;
      this.dt.detectChanges();
    }
  }



  onSave(){
    if(this.validate())
    {
      let mssg = Util.stringFormat(this.messageConfirm,this.dowCode,this.fromEmp.employeeName);
      this.notiSV.alert("",mssg)
      .closed.subscribe((confirm:any) => {
        if(confirm && confirm?.event && confirm.event?.status == "Y")
        {
          // save
          let prSalCoeffs = this.lstPRSalCoeffEmp.filter(x => { return x.checked });
          let employeeIDs = this.lstToEmp.map(x => x.EmployeeID);
          this.api.execSv("HR","PR","SalCoeffEmpBusiness","CoppyAsync",[employeeIDs,prSalCoeffs,this.dowCode,this.modeSave])
          .subscribe((res:any) => {
            if(res)
            {
              this.notiSV.notifyCode("SYS006");
              this.dialog.close(res);
            }
            else this.notiSV.notifyCode("SYS023");
          });
        }
      })
    }
  }

  validate():boolean{
    let isChecked = this.lstPRSalCoeffEmp.some(x => x.checked);
    if(!isChecked)
    {
      this.notiSV.notifyCode("HR051");
      return false;
    }
    if(!this.lstToEmp || this.lstToEmp.length == 0)
    {
      this.notiSV.notifyCode("HR040");
      return false;
    }
    return true;
  }
}
