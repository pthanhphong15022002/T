import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { AD_AlertRules } from '../models/AD_AlertRules.model';

@Component({
  selector: 'lib-popup-add-notify',
  templateUrl: './popup-add-notify.component.html',
  styleUrls: ['./popup-add-notify.component.css']
})
export class PopupAddNotifyComponent implements OnInit {
  dialog: DialogRef;
  funcID:string = "";
  form:FormGroup;
  sendTo:any[] = [];
  constructor(
    private api:ApiHttpService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    private notifySV:NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData
  ) 
  {
    this.dialog = dialog;
    this.funcID = dd.data;
  }


  ngOnInit(): void {
    this.initForm();
  }
  initForm(){
    this.form = new FormGroup({
      Description: new FormControl(""),
      BaseOn: new FormControl("0"),
      EventType: new FormControl(false),
      SendToObject: new FormControl(null),
      IsAlert: new FormControl(false),
      IsMail: new FormControl(false),
      IsSMS: new FormControl(false)
    })
  }

  valueChange(event:any){
    let field = event.field;
    switch(field){
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
      case 'Description':
        this.form.patchValue({'Description' : event.data})
        break;
      case 'IsAlert':
        this.form.patchValue({'IsAlert' : event.data})
        break;
      case 'IsMail':
        this.form.patchValue({'IsMail' : event.data})
        break;
      case 'IsSMS':
        this.form.patchValue({'IsSMS' : event.data})
      break;
      default:
        break;
    };
    this.dt.detectChanges();
  }

  submit(){
    let data = new AD_AlertRules();
    data = this.form.value;
    this.api.exec("ERM.Business.AD","AlertRulesBusiness","InsertAsync",[this.funcID,data])
    .subscribe((res:any) => {
      if(res){
        this.notifySV.notifyCode("SYS006");
        this.dialog.close();
      }
    })
  }

  width = 500;
  height = window.innerHeight;
  isShowCbbSendto = false;
  clickShowCBBSento(){
    this.isShowCbbSendto = !this.isShowCbbSendto;
  }

  openFormShare(content: any) {
    this.callFC.openForm(content, '', 450, window.innerHeight);
  }

  SHARECONTROLS = {
    CREATEDBY: "0",
    OWNER: "1",
    CREATEDGROUP: "2",
    CREATEDTEAM: "3",
    CREATEDDEPARMENTS: "4",
    CREATEDDIVISION: "5",
    CREATEDCOMPANY: "6",
    OGRHIERACHY: "O",
    DEPARMENTS: "D",
    POSITIONS: "P",
    ROLES: "R",
    GROUPS: "G",
    USER: "U",
  }
  eventApply(event: any) {
    if (!event) {
      return;
    }
    this.sendTo = [];
    let data = event[0];
    switch (data.objectType) {
      case this.SHARECONTROLS.OWNER:
        this.form.patchValue({"SendToObject": "0"});
        break;
      case this.SHARECONTROLS.CREATEDGROUP:
        this.form.patchValue({"SendToObject": "1"});
        break;
      case this.SHARECONTROLS.CREATEDTEAM:
        this.form.patchValue({"SendToObject": "2"});
        break;
      case this.SHARECONTROLS.CREATEDDEPARMENTS:
        this.form.patchValue({"SendToObject": "3"});
        break;
      case this.SHARECONTROLS.CREATEDDIVISION:
        this.form.patchValue({"SendToObject": "4"});
        break;
      case this.SHARECONTROLS.CREATEDCOMPANY:
        this.form.patchValue({"SendToObject": "5"});
        break;
        break;
      case this.SHARECONTROLS.OGRHIERACHY:
        this.form.patchValue({"SendToObject": "6"});
        break;
      case this.SHARECONTROLS.DEPARMENTS:
        this.form.patchValue({"SendToObject": "D"});
        break;
      case this.SHARECONTROLS.POSITIONS:
        this.form.patchValue({"SendToObject": "P"});
        break;
      case this.SHARECONTROLS.ROLES:
        this.form.patchValue({"SendToObject": "R"});
        break;
      case this.SHARECONTROLS.GROUPS:
        this.form.patchValue({"SendToObject": "G"});
        break;
      default:
        this.form.patchValue({"SendToObject": data.id});
        this.sendTo = [];
        data.dataSelected.forEach((e:any) =>{
          let u = {
            objectID: e.UserID,
            objectName: e.UserName
          };
          this.sendTo.push(u);
        })
        break;
    }
    this.dt.detectChanges();
  }
  saveAddUser(event:any){
    this.form.patchValue({"SendToObject": event.id});
    event.dataSelected.forEach((e:any) => {
      let user = {
        objectID: e.UserID,
        objectName: e.UserName
      };
      this.sendTo.push(user);
    });
    this.dt.detectChanges();
  }

  removeUser(item:any){
    this.sendTo = this.sendTo.filter((e:any) =>  e.objectID != item.objectID  );
    this.form.patchValue({"SendToObject":this.sendTo.map((e:any) => e.objectID)});
    this.dt.detectChanges();
  }

}
