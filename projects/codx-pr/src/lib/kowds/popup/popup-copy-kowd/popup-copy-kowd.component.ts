import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'pr-popup-copy-kowd',
  templateUrl: './popup-copy-kowd.component.html',
  styleUrls: ['./popup-copy-kowd.component.css']
})
export class PopupCopyEkowdsComponent implements OnInit,AfterViewInit {

  dialog: DialogRef;
  headerText:string = "Sao chép Dữ liệu công";
  userPermission:any;
  dowCode:string;
  vllHR057:any;
  modeSaveData:string = "1";
  fromEmp:any;
  toEmps:string = "";
  lstToEmp:any = [];
  showCBB:boolean = false;
  width: number = 720;
  height: number = window.innerHeight;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private notify: NotificationsService,
    private dt: ChangeDetectorRef,
    private callFCSV: CallFuncService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dialogData?: DialogData
  ) 
  {
    this.dialog = dialogRef;
    this.fromEmp = dialogData.data?.data;
    this.dowCode = dialogData.data?.dowCode;
    this.headerText = dialogData.data?.headerText;
    this.userPermission = dialogData.data?.userPermission;

  }
  ngOnInit(): void {
    this.cache.valueList('HR057')
    .subscribe((vll) => {
      if(vll)
      {
        this.vllHR057 = vll.datas;
      }
    });
  }
  ngAfterViewInit(): void {
  }

  // value input change
  valueInputChange(event:any){
    this.modeSaveData = event.data;
  }

    // valueCbbChange
  valueCbbChange(event:any){
    if(event && event.dataSelected)
    {
      this.lstToEmp =  [...event.dataSelected];
      this.toEmps = event.id;
      this.dt.detectChanges();
    }
  }

  //openPopupEmployees()
  openPopupEmployees(){
    this.showCBB = !this.showCBB;
    this.dt.detectChanges();
  }

  // deleteEmp(emp){
  //   let index = this.copyEmployeesInfo.indexOf(emp);
  //   if(index != -1){
  //     this.copyEmployeesInfo.splice(index, 1);
  //   }
  //   let indexInIDsArr = this.lstCopyEmpID.indexOf(emp.employeeID);
  //   if(indexInIDsArr != -1){
  //     this.lstCopyEmpID.splice(indexInIDsArr, 1);
  //     this.currentCbxValue = this.lstCopyEmpID.join(';')
  //   }
  // }

  // onSelectVllVal(evt, data){
  //   if(data == '1'){
  //     this.vllMode = '1';
  //   }
  //   else this.vllMode = '2';
  // }

  onSaveForm(){
    if(!this.lstToEmp || this.lstToEmp.length == 0)
    {
      this.notify.notifyCode('HR040');
      return;
    }
    this.notify.alertCode('HR043',null, this.dowCode, this.fromEmp.employeeName)
    .subscribe((res:any) => {
      if(res && res?.event?.status == 'Y')
      {
        // coppy data
        let employeeIDs = this.lstToEmp.map(x => x.EmployeeID).join(";");
        this.api.execSv("HR","PR","KowDsBusiness","CoppyDataToEmployeeAsync",[this.fromEmp.employeeID,employeeIDs,this.dowCode,this.modeSaveData])
        .subscribe((res:any)=>{
          if(res)
          {
            this.notify.notifyCode("SYS007");
            this.dialog.close(true);
          }
          else this.notify.notifyCode("SYS021");
        });
      }
    })
  }


  // onClickHideComboboxPopup(event){
  //   this.isHidden = true;
  //   if(event == null){

  //   }
  //   else if(event.id){
  //     this.lstCopyEmpID = event.id.split(';')
  //     this.currentCbxValue = event.id;
  //     this.getListEmpInfo(event.id).subscribe((res) => {
  //       this.copyEmployeesInfo = res;
  //     })
  //   }
  // }

  // onclickOpenComboboxEmp(){
  //   this.isHidden = false;
  // }

  // getListEmpInfo(data) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.PR',
  //     'KowDsBusiness',
  //     'GetEmpsInfoAsync',
  //     [data]
  //   );
  // }

  // deleteEmpsKowsByDowCode(){
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.PR',
  //     'KowDsBusiness',
  //     'DeleteEmpKowAsyncByDowCodeAsync',
  //     [this.lstCopyEmpID, this.dowCode]
  //   );
  // }

  // copyEmpsKows(){
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.PR',
  //     'KowDsBusiness',
  //     'CopyEmpKowAsync',
  //     [this.employeeId,this.lstCopyEmpID.join(';'), this.dowCode]
  //   );
  // }
}
