import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CacheService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { DP_Steps_Fields } from '../../../models/models';

@Component({
  selector: 'codx-input-custom-field',
  templateUrl: './input-custom-field.component.html',
  styleUrls: ['./input-custom-field.component.css'],
})
export class InputCustomFieldComponent implements OnInit {
  @Input() customField : any =null;
  @Output() valueChangeCustom = new EventEmitter<any>();
  //file - đặc thù cần hỏi lại sau
  @Input() objectId: any = '';
  @Input() objectType: any = '';
  @Input() funID: any = '';
  @Input() formModel: any = null;
  @ViewChild('attachment') attachment: AttachmentComponent;
  errorMessage = '';
  showErrMess = false;
  //data tesst
  typeControl = 'text';
  currentRate = 1;
  hovered = 0;
  readonly = false;
  min = 0;
  max = 9999999;
  formatDate = 'd';
  allowMultiFile = '1';
  isPopupUserCbb = false;
  messCodeEmail = 'SYS037'; // Email ko hợp lê
  messCodePhoneNum = 'RS030';
  listIdUser: string = '';
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
        break;
      case 'A':
        this.allowMultiFile = this.customField.multiselect ? '1' : '0';
        break;
    }
  }

  valueChange(e) {
    if (this.customField.isRequired) {
      if (!e || !e.data || e.data.toString().trim() == '') {
        this.showErrMess = true;
        return;
      } else this.showErrMess = false;
    }
    switch (this.customField.dataType) {
      case 'T':
        if (this.customField.dataFormat == 'E') {
          let email = e.data;
          var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          // var mailformat =
          //   /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          if (!email.match(mailformat)) {
            this.cache.message(this.messCodeEmail).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
                this.showErrMess = true;
              }
              this.changeDef.detectChanges();
              return;
            });
          } else this.showErrMess = false;
        }
        //format so dien thoai
        if (this.customField.dataFormat == 'P') {
          let phone = e.data;
          var phonenumberFormat =
            /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
          // //Thêm trường hợp +84
          // var phonenumberFormat =
          //   /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
          if (!phone.match(phonenumberFormat)) {
            this.cache.message(this.messCodePhoneNum).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
                this.showErrMess = true;
              }
              this.changeDef.detectChanges();
              return;
            });
          } else this.showErrMess = false;
        }
        break;
      case 'N':
        if (isNaN(e.data)) {
          this.cache.message('RS006').subscribe((res) => {
            if (res) {
              this.showErrMess = true;
              this.errorMessage = res.defaultName;
            }
            this.changeDef.detectChanges();
            return;
          });
        } else {
          this.showErrMess = false;
        }
        if (this.customField.dataFormat == 'I') {
          if (!String(e.data).match(/^-?\d+$/)) {
            this.showErrMess = true;
            //Mssg chưa có
            this.errorMessage = 'Vui lòng nhập số nguyên';
            this.changeDef.detectChanges();
            return;
          }
        } else {
          this.showErrMess = false;
        }
        if (this.customField.dataFormat == 'D') {
          if (!String(e.data).match(/^-?\d+\.\d+$/)) {
            this.showErrMess = true;
            //Mssg chưa có
            this.errorMessage = 'Vui lòng nhập số thập phân';
            this.changeDef.detectChanges();
            return;
          }
        } else {
          this.showErrMess = false;
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
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  valueChangeTime() {}

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
    if (this.customField.dataFormat == 'R') {
      this.valueChangeCustom.emit({
        e: e,
        data: this.customField,
      });
      return;
    }
  }
}
