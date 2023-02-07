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
  @Input() customField: any;
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

  constructor(
    private cache: CacheService,
    private changeDef: ChangeDetectorRef
  ) {
    this.cache.message('SYS028').subscribe((res) => {
      if (res) this.errorMessage = res.customName || res.defaultName;
    });
  }

  ngOnInit(): void {
    //data test
    // this.customField.isRequired = true;
    // this.customField.note = 'Nhập số lượng';
    // this.customField.fieldName = 'số lượng';
    // this.customField.title = 'Số lượng nhân viên làm việc';
    // this.customField.rank = 10;
    // this.customField.rankIcon = 'fas fa-ambulance';
    // this.customField.multiselect = true;
    //  this.customField.dataType = 'T';
    //  this.customField.dataFormat = 'T';

    this.allowMultiFile = this.customField.multiselect ? '1' : '0';
    if (this.customField.dataFormat == 'D') this.formatDate = 'd';
    if (this.customField.dataFormat == 'DT') this.formatDate = 'F';
  }

  valueChange(e) {
    if (this.customField.isRequired) {
      if (!e || !e.data || e.data.toString().trim() == '') {
        this.showErrMess = true;
        return;
      } else this.showErrMess = false;
    }
    if (
      this.customField.dataType == 'T' &&
      this.customField.dataFormat == 'E'
    ) {
      let email = e.data;
      // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      //
      var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
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
    if (
      this.customField.dataType == 'T' &&
      this.customField.dataFormat == 'P'
    ) {
      let phone = e.data;
      // var phonenumberFormat = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
      //Thêm trường hợp +84
      var phonenumberFormat = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
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
    //Kiểm tra trường hợp số, số nguyên, số thập phân
    if (this.customField.dataType == 'N') {
      if (isNaN(e.data)) {
        this.cache.message('RS006').subscribe((res) => {
          if (res) {
            this.showErrMess = true;
            this.errorMessage = res.defaultName;
          }
          this.changeDef.detectChanges();
          return;
        });
      }else {
        this.showErrMess = false;
      }
      if (this.customField.dataFormat == 'I') {
        if(!String(e.data).match(/^-?\d+$/)){
          this.showErrMess = true;
          //Mssg chưa có
          this.errorMessage = 'Vui lòng nhập số nguyên';
          this.changeDef.detectChanges();
          return;
        }
      }else {
        this.showErrMess = false;
      }
      if (this.customField.dataFormat == 'D') {
        if(!String(e.data).match(/^-?\d+\.\d+$/)){
          this.showErrMess = true;
          //Mssg chưa có
          this.errorMessage = 'Vui lòng nhập số thập phân';
          this.changeDef.detectChanges();
          return;
        }
      }else {
        this.showErrMess = false;
      }
    }
    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }
  //combox user
  openUserPopup() {
    this.isPopupUserCbb = true;
  }

  valueCbxUserChange(e) {
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }

  addFile() {
    this.attachment.uploadFile();
    debugger;
  }
  fileAdded(e) {}
  getfileCount(e) {}
}
