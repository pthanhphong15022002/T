import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  CacheService,
  NotificationsService,
} from 'codx-core';
import { CodxDpService } from 'projects/codx-dp/src/public-api';

@Component({
  selector: 'lib-popup-custom-field',
  templateUrl: './popup-custom-field.component.html',
  styleUrls: ['./popup-custom-field.component.css'],
})
export class PopupCustomFieldComponent implements OnInit {
  fiels = [];
  dialog: any;
  titleHeader = '';
  currentRate = 3.5;
  hovered = 0;
  vllShare = '';
  errorMessage = '';
  checkErr = false;
  checkRequired = false;
  isSaving = false;

  constructor(
    private dpService: CodxDpService,
    private changeDetec: ChangeDetectorRef,
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.fiels = JSON.parse(JSON.stringify(dt.data.data));
    this.titleHeader = dt.data?.titleHeader;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    // this.checkRequired = this.data.some((x) => x.isRequired == true);
    // this.cache.message('SYS028').subscribe((res) => {
    //   if (res) this.errorMessage = res.customName || res.defaultName;
    // });
  }

  valueChangeCustom(event) {
    if (event && event.e && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }

      var index = this.fiels.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.fiels[index].dataValue = result;
      }
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.notiService.notifyCode('SYS037');
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.notiService.notifyCode('RS030');
          return false;
        }
      }
    }
    return true;
  }
  onSave() {
    if (this.fiels?.length == 0) return;

    let check = true;
    let checkFormat = true;
    this.fiels.forEach((f) => {
      if (
        f.isRequired &&
        (!f.dataValue || f.dataValue?.toString().trim() == '')
      ) {
        this.notiService.notifyCode('SYS009', 0, '"' + f.title + '"');
        check = false;
      }
      checkFormat = this.checkFormat(f);
    });
    if (!check || !checkFormat) return;
    if (this.isSaving) return;
    this.isSaving = true;
    var data = [this.fiels[0]?.stepID, this.fiels];
    this.dpService.updateFiels(data).subscribe((res) => {
      if (res) this.dialog.close(this.fiels);
      else this.dialog.close();
    });
  }
}
