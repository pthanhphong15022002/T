import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Customers, CM_Deals, CM_Leads } from '../../models/cm_model';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { CodxAddressCmComponent } from '../../cmcustomer/cmcustomer-detail/codx-address-cm/codx-address-cm.component';

@Component({
  selector: 'lib-popup-convert-lead',
  templateUrl: './popup-convert-lead.component.html',
  styleUrls: ['./popup-convert-lead.component.css'],
})
export class PopupConvertLeadComponent implements OnInit {
  @ViewChild('codxListContact') codxListContact: CodxListContactsComponent;
  @ViewChild('codxConvert') codxConvert: CodxListContactsComponent;
  @ViewChild('codxListAddress') codxListAddress: CodxAddressCmComponent;
  @ViewChild('codxLoadAdress') codxLoadAdress: CodxAddressCmComponent;

  deal: CM_Deals = new CM_Deals();
  lead: CM_Leads = new CM_Leads();
  customer: CM_Customers = new CM_Customers();
  dialog: any;
  data: any;
  titleAction = '';
  title = '';
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Cơ hội', name: 'Deal' },
    {
      icon: 'icon-people_outline',
      text: 'Khách hàng',
      name: 'Customer',
    },
    {
      icon: 'icon-contact_phone',
      text: 'Người liên hệ',
      name: 'Contacts',
    },
    {
      icon: 'icon-location_on',
      text: 'Danh sách địa chỉ',
      name: 'Address',
    },
    {
      icon: 'con-settings',
      text: 'Thông tin nhập liệu',
      name: 'InputInformation',
    },
  ];
  formModelDeals: any;
  formModelCustomer: any;
  listCbxProcess = [];
  listParticipants = [];
  fieldCbxParticipants = { text: 'userName', value: 'userID' };
  fieldCbxProcess = { text: 'processName', value: 'recID' };
  owner: any;
  gridViewSetupDeal: any;
  gridViewSetupCustomer: any;
  radioChecked = true;
  lstCustomer = [];
  avatarChange = false;
  customerID: any;
  lstContactCustomer = []; //List contact khách hàng lấy ra và convert thêm từ tiềm năng để load ra
  lstContactDeal = []; //List contact cơ hội được convert từ khách hàng
  listAddressCustomer = []; //List address khách hàng lấy ra và convert thêm từ tiềm năng để load ra
  lstContactDelete = [];
  lstAddressDelete = [];
  countAddNew = 0;
  countAddSys = 0;
  customerOld: any;
  customerNewOld: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.lead = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.titleAction = dt?.data?.title;
    this.cache.gridViewSetup('CMDeals', 'grvCMDeals').subscribe((res) => {
      if (res) {
        this.gridViewSetupDeal = res;
      }
    });
    this.cache
      .gridViewSetup('CMCustomers', 'grvCMCustomers')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetupCustomer = res;
        }
      });
  }

  async ngOnInit() {
    this.formModelDeals = await this.cmSv.getFormModel('CM0201');
    this.formModelCustomer = await this.cmSv.getFormModel('CM0101');
    var options = new DataRequest();
    options.entityName = 'DP_Processes';
    options.predicates = 'ApplyFor=@0 && !Deleted';
    options.dataValues = '1';
    options.pageLoading = false;
    this.cmSv.loadDataAsync('DP', options).subscribe((process) => {
      this.listCbxProcess =
        process != null && process.length > 0 ? process : [];
    });
  }

  async ngAfterViewInit() {
    if (this.radioChecked) {
      this.countAddSys++;
    }
    this.setData();

    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  onSelect(e): void {
    console.log('onSelect', e);
    this.deal.processID = e.itemData.value;
  }

  setData(){
    this.customer.customerName = this.lead?.leadName;
    this.customer.phone = this.lead?.phone;
    this.customer.faxNo = this.lead?.faxNo;
    this.customer.webPage = this.lead?.webPage;
    this.customer.industries = this.lead?.industries;
    this.customer.annualRevenue = this.lead?.annualRevenue;
    this.customer.headcounts = this.lead?.headcounts;
    this.customer.customerResource = this.lead?.customerResource;
    this.customer.establishDate = this.lead?.establishDate;
    this.deal.channelID = this.lead?.channelID;
    this.deal.businessLineID = this.lead?.businesslineID;
    this.deal.consultantID = this.lead?.consultantID;
    // this.deal.salespersonID = this.lead?.salespersonID;
    // this.deal.owner = this.lead?.salespersonID;
    this.deal.note = this.lead?.note;
    this.deal.memo = this.lead?.memo;
    this.changeDetectorRef.detectChanges();
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactCustomer = this.cmSv.bringDefaultContactToFront(res);
      } else {
        this.lstContactCustomer = [];
      }
      this.lstContactDeal = [];
    });
  }

  getListAddress(entityName, recID) {
    this.cmSv.getListAddress(entityName, recID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listAddressCustomer = res;
      } else {
        this.listAddressCustomer = [];
      }
    });
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }


  //#region save
  onSave(){
    if(!this.radioChecked){
      this.customer.recID = this.customerNewOld;
    }
    this.deal.customerID = this.customer?.recID;

    var data = [];
    if(this.lstContactCustomer != null){
      this.lstContactCustomer.forEach(res =>{
        if(res?.objectType == '2'){
          res.recID = Util.uid();
        }
      })
    }

    if(this.lstContactDeal != null){
      this.lstContactDeal.forEach(res =>{
        if(res?.objectType == '2' || res?.objectType == '1'){
          res.recID = Util.uid();
        }
      })
    }
    data = [this.lead.recID, this.customer, this.deal, this.lstContactCustomer, this.lstContactDeal, this.lstContactDelete, this.listAddressCustomer, this.lstAddressDelete]
    this.api.execSv<any>('CM','ERM.Business.CM','LeadsBusiness','ConvertLeadToCustomerAndDealAsync',data).subscribe(res =>{
      if(res){

      }
    })
  }
  //#endregion

  async cbxProcessChange(e) {
    if (e != null && e.trim() != '') {
      this.deal.processID = e;
      if (this.listCbxProcess != null) {
        var process = this.listCbxProcess.find((x) => x.recID == e);
        if (process != null && process.permissions != null) {
          var lstPerm = process.permissions.filter((x) => x.roleType == 'P');
          this.listParticipants =
            lstPerm != null && lstPerm.length > 0
              ? await this.cmSv.getListUserByOrg(lstPerm)
              : [];
        }
      }
    }
  }


  changeRadio(e) {
    this.codxConvert.getListContacts();
    this.codxLoadAdress.getListAddress();
    if (e.field === 'yes' && e.component.checked === true) {
      if (this.countAddSys > 0) {
        this.customerID = this.customerOld;
        this.lead.customerID = this.customerID;
      }
      this.radioChecked = true;
      this.getListContactByObjectID(this.customerID);
      this.getListAddress('CM_Customers', this.customerID);
      this.countAddSys++;
    } else if (e.field === 'no' && e.component.checked === true) {
      if (this.countAddNew == 0) {
        this.customerID = Util.uid();
        this.customerNewOld = this.customerID;
      }
      this.getListContactByObjectID(this.customerNewOld);
      this.getListAddress('CM_Customers', this.customerNewOld);
      this.radioChecked = false;
      this.countAddNew++;
    }
  }
  valueChangeOwner(e) {
    this.deal.salespersonID = e;
    this.deal.owner = e;
  }
  valueChangeCustomer(e) {
    this.customer[e.field] = e?.data;
  }
  valueTagChange(e) {
    this.data.tags = e.data;
  }

  valueChange(e) {
    this.deal[e.field] = e?.data;
    if (e.field == 'customerID') {
      this.customerID = e?.data ? e.data : null;
      if (this.customerID) {
        this.customerOld = this.customerID;
        this.lead.customerID = this.customerID;
        this.customer.recID = this.customerID;
        this.getListContactByObjectID(this.customerID);
        this.getListAddress('CM_Customers', this.customerID);
      }
    }
  }

  valueDateChange(e, type){
    if(type = 'deal'){
      this.deal[e.field] = e.data.fromDate;
    }else{
      this.customer.establishDate = e.data.fromDate;
    }
  }
  //#region Contact

  objectConvert(e) {
    if (e.e.data == true) {
      if (e?.data != null) {
        var check = this.lstContactCustomer.findIndex(
          (x) => x.isDefault == true
        );
        if (e.data.isDefault == true) {
          if (check != -1) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.lstContactCustomer[check].isDefault = false;
              } else {
                e.data.isDefault = false;
              }
              this.lstContactCustomer.push(Object.assign({}, e?.data));
              this.codxListContact.loadListContact(this.lstContactCustomer);

              this.changeDetectorRef.detectChanges();
            });
          } else {
            this.lstContactCustomer.push(Object.assign({}, e?.data));
            this.codxListContact.loadListContact(this.lstContactCustomer);
          }
        } else {
          this.lstContactCustomer.push(Object.assign({}, e?.data));
          this.codxListContact.loadListContact(this.lstContactCustomer);
        }
      }
    } else {
      var index = this.lstContactCustomer.findIndex(
        (x) => x.recID == e?.data?.recID
      );
      if (index != -1) {
        var indexDeal = this.lstContactDeal.findIndex(
          (x) => this.lstContactCustomer[index].recID == x.recID
        );
        this.lstContactCustomer.splice(index, 1);

        this.codxListContact.loadListContact(this.lstContactCustomer);

        if (indexDeal != -1) {
          this.lstContactDeal.splice(indexDeal, 1);
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  objectConvertDeal(e) {
    if (e.e.data == true) {
      if (e.data) {
        this.lstContactDeal.push(e?.data);
      }
    } else {
      var index = this.lstContactDeal.findIndex(
        (x) => x.recID == e?.data?.recID
      );
      this.lstContactDeal.splice(index, 1);
    }
  }

  contactEvent(e) {
    if (e.data) {
      var findIndex = this.lstContactDeal.findIndex(
        (x) => x.recID == e.data?.recID
      );
      if (e.action == 'edit') {
        if (findIndex != -1) {
          this.lstContactDeal[findIndex] = e.data;
        }
      } else {
        this.lstContactDelete.push(Object.assign({}, e?.data));
        if (findIndex != -1) {
          this.lstContactDeal.splice(findIndex, 1);
        }
      }
    }
  }

  lstContactEmit(e) {
    this.lstContactCustomer = e;
  }
  //#endregion

  //#region address
  convertAddress(e) {
    if (e.e.data == true) {
      if (e?.data != null) {
        var check = this.listAddressCustomer.findIndex(
          (x) => x.isDefault == true
        );
        if (e.data.isDefault == true) {
          if (check != -1) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.listAddressCustomer[check].isDefault = false;
              } else {
                e.data.isDefault = false;
              }
              this.listAddressCustomer.push(Object.assign({}, e?.data));
              this.codxListAddress.loadListAdress(this.listAddressCustomer);
              this.changeDetectorRef.detectChanges();
            });
          } else {
            this.listAddressCustomer.push(Object.assign({}, e?.data));
            this.codxListAddress.loadListAdress(this.listAddressCustomer);
          }
        } else {
          this.listAddressCustomer.push(Object.assign({}, e?.data));
          this.codxListAddress.loadListAdress(this.listAddressCustomer);
        }
      }
    } else {
      var index = this.listAddressCustomer.findIndex(
        (x) => x.recID == e?.data?.recID
      );
      if (index != -1) {

        this.listAddressCustomer.splice(index, 1);

        this.codxListAddress.loadListAdress(this.listAddressCustomer);
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  lstAddressEmit(e){
    this.listAddressCustomer = e;
  }

  lstAddressDeleteEmit(e){
    this.lstAddressDelete = e;
  }
  //#endregion

  changeAvatar() {
    this.avatarChange = true;
  }
}
