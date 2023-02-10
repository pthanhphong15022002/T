import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { BankAccount } from '../../models/BankAccount.model';

@Component({
  selector: 'lib-pop-add-bank',
  templateUrl: './pop-add-bank.component.html',
  styleUrls: ['./pop-add-bank.component.css']
})
export class PopAddBankComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  bankaccount: BankAccount;
  gridViewSetup:any;
  bankAcctID:any;
  bankID:any;
  formType:any;
  owner:any;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.bankAcctID ='';
    this.bankID = '';
    this.owner = '';
    this.cache.gridViewSetup('BankAccounts', 'grvBankAccounts').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.data != null) {
      this.bankaccount = dialogData.data?.data;
      this.bankAcctID =  dialogData.data?.data.bankAcctID;
      this.bankID = dialogData.data?.data.bankID;
      this.owner = dialogData.data?.data.owner;
      console.log(this.bankaccount);
    }
  }
//#endregion

  //#region Init
onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.bankaccount == null) {
      this.bankaccount = this.form?.formGroup.value;
      this.bankaccount.objectType= "1";
    } 
  }
  //#endregion
  
  //#region Function
  valueChange(e:any){
    this.bankaccount[e.field] = e.data; 
  }
  valueChangeBankAcctID(e: any) {
    this.bankAcctID = e.data;
    this.bankaccount.bankAcctNo = e.data;
    this.bankaccount[e.field] = e.data;   
  }
  valueChangeBankID(e: any) {
    this.bankID = e.data;
    this.bankaccount[e.field] = e.data;   
  }
  valueChangeOwner(e: any) {
    this.owner = e.data;
    this.bankaccount[e.field] = e.data;   
  }
  //#endregion

  //#region CRUD
  onSave(){
    if (this.bankAcctID.trim() == '' || this.bankAcctID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['BankAcctID'].headerText + '"'
      );
      return;
    }
    if (this.bankID.trim() == '' || this.bankID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['BankID'].headerText + '"'
      );
      return;
    }
    if (this.owner.trim() == '' || this.owner == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner'].headerText + '"'
      );
      return;
    }
      window.localStorage.setItem("databankaccount",JSON.stringify(this.bankaccount));
    this.dialog.close();
  }
  //#endregion
}
