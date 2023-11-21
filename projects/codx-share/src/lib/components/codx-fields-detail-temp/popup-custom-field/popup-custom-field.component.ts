import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-custom-field',
  templateUrl: './popup-custom-field.component.html',
  styleUrls: ['./popup-custom-field.component.css'],
})
export class PopupCustomFieldComponent implements OnInit {
  fields = [];
  dialog: any;
  titleHeader = '';
  currentRate = 3.5;
  hovered = 0;
  vllShare = '';
  errorMessage = '';
  checkErr = false;
  checkRequired = false;
  isSaving = false;
  isAddComplete: any = true;
  objectIdParent: any;
  customerID: any; //Khách hàng cơ hội

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.fields = JSON.parse(JSON.stringify(dt?.data?.data));
    this.titleHeader = dt?.data?.titleHeader;
    this.objectIdParent = dt?.data?.objectIdParent;
    this.customerID = dt?.data?.customerID;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    // this.checkRequired = this.data.some((x) => x.isRequired == true);
    // this.cache.message('SYS028').subscribe((res) => {
    //   if (res) this.errorMessage = res.customName || res.defaultName;
    // });
  }

  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
        case 'C':
        case 'L':
        case 'TA':
        case 'PA':
          result = event.e;
          break;
      }
      var index = this.fields.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.fields[index].dataValue = result;
      }
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          //this.notiService.notifyCode('SYS037');
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          // this.notiService.notifyCode('RS030');
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }

  onSave() {
    if (this.fields?.length == 0 || !this.isAddComplete) return;

    let check = true;
    let checkFormat = true;
    this.fields.forEach((f) => {
      if (!f.dataValue || f.dataValue?.toString().trim() == '') {
        if (f.isRequired) {
          this.notiService.notifyCode('SYS009', 0, '"' + f.title + '"');
          check = false;
        }
      } else checkFormat = this.checkFormat(f);
    });
    if (!check || !checkFormat) return;
    if (this.isSaving) return;
    this.isSaving = true;
    var data = [this.fields[0]?.stepID, this.fields];
    this.api
      .exec<any>(
        'DP',
        'InstancesStepsBusiness',
        'UpdateInstanceStepFielsByStepIDAsync',
        data
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(this.fields);
          this.notiService.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        } else this.dialog.close();
      });
  }

  addFileCompleted(e) {
    this.isAddComplete = e;
  }
}
