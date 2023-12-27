import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { CallFuncService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';

@Component({
  selector: 'pr-popup-copy-ekowds',
  templateUrl: './popup-copy-ekowds.component.html',
  styleUrls: ['./popup-copy-ekowds.component.css']
})
export class PopupCopyEkowdsComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  actionType: string;
  formModel: FormModel;
  headerText: string;
  dataObj: any;
  dowCode: any = '2023/12';
  vllMode = '1';
  employeeId: string;
  vllObj1 : any;
  vllObj2 : any;
  lstCopyEmpID: any = [];
  isHidden = true;
  currentCbxValue: any;

  resourceEmployeeInfo: any;

  copyEmployeesInfo: any;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    // this.dataObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    this.employeeId = JSON.parse(JSON.stringify(data?.data?.employeeId));
    if(data?.data?.dowCode){
      this.dowCode = JSON.parse(JSON.stringify(data?.data?.dowCode));
    }
  }

  onInit(): void {
    this.cache.valueList('HR057').subscribe((res) => {
      console.log('doc cache ', res);
      this.vllObj1 = {...res.datas[0]}
      this.vllObj2 = {...res.datas[1]}
    })

    this.getListEmpInfo(this.employeeId).subscribe((res) => {
      this.resourceEmployeeInfo = res[0];
    })
  }

  deleteEmp(emp){
    let index = this.copyEmployeesInfo.indexOf(emp);
    if(index != -1){
      this.copyEmployeesInfo.splice(index, 1);
    }
    let indexInIDsArr = this.lstCopyEmpID.indexOf(emp.employeeID);
    if(indexInIDsArr != -1){
      this.lstCopyEmpID.splice(indexInIDsArr, 1);
      this.currentCbxValue = this.lstCopyEmpID.join(';')
    }
  }

  onSelectVllVal(evt, data){
    if(data == '1'){
      this.vllMode = '1';
    }
    else this.vllMode = '2';
  }

  onSaveForm(){
    if(this.lstCopyEmpID.length < 1){
      this.notify.notifyCode('HR040');
      return;
    }
    this.notify.alertCode('HR043', null, this.dowCode, this.resourceEmployeeInfo.emp.employeeName).subscribe((x) => {
      if(x.event?.status == 'Y'){
        if(this.vllMode == '1'){
          this.copyEmpsKows().subscribe((res) => {
            if(res == true){
              this.notify.notifyCode('SYS006');
              this.dialog && this.dialog.close(true);
            }
            else this.notify.notifyCode('SYS023');
          })
        }
        else if(this.vllMode == '2'){
          this.deleteEmpsKowsByDowCode().subscribe((res) =>{
            this.copyEmpsKows().subscribe((res) => {
              debugger
              if(res == true){
                this.notify.notifyCode('SYS006');
                this.dialog && this.dialog.close(true);
              }
              else this.notify.notifyCode('SYS023');
            })
          })
        }
      }
    })
  }

  onClickHideComboboxPopup(event){
    this.isHidden = true;
    if(event == null){

    }
    else if(event.id){
      this.lstCopyEmpID = event.id.split(';')
      this.currentCbxValue = event.id;
      this.getListEmpInfo(event.id).subscribe((res) => {
        this.copyEmployeesInfo = res;
      })
    }
  }

  onclickOpenComboboxEmp(){
    this.isHidden = false;
  }

  getListEmpInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetEmpsInfoAsync',
      [data]
    );
  }

  deleteEmpsKowsByDowCode(){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'DeleteEmpKowAsyncByDowCodeAsync',
      [this.lstCopyEmpID, this.dowCode]
    );
  }

  copyEmpsKows(){
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'CopyEmpKowAsync',
      [this.employeeId,this.lstCopyEmpID.join(';'), this.dowCode]
    );
  }
}
