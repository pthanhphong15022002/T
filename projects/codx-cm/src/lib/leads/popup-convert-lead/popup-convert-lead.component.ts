import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
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

@Component({
  selector: 'lib-popup-convert-lead',
  templateUrl: './popup-convert-lead.component.html',
  styleUrls: ['./popup-convert-lead.component.css'],
})
export class PopupConvertLeadComponent implements OnInit {
  @ViewChild(('codxListContact')) codxListContact: CodxListContactsComponent;
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
  lstConvertLead = [];
  lstContactCustomer = [];
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
  }

  async ngOnInit() {
    this.formModelDeals = await this.cmSv.getFormModel('CM0201');
    this.formModelCustomer = await this.cmSv.getFormModel('CM0101');

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
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  onSelect(e): void {
    console.log('onSelect', e);
    this.deal.processID = e.itemData.value;
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContactCustomer = this.cmSv.bringDefaultContactToFront(res);
      } else {
        this.lstContactCustomer = [];
      }
    });
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
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
        this.getListContactByObjectID(this.customerID);
      }
    }
  }

  async cbxProcessChange(e) {
    if (e != null && e.trim() != '') {
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

  valueChangeOwner(e) {
    this.deal.owner = e;
  }

  changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      if (this.countAddSys > 0) {
        this.customerID = this.customerOld;
        this.lead.customerID = this.customerID;
      }
      this.radioChecked = true;
      this.getListContactByObjectID(this.customerID);
      this.countAddSys++;
    } else if (e.field === 'no' && e.component.checked === true) {
      if (this.countAddNew == 0) {
        this.customerID = Util.uid();
        this.customerNewOld = this.customerID;
      }
      this.getListContactByObjectID(this.customerNewOld);
      this.radioChecked = false;
      this.countAddNew++;
    }
  }

  valueChangeCustomer(e) {
    this.customer[e.field] = e?.data;
  }

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
              this.codxListContact.listContacts = JSON.parse(JSON.stringify(this.lstContactCustomer));
              this.changeDetectorRef.detectChanges();
            });
          } else {
            this.lstContactCustomer.push(Object.assign({}, e?.data));
            this.codxListContact.listContacts = JSON.parse(JSON.stringify(this.lstContactCustomer));
          }
        } else {
          this.lstContactCustomer.push(Object.assign({}, e?.data));
          this.codxListContact.listContacts = JSON.parse(JSON.stringify(this.lstContactCustomer));
        }
      }
    } else {
      var index = this.lstContactCustomer.findIndex(
        (x) => x.recID == e?.data?.recID
      );
      if (index != -1) {
        this.lstContactCustomer.splice(index, 1);
        this.codxListContact.listContacts = JSON.parse(JSON.stringify(this.lstContactCustomer));
      }
    }
    this.changeDetectorRef.detectChanges();

  }

  lstContactEmit(e) {
    this.lstContactCustomer = e;
  }

  changeAvatar() {
    this.avatarChange = true;
  }
}
