import { GroupMembers, UserGroup } from '../../models/UserGroups.model';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddApproversComponent implements OnInit {
  //#region Constructor
  master: any;
  orgData: any;
  details: Array<any> = [];
  detailIDs: string;
  dialog: DialogRef;
  title: string = '';
  action: string = 'add';
  isInValid = true;

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.title = dialogData.data[0];
    this.action = dialogData.data[1];
    this.master = dialog.dataService!.dataSelected;
    this.orgData = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
  }
  //#endregion

  //#region ViewChild
  @ViewChild('form', { static: true }) form;
  //#endregion

  //#region  Init
  ngOnInit(): void {
    if (this.master.members && this.master.members.length) {
      this.details = this.master.members;
      this.detailIDs = this.master.memberIDs;
    }

    this.dialog.beforeClose.subscribe((res) => {
      if (!res.event && this.action == 'edit') {
        if (this.master.updateColumn) {
          let updateColumn = this.master.updateColumn.split(';');
          updateColumn.forEach((e) => {
            let key = this.codxService.capitalize(e);
            this.master[key] = this.orgData[key];
          });
        }
      }
      this.dialog.dataService.clear();
    });
  }

  ngAfterViewInit() {
    // if (this.form) {
    //   this.form?.formGroup?.statusChanges.subscribe((res) => {
    //     this.isInValid = res == 'INVALID';
    //     if (!this.isInValid) {
    //       this.changeDetectorRef.detectChanges();
    //     }
    //   });
    // }
  }
  //#endregion

  //#region event
  eventApply(e) {
    console.log('mems', e);

    if (!e.data || e.data.length == 0) return;
    if (!this.dialog.dataService.hasSaved && this.action == 'add') {
      this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0, '', '', false)
        .subscribe((res) => {
          if (res && !res.error) {
            this.master.groupID = this.dialog.dataService.dataSelected.groupID;
            this.dialog.dataService.hasSaved = true;
            this.saveMember(e.data);
          }
        });
    } else this.saveMember(e.data);
  }

  onSave() {
    if (this.dialog.dataService.hasSaved) {
      this.dialog.dataService.hasSaved = false;
      if (this.details.length)
        this.dialog.dataService.update(this.master).subscribe();
      this.dialog.close(true);
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0)
        .subscribe((res) => {
          if (res && !res.error) {
            this.master.groupID = this.dialog.dataService.dataSelected.groupID;
            this.dialog.dataService.hasSaved = false;
            this.dialog.close(true);
          }
        });
    }
  }

  removeDetail(id) {
    if (!id) return null;
    this.api
      .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'DeleteAsync', [id])
      .subscribe((res) => {
        if (res) {
          let idx = this.details.findIndex((x) => x.recID == id);
          if (idx > -1) {
            this.details.splice(idx, 1);
            let ids = '';
            this.details.forEach((v) => {
              ids += v.memberID + ';';
            });
            this.master['memberIDs'] = ids;
            this.master['members'] = this.details;
            this.dialog.dataService.update(this.master);
          }
        }
      });
  }
  //#endregion

  //#region Method
  saveMember(data: any) {
    let groupMembers = new Array<GroupMembers>();
    data?.dataSelected?.forEach((e) => {
      let member = new GroupMembers();
      member.groupID = this.master.groupID;
      member.memberID = e.id;
      member.memberType = 'U';
      member.memberName = e.text || e.objectName;
      member.positionName = e.positionName;
      member.orgUnitName = e.orgUnitName;
      groupMembers.push(member);
    });
    this.api
      .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'AddAsync', [
        groupMembers,
      ])
      .subscribe((res) => {
        if (res && res.length == 3) {
          this.master.memberType = res[0];
          this.master.memberIDs = this.detailIDs
            ? this.detailIDs + ';' + res[1]
            : res[1];
          this.details = [...this.details, ...res[2]];
          this.master.members = this.details;
          this.dialog.dataService.hasSaved = false;
          //  this.dialog.dataService.update(this.master).subscribe();
        }
      });
  }

  beforeSave(opt: RequestOption) {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';

    if (this.action == 'add') opt.methodName = 'AddAsync';
    else opt.methodName = 'UpdateAsync';

    opt.data = this.master;
    return true;
  }
  //#endregion

  //#region Test
  show() {
    console.log('form', this.form);
  }
  //#endregion

  popRoles() {}
}
