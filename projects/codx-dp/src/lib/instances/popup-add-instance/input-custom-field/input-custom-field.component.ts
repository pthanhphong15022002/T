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
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
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
      var phonenumberFormat = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
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
