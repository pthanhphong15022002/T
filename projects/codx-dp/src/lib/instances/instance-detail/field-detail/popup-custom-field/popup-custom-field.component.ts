import { Component, OnInit, Optional, ChangeDetectorRef, Input } from '@angular/core';
import {
  DialogData,
  DialogRef,
  CacheService,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-custom-field',
  templateUrl: './popup-custom-field.component.html',
  styleUrls: ['./popup-custom-field.component.css'],
})
export class PopupCustomFieldComponent implements OnInit {
  @Input() data = [];
  dialog: any;
  title = 'Thông tin nhập liệu';
  currentRate = 3.5;
  hovered = 0;
  vllShare = '';
  errorMessage = '';
  checkErr = false;
  checkRequired = false;
  constructor(
    private changeDetec: ChangeDetectorRef,
    private cache: CacheService,
    private noti: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt.data.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    // this.checkRequired = this.data.some((x) => x.isRequired == true);
    // this.cache.message('SYS028').subscribe((res) => {
    //   if (res) this.errorMessage = res.customName || res.defaultName;
    // });
  }

  valueChange(e, field) {
    console.log('event', e);
    if (field.isRequired) {
      if (!e.data || e.data.toString().trim() == '') {
        this.checkErr = true;
        return;
      } else {
        this.checkErr = false;
      }
    }
    if (field.dataType == 'T' && field.dataFormat == 'E') {
      var email = e.data;
      var valid =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!String(email).toLowerCase().match(valid)) {
        this.cache.message('SYS037').subscribe((res) => {
          if (res) {
            this.checkErr = true;
            this.errorMessage = res.defaultName;
            this.changeDetec.detectChanges();
            return;
          }
        });
      }else {
        this.checkErr = false;
      }
    }
    if (field.dataFormat == 'P') {
      var phone = e.data;
      var valid = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
      if (!String(phone).toLowerCase().match(valid)) {
        this.cache.message('RS030').subscribe((res) => {
          if (res) {
            this.checkErr = true;
            this.errorMessage = res.defaultName;
            this.changeDetec.detectChanges();
            return;
          }
        });
      }else {
        this.checkErr = false;
      }
    }
    if (field.dataType == 'N') {
      if (isNaN(e.data)) {
        this.cache.message('RS006').subscribe((res) => {
          if (res) {
            this.checkErr = true;
            this.errorMessage = res.defaultName;
            this.changeDetec.detectChanges();
            return;
          }
        });
      }else {
        this.checkErr = false;
      }
      if (field.dataFormat == 'I') {
        if(!e.data.match(/^-?\d+$/)){
          this.checkErr = true;
          //Mssg chưa có
          this.errorMessage = 'Vui lòng nhập số nguyên';
          this.changeDetec.detectChanges();
          return;
        }
      }else {
        this.checkErr = false;
      }
      if (field.dataFormat == 'D') {
        if(!e.data.match(/^-?\d+\.\d+$/)){
          this.checkErr = true;
          //Mssg chưa có
          this.errorMessage = 'Vui lòng nhập số thập phân';
          this.changeDetec.detectChanges();
          return;
        }
      }else {
        this.checkErr = false;
      }
    }
  }
  fileAdded(e) {}
  getfileCount(e) {}

  clickPerm(control) {}

  applyShare(e) {}

  onSave(){

  }
}
