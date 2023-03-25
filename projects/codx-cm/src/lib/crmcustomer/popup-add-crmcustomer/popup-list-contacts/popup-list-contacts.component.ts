import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
} from 'codx-core';
import { PopupQuickaddContactComponent } from '../popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'lib-popup-list-contacts',
  templateUrl: './popup-list-contacts.component.html',
  styleUrls: ['./popup-list-contacts.component.css'],
})
export class PopupListContactsComponent implements OnInit {
  dialog: any;
  data: any;

  lstContacts = [
    {
      contactID: 'ID1',
      contactName: 'Trương Đặng Ngọc Phúc',
      positionName: 'Giám đốc',
      phoneNumber: '0702411141',
      email: 'tdnphuck42@gmail.com',
      allowCall: true,
      allowEmail: true,
    },
    {
      contactID: 'ID2',
      contactName: 'Trương Đặng Ngọc Thiên',
      positionName: 'Trưởng phòng',
      phoneNumber: '0702411141',
      email: 'tdnphuck422@gmail.com',
      allowCall: true,
      allowEmail: true,
    },
    {
      contactID: 'ID3',
      contactName: 'Phạm Thị Anh Tú',
      positionName: 'Giám đốc chi nhánh',
      phoneNumber: '0702411141',
      email: 'tdnphucck42@gmail.com',
      allowCall: false,
      allowEmail: false,
    },
    {
      contactID: 'ID4',
      contactName: 'Trương Đặng Ngọc Minh',
      positionName: 'Giám đốc sở',
      phoneNumber: '0702411141',
      email: 'tdnphuc1k42@gmail.com',
      allowCall: false,
      allowEmail: false,
    },
    {
      contactID: 'ID5',
      contactName: 'Trương Đặng Ngọc Đại',
      positionName: 'Giám đốc',
      phoneNumber: '0702411141',
      email: 'tdnphuc22k42@gmail.com',
      allowCall: true,
      allowEmail: true,
    },
    {
      contactID: 'ID6',
      contactName: 'Trương Đặng Ngọc Thắng',
      positionName: 'Nhân viên',
      phoneNumber: '0702411141',
      email: 'tdnphu33ck42@gmail.com',
      allowCall: true,
      allowEmail: false,
    },
    {
      contactID: 'ID7',
      contactName: 'Trương Đặng Ngọc Hoàng',
      positionName: 'Thực tập',
      phoneNumber: '0702411141',
      email: 'tdnph44uck42@gmail.com',
      allowCall: true,
      allowEmail: true,
    },
    {
      contactID: 'ID8',
      contactName: 'Nguyễn Văn Thuận',
      positionName: 'Phó phòng',
      phoneNumber: '0702411141',
      email: 'tdnphu1ck42@gmail.com',
      allowCall: false,
      allowEmail: true,
    },
    {
      contactID: 'ID9',
      contactName: 'Võ Thảo',
      positionName: 'Leader',
      phoneNumber: '0702411141',
      email: 'tdn2phuck42@gmail.com',
      allowCall: false,
      allowEmail: false,
    },
    {
      contactID: 'ID10',
      contactName: 'Trần Đoàn Tuyết Khanh',
      positionName: 'BA',
      phoneNumber: '0702411141',
      email: 'tdnphu3ck42@gmail.com',
      allowCall: true,
      allowEmail: true,
    },
    {
      contactID: 'ID11',
      contactName: 'Nguyễn Văn Huy',
      positionName: 'Giám đốc',
      phoneNumber: '0702411141',
      email: 'tdnph5uck42@gmail.com',
      allowCall: true,
      allowEmail: false,
    },
  ];
  currentContact = 0;

  contact: any;
  lstSearch = [];
  constructor(
    private callFc: CallFuncService,
    private changeDet: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    if (this.lstContacts != null && this.lstContacts.length > 0) {
      this.lstSearch = this.lstContacts;
      this.changeContacts(0, this.lstSearch[0]);
    }
  }

  onSave() {}

  changeContacts(index, item) {
    this.currentContact = index;
    this.changeDet.detectChanges();
  }

  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callFc.openForm(
      PopupQuickaddContactComponent,
      '',
      500,
      500,
      '',
      '',
      '',
      opt
    );
  }

  searchName(searchTerm) {
    var search = [];
    if(searchTerm.trim() == ''){
      this.lstSearch = this.lstContacts;
      return;
    }
    search = this.lstContacts.filter(contact =>
      contact.contactID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.lstSearch = search;
  }
}
