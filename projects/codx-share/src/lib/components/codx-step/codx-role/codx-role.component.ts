import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, ViewChild, TemplateRef, SimpleChanges } from '@angular/core';
import { CacheService, CallFuncService, DialogRef, FormModel, NotificationsService, DialogModel } from 'codx-core';

@Component({
  selector: 'codx-role',
  templateUrl: './codx-role.component.html',
  styleUrls: ['./codx-role.component.scss']
})
export class CodxRoleComponent implements OnInit {
  @ViewChild('controlUserOne') controlUserOne: ComboBoxComponent;
  @Input() dataSource: any = [];
  @Input() multiple = false;
  @Input() listCombobox = {};
  @Input() vllShare = '';
  @Input() formModel: FormModel;
  @Input() default: string;
  @Input() fiedName: string;
  @Input() fiedNameTitle: string;
  @Input() title: string;
  @Input() icon: string;
  @Input() style = {};
  @Input() type = 'all';
  @Input() disabled = false;
  @Output() valueList = new EventEmitter();

  isPopupUserCbb = false;
  popup: DialogRef;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.dataSource);
    
  }
  
  shareUser(share) {
    if(this.type == 'user'){
      this.isPopupUserCbb = true;
      if(this.controlUserOne){
        let option = new DialogModel();
        option.zIndex = 1010;
        this.popup = this.callfc.openForm(this.controlUserOne, '', 500, 500,'',null,'', option);
        this.popup.close();
      }
    }else{
      this.popup = this.callfc.openForm(share, '', 500, 500);
    }
  }

  onDeleteOwner(objectID, datas) {
    let index = datas.findIndex((item) => item.objectID == objectID);
    if (index != -1){
      datas.splice(index, 1);
      this.valueList.emit(datas);
    } 
  }

  applyUser(event, datas) {
    let listUser = JSON.parse(JSON.stringify(datas));
    if (!event) return;
    let valueUser = [];
    this.popup.close();
    if(this.type == 'user'){
      // this.isPopupUserCbb = false;
      valueUser = event.dataSelected;
    }else{
      this.popup.close();
      valueUser = event;
    }
    if(this.multiple){
      valueUser?.forEach(element => {
        let user = this.convertUser(element,this.type)
        if(!listUser?.some(item => item.objectID == user.objectID)){
          listUser.push(user)
        }
      });
    }else{
      let userInfo = valueUser[0];
      let user = this.convertUser(userInfo,this.type)
      listUser[0] = user;
    }
    this.valueList.emit(listUser);
  }

  convertUser(user, type){
    let userConert = {
      objectID: type == 'user' ? user.UserID : user.id,
      objectName: type == 'user' ? user.UserName: user.text,
      objectType: type == 'user' ? 'U' : user.objectType ,
      roleType: type == 'user' ? user.PositionName : user.objectName,
    }
    return userConert;
  }

}
