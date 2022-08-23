import { Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-notify',
  templateUrl: './popup-add-notify.component.html',
  styleUrls: ['./popup-add-notify.component.css']
})
export class PopupAddNotifyComponent implements OnInit {
  dialog: any;
  form:FormGroup;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) 
  {
    this.dialog = dialog;
  }


  ngOnInit(): void {
    this.initForm();
  }
  initForm(){
    this.form = new FormGroup({
      Description: new FormControl(""),
      BaseOn: new FormControl("0"),
      EventType: new FormControl("0"),
      SendTo: new FormControl(""),
      IsAlert: new FormControl(),
      IsMail: new FormControl(),
      IsSMS: new FormControl()
    })
  }

  valueChange(event:any){
    switch(event.field){
      case 'BaseOn':
        switch(event.component.label){
          case 'Tất cả dữ liệu':
            this.form.patchValue({'BaseOn' : "0" })
            break;
          case 'Dòng hiện hành':
            this.form.patchValue({'BaseOn' : "1" })
            break;
          case 'Những dòng thỏa điều kiện':
            this.form.patchValue({'BaseOn' : "2" })
            break;
          default:
            this.form.patchValue({'BaseOn' : "0" })
            break;
        }
        break;
      case 'EventType':
        switch(event.component.label){
          case 'Tạo mới':
            this.form.patchValue({'EventType' : "0" })
            break;
          case 'Dòng bị xóa':
            this.form.patchValue({'EventType' : "1" })
            break;
          case 'Giá trị trên trường thay đổi':
            this.form.patchValue({'EventType' : "2" })
            break;
          case 'Giá trị trên trường thay đổi thành"':
            this.form.patchValue({'EventType' : "3" })
            break;
          default:
            this.form.patchValue({'EventType' : "0" })
            break;
        }
        break;
      case 'SendTo':
        this.form.patchValue({'SendTo' : event.data })
        break;
      default:
        break;
    }
    console.log(event);
  }

  submit(){
    console.log(this.form)
  }

}
