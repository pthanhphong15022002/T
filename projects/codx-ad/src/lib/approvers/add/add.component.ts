import {
  Component,
  Optional,
  ChangeDetectorRef,
  ViewChild,
  Injector,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';

@Component({
  selector: 'lib-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
})
export class AddApproversComponent extends UIComponent {
  //#region Constructor
  master: any;
  orgData: any;
  members: Array<any> = [];
  detailIDs: string;
  dialog: DialogRef;
  title: string = '';
  action: string = 'add';
  isInValid = true;
  isTemp = true;
  // lstChangeFunc: tmpTNMD[] = [];
  // lstRoles: tmpformChooseRole[] = [];
  //#region Roles
  dialogRoles: DialogRef;
  //#endregion
  date = new Date();
  showPopup: boolean = false;

  //#region RoleType
  grv;
  lstRoleTypes = [];
  curSelectMemberID;
  popover;
  //#endregion

  constructor(
    private inject: Injector,
    // private api: ApiHttpService,
    private notiService: NotificationsService,
    // private codxService: CodxService,
    private adService: CodxAdService,
    // private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.title = dialogData.data[0];
    this.action = dialogData.data[1];
    this.isTemp = this.action == 'add';
    this.master = dialog.dataService!.dataSelected;
    this.orgData = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
  }
  //#endregion

  //#region ViewChild
  @ViewChild('form', { static: true }) form;
  @ViewChild('imageUpload') imageUpload?: ImageViewerComponent;

  //#endregion

  //#region  Init
  onInit(): void {
    if (this.master.members && this.master.members.length) {
      this.master?.members?.forEach((mem) => {
        mem.userID = mem.memberID;
        mem.isAdded = true;
        mem.isRemoved = false;
      });
      this.members = this.master?.members;

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

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((data) => {
        if (data) {
          this.grv = data;
          if (this.grv.RoleType?.referedValue != '') {
            this.cache
              .valueList(this.grv.RoleType?.referedValue)
              .subscribe((vll) => {
                this.lstRoleTypes = vll?.datas;
                console.log('lstRoleTypes', this.lstRoleTypes);
              });
          }
        }
      });
  }

  ngAfterViewInit() {
    console.log('formmodel', this.form);
  }
  //#endregion

  //#region event
  width = 720;
  height = window.innerHeight;
  eventApply(e) {
    this.showPopup = !this.showPopup;
    if (!e.dataSelected || e.dataSelected.length == 0) return;
    else {
      e?.dataSelected.forEach((user) => {
        //chua add
        if (this.members.findIndex((x) => x.memberID == user.UserID) == -1) {
          user.isAdded = false;
          user.isRemoved = false;
          user.memberID = user.UserID;
          user.userID = user.UserID;
          user.memberName = user.UserName;
          user.positionName = user.PositionName;
          user.orgUnitName = user.OrgUnitName;
          this.members.push(user);
        }
      });
    }
  }

  onSave() {
    if (this.form.formGroup.status == 'INVALID') {
      return;
    }
    if (this.dialog.dataService.hasSaved) {
      this.dialog.dataService.hasSaved = false;
      if (this.members.length)
        this.dialog.dataService.update(this.master).subscribe();
      this.dialog.close(true);
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0)
        .subscribe((res: any) => {
          if (res && !res.error) {
            this.master.groupID = this.dialog.dataService.dataSelected.groupID;
            if (this.members.length > 0) {
              this.beforeSaveMember();
            } else {
              this.dialog.dataService.hasSaved = true;

              this.dialog.close(this.master);
            }
          }
        });
    }
  }

  removeDetail(item) {
    if (!item) return;
    if (item.isAdded == false) {
      this.members = this.members.filter((mem) => mem.userID != item.userID);
    } else {
      let curMem = this.members.find((mem) => mem.userID == item.userID);
      curMem.isRemoved = true;
    }
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  saveMember(groupType) {
    this.api
      .execSv<any>('SYS', 'AD', 'GroupMembersBusiness', 'AddUpdateAsync', [
        this.members,
        groupType,
        [],
        [],
      ])
      .subscribe((res) => {
        if (res) {
          // this.dialog.dataService.hasSaved = true;
          this.dialog.dataService.hasSaved = true;
          this.master.members = res[2];
          this.master.memberIDs = res[1];
          // this.dialog.dataService.update(this.master).subscribe((res2) => {
          this.dialog.close(this.master);
          this.imageUpload
            .updateFileDirectReload(this.master.recID)
            .subscribe((result) => {
              if (result) {
                console.log('res', result);
              }
            });
        } else {
          this.dialog.dataService.hasSaved = true;
        }
      });
  }

  beforeSaveMember() {
    let groupType = this.form?.formGroup?.get('groupType')?.value;
    this.members?.forEach((mem) => {
      mem.groupID = this.master.groupID;
    });
    this.saveMember(groupType);
  }

  beforeSave(opt: RequestOption) {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';

    if (this.action == 'add') opt.methodName = 'AddAsync';
    else opt.methodName = 'UpdateAsync';

    opt.data = this.master;
    return true;
    // }
  }
  //#endregion

  clickAddMemeber() {
    this.showPopup = !this.showPopup;
    this.changeDetectorRef.detectChanges();
  }

  selectMember(p, memberID) {
    p.open();
    this.popover = p;
    this.curSelectMemberID = memberID;
    console.log('selectMember', p, memberID);
  }

  selectRoleType(memberID, roleType) {
    let curMember = this.members.find((member) => member.memberID == memberID);
    curMember.roleType = roleType.value;
    console.log('member', curMember);

    this.popover.close();
  }

  getIcon(memRole) {
    return this.lstRoleTypes.find((roleType) => roleType.value == memRole).icon;
  }
}
