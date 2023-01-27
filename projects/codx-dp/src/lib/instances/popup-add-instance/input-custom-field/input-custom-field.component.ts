import {
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

  constructor(private cache: CacheService) {
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
    // this.customField.dataType = 'D';
    // this.customField.dataFormat = 'D';

    this.allowMultiFile = this.customField.multiselect ? '1' : '0';
    if (this.customField.dataFormat == 'D') this.formatDate = 'd';
    if (this.customField.dataFormat == 'DT') this.formatDate = 'F';
  }

  valueChange(e) {
    this.valueChangeCustom.emit({ e: e, data: this.customField });
    if (this.customField.isRequired) {
      if (!e || !e.data || e.data.trim() == '') this.showErrMess = true; else this.showErrMess = false
    }
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
