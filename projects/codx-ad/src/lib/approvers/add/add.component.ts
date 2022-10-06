import { GroupMembers, UserGroup } from '../../models/UserGroups.model';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { ApiHttpService, CallFuncService, CodxService, DialogData, DialogRef, FormModel, NotificationsService, RequestOption } from 'codx-core';

@Component({
  selector: 'lib-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddApproversComponent implements OnInit {
  //#region Constructor
  master: any;
  details: Array<any> = [];
  detailIDs: string;
  dialog: DialogRef;
  title: string = "";
  action: string = "add";
  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) {
    this.dialog = dialog;
    this.title = dialogData.data[0];
    this.action = dialogData.data[1];
    this.master = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
  }
  //#endregion

  //#region  Init
  ngOnInit(): void {
    if (this.master.members && this.master.members.length) {
      this.details = this.master.members;
      this.detailIDs = this.master.memberIDs;
    }
  }
  //#endregion

  //#region event
  eventApply(e) {
    if (!e.data || e.data.length == 0) return;
    if (!this.dialog.dataService.hasSaved && this.action == "add") {
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
    if (this.dialog.dataService.hasSaved) {
      this.dialog.dataService.hasSaved = false;
      if (this.details.length)
        this.dialog.dataService.update(this.master);
      this.dialog.close();
    }
    else {
      this.dialog.dataService.save((opt: RequestOption) => this.beforeSave(opt)).subscribe(res => {
        if (res && !res.error) {
          this.dialog.dataService.hasSaved = false;
          this.dialog.close();
        }
      })
    }
  }

  removeDetail(id) {
    if (!id) return null;
    this.api.execSv<any>("SYS", "AD", "GroupMembersBusiness", "DeleteAsync", [id]).subscribe(res => {
      if (res) {
        let idx = this.details.findIndex(x => x.recID == id);
        if (idx > -1) {
          this.details.splice(idx, 1);
          let ids = "";
          this.details.forEach((v) => {
            ids += v.memberID + "";
          })
          this.master['memberIDs'] = ids;
          this.master["members"] = this.details;
          this.dialog.dataService.update(this.master);
        }
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
    this.api.execSv<any>("SYS", "AD", "GroupMembersBusiness", "AddAsync", [groupMembers]).subscribe(res => {
      if (res && res.length == 3) {
        this.master["memberType"] = res[0];
        this.master['memberIDs'] = this.detailIDs + ';' + res[1];
        this.details = [...this.details, ...res[2]];
        this.master["members"] = this.details;
      }
    })
  }

  beforeSave(opt: RequestOption) {
    opt.service = "SYS";
    opt.assemblyName = "AD";
    opt.className = "UserGroupsBusiness";

    if (this.action == "add")
      opt.methodName = "AddAsync";
    else
      opt.methodName = "UpdateAsync";

    opt.data = this.master;
    return true;
  }
  //#endregion
}
