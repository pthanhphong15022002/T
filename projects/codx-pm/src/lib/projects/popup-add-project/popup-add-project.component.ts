import { ChangeDetectorRef, Component, Injector, Optional } from "@angular/core";
import { AuthService, AuthStore, CacheService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxBookingService } from "projects/codx-share/src/lib/components/codx-booking/codx-booking.service";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({
  selector: 'popup-add-project',
  templateUrl: './popup-add-project.component.html',
  styleUrls: ['./popup-add-project.component.scss'],
})
export class PopupAddProjectComponent extends UIComponent {
  data: any;
  funcType: any;
  tmpTitle: any;
  optionalData: any;
  dialogRef: DialogRef;
  formModel: FormModel;
  user: any;
  attendeesNumber = 0;
  startTime: string;
  endTime: string;
  listUM = [];
  listFilePermission: any[];
  title:string = "Thêm";
  imgRecID:any;
  viewOnly:boolean=false;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin dự án',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Thành viên dự án',
      name: 'tabMembers',
    },
    {
      icon: 'icon-settings',
      text: 'Thiết lập dự án',
      name: 'tabSettings',
    }

  ];
  members:any=[];
  listRoles:any=[];
  curUser:any;
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = dialogData.data[0];
  }

  override onInit(): void {

  }

  valueChange(e:any){

  }

  valueDateChange(e:any){

  }

  showPopover(e:any,dat:any){

  }

  initForm(){
    this.cache.valueList('EP009').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          if (item.value != '4') {
            this.listRoles.push(item);
          }
        });
        //thêm người đặt(người dùng hiên tại) khi thêm mới
        if (this.funcType == 'add' || this.funcType == 'copy') {
          let people = this.authService.userValue;
          let tmpResource :any={};
          tmpResource.userID = people?.userID;
          tmpResource.userName = people?.userName;
          tmpResource.status = '1';
          tmpResource.roleType = '1';
          tmpResource.optional = false;
          tmpResource.quantity = 1;
          this.listRoles.forEach((element) => {
            if (element.value == tmpResource?.roleType) {
              tmpResource.icon = element?.icon;
              tmpResource.roleName = element?.text;
            }
          });
          this.curUser = tmpResource;
          this.members.push(tmpResource);
          this.data.attendees =  this.members?.length;
          this.attendeesNumber = this.data.attendees;
          this.changeDetectorRef.detectChanges();
        } else {

        }
      }
    });
  }

  shareInputChange(e) {
    let assignTo = '';
    let listUserIDByOrg = '';
    let listDepartmentID = '';
    let listUserID = '';
    let listPositionID = '';
    let listEmployeeID = '';
    let listGroupMembersID = '';
    let type = 'U';
    if (e == null) return;
    e?.data?.forEach((obj) => {
      if (obj.objectType && obj.id) {
        type = obj.objectType;
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
          case 'RP':
          case 'P':
            listPositionID += obj.id + ';';
            break;
          case 'RE':
            listEmployeeID += obj.id + ';';
            break;
          case 'UG':
            listGroupMembersID += obj.id + ';';
            break;
        }
      }
    });
   debugger
  }


}
