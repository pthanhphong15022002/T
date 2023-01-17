import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CacheService, ApiHttpService, CallFuncService, NotificationsService, UIComponent, DialogData, DialogRef, FormModel, CodxFormComponent, DialogModel } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Customers } from '../../models/Customers.model';
import { PopAddBankComponent } from '../pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from '../pop-add-contact/pop-add-contact.component';

@Component({
  selector: 'lib-pop-add-customers',
  templateUrl: './pop-add-customers.component.html',
  styleUrls: ['./pop-add-customers.component.css']
})
export class PopAddCustomersComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  title:string;
  headerText:string;
  formModel: FormModel;
  dialog!: DialogRef;
  customers:Customers
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'Establish' },
    { icon: 'icon-train', text: 'Thông tin giao hàng', name: 'Shipment Details'},
    { icon: 'icon-location_on me-1', text: 'Danh sách địa chỉ', name: 'Location' },
    { icon: 'icon-contacts', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-credit_card', text: 'Tài khoản ngân hàng', name: 'Atm' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'Infomation' },
  ];
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
    this.customers=dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
  }

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  openPopupBank(){
    var obj = {
      headerText: 'Thêm tài khoản ngân hàng',
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'BankAccounts';
    dataModel.gridViewName = 'grvBankAccounts';
    dataModel.entityName = 'BS_BankAccounts';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('BankAccounts','grvBankAccounts').subscribe(res=>{
      if(res){  
        var dialogexchange = this.callfc.openForm(
          PopAddBankComponent,
          '',
          650,
          550,
          '',
          obj,
          '',
          opt
        );
      
      }
    });
  }
  openPopupContact(){
    var obj = {
      headerText: 'Thêm người liên hệ',
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('ContactBook','grvContactBook').subscribe(res=>{
      if(res){  
        var dialogexchange = this.callfc.openForm(
          PopAddContactComponent,
          '',
          650,
          550,
          '',
          obj,
          '',
          opt
        );
      
      }
    });
  }
}
