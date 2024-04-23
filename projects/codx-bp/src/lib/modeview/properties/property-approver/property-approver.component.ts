import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { DialogModel } from 'codx-core';

@Component({
  selector: 'lib-property-approver',
  templateUrl: './property-approver.component.html',
  styleUrls: ['./property-approver.component.css']
})
export class PropertyApproverComponent extends BasePropertyComponent{
  dropdown = false;
  popup = false;
  listCbx: any;
  nameCbb: any;
  listCombobox
  multiple = false;
  vllShare:any;
  roleType:any;

  sharePerm(share, roleType) {
    //BPApprovers;Nhân viên công ty;BPGroupUsers;Nhóm người dùng
    this.listCombobox = { U: 'BPApprovers', G: 'BPGroupUsers' };
    this.multiple = false;
    this.vllShare = 'BP028';
    this.roleType = roleType;
    let option = new DialogModel();
    option.zIndex = 1057;
    this.callFuc.openForm(share, '', 420, 600, null, null, null, option);
  }

  applyShare(e, roleType) {
    if(e.length == 1) this.data.refValue = e?.objectType;
    else if(e.length > 1)
    {
      let predicate = "";
      this.data.refValue = 'BPApprovers';

      e.forEach((elm,i)=>{
        if(i > 0) predicate += " || ";
        predicate += "GroupID=" + elm.id;
      })

      let dt = 
      {
        field: 'predicate',
        data: predicate
      }
      this.changeValueValidateControl(dt);
    }
    this.dataChange.emit(this.data);
  }
}
