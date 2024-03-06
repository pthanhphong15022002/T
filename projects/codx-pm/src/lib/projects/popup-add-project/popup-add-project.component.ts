import { ChangeDetectorRef, Component, Injector, Optional, ViewChild, ViewEncapsulation } from "@angular/core";
import { AuthService, AuthStore, CacheService, DialogData, DialogModel, DialogRef, FormModel, ImageViewerComponent, NotificationsService, UIComponent } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { DynamicSettingControlComponent } from "projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({
  selector: 'popup-add-project',
  templateUrl: './popup-add-project.component.html',
  styleUrls: ['./popup-add-project.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddProjectComponent extends UIComponent {

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('dynamic') dynamic: DynamicSettingControlComponent;

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
  paravalues:any;
  newSetting:any=[];
  oldDataValue:any;
  componentSub:any='';
  defaultSettings:any=[];
  grvSetup:any;
  enableEdit:boolean=true;
  initComplete:boolean=false;

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
    this.funcType = dialogData.data[1];
    this.grvSetup = dialogData.data[2]
    this.user=this.authStore.get();

    if(this.data.settings && this.data.settings.length){
      this.newSetting = JSON.parse(JSON.stringify(this.data.settings));
      this.paravalues = {};
      this.data.settings.map((x:any)=>{
        this.paravalues[x.fieldName] = x.fieldValue;
        return x;
      });
      this.paravalues = JSON.stringify(this.paravalues)
    }
    else{

      this.api.execSv("SYS",'ERM.Business.SYS','SettingsBusiness','GetSettingByFormAsync',['PMParameters','1']).subscribe((res:any)=>{
        if(res ){
          this.defaultSettings = res['1'];
          this.data.settings = this.defaultSettings;
          this.newSetting = JSON.parse(JSON.stringify(this.data.settings));
          //this.paravalues = this.data.settings.map((x:any)=>  x.fieldValue);
          this.paravalues = {};
          this.data.settings.map((x:any)=>{
            this.paravalues[x.fieldName] = x.fieldValue;
            return x;
          });
          this.paravalues = JSON.stringify(this.paravalues)
        }
      })
    }
  }

  override onInit(): void {
    this.initForm();
  }

  valueChange(e:any){
    this.data[e.field]=e.data;
  }

  valueDateChange(e:any){
    this.data[e.field]=e.data.fromDate;
  }

  valueSettingChange(e:any,data:any){
    let col = this.newSetting.find((x:any)=>x.fieldName==e.field);
    if(col){
      col.fieldValue=e.data;
    }
  }

  selectedMember:any;
  popover:any;
  showPopover(e:any,data:any){
    this.selectedMember = data;
    this.popover =e;
  }

  changeRole(item:any){
    let idx = this.listRoles.indexOf(item);
    if(idx >-1){
      if(this.selectedMember){
       let index= this.members.findIndex((x:any)=>x.objectID==this.selectedMember.objectID);
       if(index>-1){
        this.members[idx].roleType=item.value;
        this.members[idx].roleName=item.text;
        this.members[idx].icon=item.icon;

       }
       this.members = this.members.slice();
       this.changeDetectorRef.detectChanges();
       if(this.popover) this.popover.close();
      }
    }
  }

  initForm(){
    this.cache.valueList('PM003').subscribe((res) => {
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
          this.initComplete=true;
          let people = this.authService.userValue;
          let tmpResource :any={};
          tmpResource.objectID = people?.userID;
          tmpResource.objectName = people?.userName;
          tmpResource.status = '1';
          tmpResource.roleType = 'PM';
          tmpResource.optional = false;
          tmpResource.quantity = 1;
          tmpResource.objectType ='U';
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
          if(this.data && !this.data.projectManager) this.data.projectManager = this.user.userID;
          this.changeDetectorRef.detectChanges();
        } else if(this.funcType == 'edit') {
          this.members = this.data.permissions;
          if(!this.members || !this.members.length){
          this.members=[];
            let people = this.authService.userValue;
          let tmpResource :any={};
          tmpResource.objectID = people?.userID;
          tmpResource.objectName = people?.userName;
          tmpResource.status = '1';
          tmpResource.roleType = 'PM';
          tmpResource.optional = false;
          tmpResource.quantity = 1;
          tmpResource.objectType='U';
          this.listRoles.forEach((element) => {
            if (element.value == tmpResource?.roleType) {
              tmpResource.icon = element?.icon;
              tmpResource.roleName = element?.text;
            }
          });
          this.curUser = tmpResource;
          this.members.push(tmpResource);
          this.data.attendees =  this.members?.length;
          this.data.permissions =  this.members;
          this.attendeesNumber = this.data.attendees;
          if(this.data && !this.data.projectManager) this.data.projectManager = this.user.userID;

          }

          let lstUserID = this.members.map((x:any)=>{if(x.objectType=='U'){return x.objectID}}).join(';');
          this.getListUser(lstUserID);

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
   if(listUserID){
    this.valueUser(listUserID);

   }
  }
  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.members != null) {
        let user = this.members;
        let array = resourceID.split(';');
        let id = '';
        let arrayNew = [];
        user.forEach((e) => {
          id += e.objectID + ';';
        });
        if (id != '') {
          id = id.substring(0, id.length - 1);

          array.forEach((element) => {
            if (!id.split(';').includes(element)) arrayNew.push(element);
          });
        }
        if (arrayNew.length > 0) {
          resourceID = arrayNew.join(';');
          id += ';' + resourceID;
          this.getListUser(resourceID,true);
        }
      } else {
        this.getListUser(resourceID,true);
      }
    }
  }

  listUserID:any=[]
  getListUser(resource:any,isNew:boolean=false) {
    while (resource.includes(' ')) {
      resource = resource.replace(' ', '');
    }
    var arrUser = resource.split(';');
    this.listUserID = this.listUserID.concat(arrUser);
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource:any={};
            if(!isNew){
              if(this.members && this.members.length){
                let member = this.members.find((x:any)=>x.objectID==emp.userID);
                if(member){
                  member.positionName=emp?.positionName;
                  member.objectName=emp?.userName;
                  member.organizationName = emp?.organizationName;
                  this.listRoles.forEach((element) => {
                        if (element.value == member.roleType) {
                          member.icon = element.icon;
                          member.roleName = element.text;
                        }
                      });
                }
              }
            }
            else{
              if (emp.userID == this.user.userID) {
              tmpResource.objectID = emp?.userID;
              tmpResource.objectName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.organizationName = emp?.organizationName;
              tmpResource.objectType = 'U';
              tmpResource.roleType = 'PM';
              tmpResource.optional = false;
              this.listRoles.forEach((element) => {
                if (element.value == tmpResource.roleType) {
                  tmpResource.icon = element.icon;
                  tmpResource.roleName = element.text;
                }
              });
              let idx = this.members.findIndex((x:any)=>x.objectID==tmpResource.objectID)
              if(idx>-1){
                if(this.members[idx].recID){
                  tmpResource.recID = this.members[idx].recID;
                  tmpResource.id = this.members[idx].id;
                }
                this.members[idx]=tmpResource;
              }
              else
                this.members.push(tmpResource);
            } else {
              tmpResource.objectID = emp?.userID;
              tmpResource.objectName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.organizationName = emp?.organizationName;
              tmpResource.objectType = 'U';
              tmpResource.roleType = 'M';
              tmpResource.optional = false;
              this.listRoles.forEach((element) => {
                if (element.value == tmpResource.roleType) {
                  tmpResource.icon = element.icon;
                  tmpResource.roleName = element.text;
                }
              });
              let idx = this.members.findIndex((x:any)=>x.objectID==tmpResource.objectID)
              if(idx >-1){
                if(this.members[idx].recID){
                  tmpResource.recID = this.members[idx].recID;
                  tmpResource.id = this.members[idx].id;
                }
                this.members[idx]=tmpResource;
              }
              else
                this.members.push(tmpResource);
            }
            }

          }
          // this.members.forEach((item) => {
          //   if (item.userID != this.curUser?.userID) {
          //     this.members.push(item);
          //   }
          // });
          this.members = this.filterArray(this.members);
          this.data.permissions = this.members;
          // this.data.permissions.map((x:any)=>{
          //   let item = this.members.find((y:any)=>y.objectID==x.objectID);
          //   if(item) x.project
          // });
          this.members = this.members.slice();
          this.attendeesNumber = this.data.permissions.length;
          if(!this.initComplete) this.initComplete=true;
          this.detectorRef.detectChanges();
        }
      });
  }

  filterArray(arr) {
    return [...new Map(arr.map((item) => [item['objectID'], item])).values()];
  }

  saveForm(){

    let returnData:any;
    if(this.dynamic){
      this.newSetting.forEach((x:any)=>{
        x.fieldValue = this.dynamic.dataValue[x.fieldName];
      })
    }
    this.data.settings = this.newSetting;
    if(this.data.permissions){
      let pm = this.data.permissions.find((x:any)=>x.roleType=='PM' && x.objectType=='U');
      if(pm){
        this.data.projectManager = pm.objectID;
        this.data.projectManeger = pm.objectID;
      }
    }
    this.dialogRef.dataService.dataSelected = this.data;

    this.dialogRef.dataService
    .save()
    .subscribe((res) => {
      if (res?.save || res?.update) {
        if (!res.save) {
          returnData = res?.update;
        } else {
          returnData = res?.save;
        }
        if (!returnData?.error) {
          if (this.imageUpload?.imageUpload?.item) {
            returnData.taskStatus = this.data.taskStatus;
            this.imageUpload
              .updateFileDirectReload(returnData.data.recID)
              .subscribe((result) => {
                if (result) {
                  //xử lí nếu upload ảnh thất bại
                  //...
                  this.dialogRef && this.dialogRef.close(returnData.data);
                }
                else{

                  this.dialogRef && this.dialogRef.close(returnData.data);
                }
              });
          } else {
            this.dialogRef && this.dialogRef.close(returnData.data);
          }
        }
      } else {
        //Trả lỗi từ backend.
        return;
      }
    });


  }
  removeMember(item:any){
    if(item){
      this.members = this.members.filter((x:any)=>x.objectID!=item.objectID);
      this.data.permissions = this.members;
      this.changeDetectorRef.detectChanges();
    }

  }

  openSub(evt: any, data: any, dataValue: any) {

  }

  openPopup(evt: any, item: any, reference: string = '') {
    let value = item.fieldName;
    let recID = item.recID;
    if (!reference) reference = item.reference;
    let width = 0,
      height = 0,
      title = '',
      funcID = '',
      data = {},
      cssClass = '',
      dialogModel = new DialogModel();
    if (!reference) {
      let lineType = '1';
      let itemChild = this.data.settings.filter(
        (x) => x.refLineID === recID && x.lineType === lineType
      );
      data['newSetting'] = itemChild;
      data['lineType'] = lineType;
      data['itemSelect'] = item;
      data['tilte'] = item.tilte;
      //data['dataValue'] = this.paravalues;
      data['settingFull'] = {paras:this.data.settings, paraValues: this.paravalues};
      width = 500;
      height = 100 * itemChild.length;
      this.callfc.openForm(
        DynamicSettingControlComponent,
        title,
        width,
        height,
        funcID,
        data,
        cssClass,
        dialogModel
      );
    }
  }

  collapseItem(evt: any, setting: any) {

  }

}
