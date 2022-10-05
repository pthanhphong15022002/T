import { GroupMembers, UserGroup } from '../../models/UserGroups.model';
import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, CodxService, DialogRef, FormModel, NotificationsService, RequestOption } from 'codx-core';

@Component({
  selector: 'lib-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddApproversComponent implements OnInit {
  //#region Constructor
  master: any;
  details: Array<any> = [];
  dialog: DialogRef;
  title: string = "";
  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.master = dialog.dataService!.dataSelected;
  }
  //#endregion

  //#region  Init
  ngOnInit(): void {
  }
  //#endregion

  //#region event
  eventApply(e) {
    if (!this.dialog.dataService.hasSaved) {
      this.dialog.dataService.save((opt: RequestOption) => this.beforeSave(opt)).subscribe(res => {
        if (res && !res.error) {
          this.dialog.dataService.hasSaved = true;
          this.saveMember(e.data);
        }
      })
    } else
      this.saveMember(e.data);
  }


  onSave() {
    this.dialog.dataService.save((opt: RequestOption) => this.beforeSave(opt)).subcribe(res => {
      if (res && !res.error) {
        this.dialog.dataService.hasSaved = false;
        this.dialog.close();
      }
    })
  }
  //#endregion

  //#region Method
  saveMember(data: Array<any>) {
    let groupMembers = new Array<GroupMembers>();
    data.forEach(e => {
      let member = new GroupMembers();
      member.groupID = this.master.groupID;
      member.memberID = e.id;
      member.memberType = e.objectType;
      member.memberName = e.text
      groupMembers.push(member);
    });
    this.api.execSv<any>("SYS", "AD", "GroupMembersBusiness", "AddAsync", groupMembers).subscribe(res => {

    })
  }

  beforeSave(opt: RequestOption) {
    opt.service = "SYS";
    opt.assemblyName = "AD";
    opt.className = "UserGroupsBusiness";
    opt.methodName = "AddAsync";
    opt.data = this.dialog.dataService.dataSelected;
    return true;
  }
  //#endregion
}
