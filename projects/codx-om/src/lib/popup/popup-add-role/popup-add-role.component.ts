import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  ViewsComponent,
} from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { CodxOmService } from '../../codx-om.service';

@Component({
  selector: 'popup-add-role.component',
  templateUrl: './popup-add-role.component.html',
  styleUrls: ['./popup-add-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupAddRoleComponent extends UIComponent {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() eventShow = new EventEmitter<boolean>();
  codxView: any;
  dialog: any;
  oldPlan: any;
  isAfterRender = false;
  intervalCount = 0;
  currentPermision: string;
  full: boolean = true;
  create: boolean;
  read: boolean;
  edit: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  assign: boolean;
  publish: boolean;
  icon: string;
  startDate: Date;
  endDate: Date;
  currentRate = 0;
  selected = 0;
  hovered = 0;
  titlemessage = 'Thông báo';
  copymessage = 'Bạn có muốn lưu lên không ?';
  renamemessage = 'Bạn có muốn lưu với tên {0} không ?';

  titleDialog = 'Phân quyền bộ mục tiêu';
  ////
  okrPlan: any;
  userID: any;
  user: import('codx-core').UserModel;
  selectedPermission: any;
  curPer=0;
  objectType: any;
  isSetFull =false;
  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.oldPlan = dialogData.data[0];
    this.user = this.authStore.get();
    this.dialog = dialogRef;
    this.startDate = null;
    this.endDate = null;
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  onInit(): void {
    this.getData();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getData() {
    this.codxOmService
      .getOKRPlansByID(this.oldPlan?.recID)
      .subscribe((res: any) => {
        if (res) {
          this.okrPlan = res;          
          this.changePermission(0);
          this.isAfterRender = true;
          this.detectorRef.detectChanges();
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.detectorRef.detectChanges();
  }
  changeRole($event, ctrl, index) {
    let value = $event.data;
    switch (ctrl) { 
      case 'full':
        if(this.isSetFull){
          this.okrPlan.permissions[index].full = value;
          this.okrPlan.permissions[index].create = value;
          this.okrPlan.permissions[index].read = value;
          this.okrPlan.permissions[index].edit = value;
          this.okrPlan.permissions[index].publish = value;
          this.okrPlan.permissions[index].assign = value;
          this.okrPlan.permissions[index].delete = value;
          this.okrPlan.permissions[index].share = value;
          this.okrPlan.permissions[index].upload = value;
        }
        break;     
      case 'fromdate':
        if (value != null)
          this.okrPlan.permissions[index].startDate = value.fromDate;
        break;
      case 'todate':
        if (value != null)
          this.okrPlan.permissions[index].endDate = value.fromDate;
        break;
      default:
        if(ctrl!='full'){
          this.isSetFull = false;
          this.okrPlan.permissions[index][ctrl] = value;   
          if(!value){
            this.okrPlan.permissions[index].full = false;
          }
          else if(
            this.okrPlan.permissions[index].create &&
            this.okrPlan.permissions[index].read &&
            this.okrPlan.permissions[index].edit &&
            this.okrPlan.permissions[index].publish &&
            this.okrPlan.permissions[index].assign &&
            this.okrPlan.permissions[index].delete &&
            this.okrPlan.permissions[index].share &&
            this.okrPlan.permissions[index].upload
          ){            
            this.okrPlan.permissions[index].full = true;
          }
        }
        break;
    }

    
    this.detectorRef.detectChanges();
  }


  changePermission(index) {
    if (this.okrPlan?.permissions == null ) {
      return;
    }
    if (this.okrPlan?.permissions[index] != null) {
      // this.full =
      //   this.okrPlan.permissions[index].create &&
      //   this.okrPlan.permissions[index].read &&
      //   this.okrPlan.permissions[index].edit &&
      //   this.okrPlan.permissions[index].publish &&
      //   this.okrPlan.permissions[index].assign &&
      //   this.okrPlan.permissions[index].delete &&
      //   this.okrPlan.permissions[index].share &&
      //   this.okrPlan.permissions[index].upload;

      // this.create = this.okrPlan.permissions[index].create;
      // this.read = this.okrPlan.permissions[index].read;
      // this.edit = this.okrPlan.permissions[index].edit;
      // this.publish = this.okrPlan.permissions[index].publish;
      // this.assign = this.okrPlan.permissions[index].assign;
      // this.delete = this.okrPlan.permissions[index].delete;
      // this.share = this.okrPlan.permissions[index].share;
      // this.upload = this.okrPlan.permissions[index].upload;
      this.selectedPermission=this.okrPlan.permissions[index];
      this.startDate = this.okrPlan.permissions[index].startDate;
      this.endDate = this.okrPlan.permissions[index].endDate;
      this.curPer= index;
    } else {
      // this.full = false;
      // this.create = false;
      // this.read = false;
      // this.edit = false;
      // this.publish = false;
      // this.assign = false;
      // this.delete = false;
      // this.share = false;
      // this.upload = false;
      // this.selectedPermission = index;
      // this.permissonActiveId = index;
    }
    this.detectorRef.detectChanges();
  }

  removeUserRight(index, list: Permission[] = null) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService
      .alert('Thông báo', 'Bạn có chắc chắn muốn xóa?', config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          this.detectorRef.detectChanges();
          this.okrPlan.permissions.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onSaveRole(evt: any) {
    if (evt?.data) {
      let data = evt?.data.filter(
        (element) =>
          !this.okrPlan.permissions.find((item) => item.objectID === element.id)
      );
      if (data != null && data?.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          let perm = { ...this.okrPlan.permissions[0] };
          perm.startDate = null;
          perm.endDate = null;
          perm.isActive = true;
          perm.objectName = item?.text != null ? item?.text : item?.objectName;
          perm.objectID = item?.id;
          perm.objectType = item?.objectType;
          perm.full = true;
          delete perm.recID;
          delete perm.id;
          this.okrPlan.permissions.push(perm);
        }
        this.changePermission(this.okrPlan.permissions?.length-1);
      } else {
        return;
      }
    }
  }
  onSaveForm() {
    if (
      this.okrPlan.permissions != null &&
      this.okrPlan.permissions.length > 0
    ) {
      this.codxOmService
        .shareOKRPlans(this.okrPlan.recID, this.okrPlan.permissions)
        .subscribe((item) => {
          if (item) {
            this.notificationsService.notifyCode('SYS034');
            this.dialog && this.dialog.close(this.okrPlan);
          } else return;
        });
    } else {
      this.notificationsService.notify(
        'Quyền bộ mục tiêu không được trống',
        '3'
      );
      return;
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
}
