import { CM_Contacts } from './../../../models/tmpCrm.model';
import { CodxCmService } from './../../../codx-cm.service';
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

  lstContacts = [];
  currentContact = 0;

  contact: CM_Contacts;
  lstSearch = [];
  constructor(
    private callFc: CallFuncService,
    private changeDet: ChangeDetectorRef,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.cmSv.getContacts().subscribe((res) => {
      if (res != null && res.length > 0) {
        this.lstContacts = res;
        this.lstSearch = this.lstContacts;
        this.changeContacts(0, this.lstSearch[0]);
      }
    });
  }

  onSave() {
    if (this.contact != null) this.dialog.close(this.contact);
    else return;
  }

  changeContacts(index, item) {
    this.currentContact = index;
    this.contact = item;
    this.changeDet.detectChanges();
  }

  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    var dialog = this.callFc.openForm(
      PopupQuickaddContactComponent,
      '',
      500,
      500,
      '',
      '',
      '',
      opt
    );
    dialog.closed.subscribe((e) => {
      if (e && e.event != null) {
        //gán tạm thời để xử lí liên hệ chính
        this.contact = e.event;
        this.lstContacts.push(this.contact);
        this.lstSearch = this.lstContacts;
        var index = this.lstSearch.findIndex(
          (x) => x.recID == this.contact.recID
        );
        if (index > -1) {
          this.changeContacts(index, this.contact);
        } else {
          this.changeContacts(0, this.lstSearch[0]);
        }
        this.changeDet.detectChanges()
      }
    });
  }

  searchName(searchTerm) {
    var search = [];
    if (searchTerm.trim() == '' || searchTerm == null) {
      this.lstSearch = this.lstContacts;
      this.changeContacts(0, this.lstSearch[0]);
      return;
    }

    this.cmSv.searchContacts(searchTerm).subscribe((res) => {
      if (res && res.length > 0) {
        search = res;
        this.lstSearch = search;
      } else {
        this.lstSearch = [];
        this.contact = null;
      }
      this.changeDet.detectChanges()

    });
  }
}
