import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CacheService } from 'codx-core';

@Component({
  selector: 'codx-input-custom-field',
  templateUrl: './codx-input-custom-field.component.html',
  styleUrls: ['./codx-input-custom-field.component.css']
})
export class CodxInputCustomFieldComponent implements OnInit{
  @Input() customField: any = null;
  @Output() valueChangeCustom = new EventEmitter<any>();
  //file - đặc thù cần hỏi lại sau
  @Input() objectId: any = '';
  @Input() checkValid = true;
  @Input() objectType: any = '';
  @Input() funID: any = '';
  @Input() formModel: any = null;
  @Input() disable = false;
  @Input() viewFieldName = false;
  // @Input() readonly = false;
  @ViewChild('attachment') attachment: AttachmentComponent;

  errorMessage = '';
  showErrMess = false;
  //data tesst
  typeControl = 'text';
  currentRate = 0;
  hovered = 0;

  min = 0;
  max = 9999999;
  formatDate = 'd';
  allowMultiFile = '1';
  isPopupUserCbb = false;
  messCodeEmail = 'SYS037'; // Email ko hợp lê
  messCodePhoneNum = 'RS030';
  listIdUser: string = '';
  arrIdUser = [];
  numberChange = 0;

  constructor(
    private cache: CacheService,
    private changeDef: ChangeDetectorRef
  ) {
    this.cache.message('SYS028').subscribe((res) => {
      if (res) this.errorMessage = res.customName || res.defaultName;
    });
  }

  ngOnInit(): void {
    switch (this.customField.dataType) {
      case 'D':
        if (this.customField.dataFormat == '3') this.formatDate = 'd';
        if (
          this.customField.dataFormat == '1' ||
          this.customField.dataFormat == '2'
        )
          this.formatDate = 'F';
        if (
          this.customField.dataFormat == '4' ||
          this.customField.dataFormat == '5'
        )
          this.formatDate = 't';
        break;
      case 'P':
        this.listIdUser = this.customField?.dataValue ?? '';
        this.arrIdUser = this.listIdUser ? this.listIdUser.split(';') : [];
        break;
      case 'A':
        this.allowMultiFile = this.customField.multiselect ? '1' : '0';
        break;
    }
  }

  valueChange(e) {
    let checkNull = !e || !e.data || e.data.toString().trim() == '';
    // if (this.checkValid) {
    if (this.customField.isRequired && checkNull) {
      this.cache.message('SYS028').subscribe((res) => {
        if (res) this.errorMessage = res.customName || res.defaultName;
        this.showErrMess = true;
      });
      if (!this.checkValid) return;
    } else this.showErrMess = false;
    // } else this.showErrMess = false;

    switch (this.customField.dataType) {
      case 'T':
        if (this.customField.dataFormat == 'E') {
          let email = e.data;
          var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (!email.toLocaleLowerCase().match(mailformat)) {
            this.cache.message(this.messCodeEmail).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeDef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        //format so dien thoai
        if (this.customField.dataFormat == 'P') {
          let phone = e.data;
          var phonenumberFormat =
            /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
          if (!phone.toLocaleLowerCase().match(phonenumberFormat)) {
            this.cache.message(this.messCodePhoneNum).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeDef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        break;
    }

    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }
  //combox user
  openUserPopup() {
    this.isPopupUserCbb = true;
  }

  valueCbxUserChange(e) {
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
    if (e && e.id) {
      if (!this.listIdUser || this.customField.dataFormat == '1')
        this.listIdUser = e.id;
      else this.listIdUser += ';' + e.id;
      this.arrIdUser = Array.from(new Set(this.listIdUser ? this.listIdUser.split(';') : []));
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  deleteUser(id) {
    let index = this.arrIdUser.indexOf(id);
    if (index > -1) {
      this.arrIdUser.splice(index, 1);
      if (this.arrIdUser?.length > 0)
        this.listIdUser = this.arrIdUser.join(';');
      else this.listIdUser = '';
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  valueChangeTime(e) {
    if (this.customField.dataValue && this.numberChange == 0) {
      this.numberChange = 1;
      return;
    }
    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }

  addFile() {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {}

  fileSave(e) {
    let result = '';
    if (e && typeof e === 'object') {
      var filed = Array.isArray(e) ? e[0].data : e;
      result = filed?.objectID + ';' + filed?.objectType;
    }
    this.valueChangeCustom.emit({ e: result, data: this.customField });
  }
  rateChange(e) {
    //rank
    // if (this.customField.dataFormat == 'R') {
    this.valueChangeCustom.emit({
      e: e,
      data: this.customField,
    });
    //  return;
    //}//
  }
  controlBlur(e) {
    // if (e.crrValue) this.valueChange(e.crrValue);
  }
}