import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Optional, Output } from '@angular/core';
import { AlertConfirmInputConfig, AuthStore, DataRequest, DialogData, DialogRef, NotificationsService, UIComponent, ViewsComponent } from 'codx-core';
import { Permission, } from '@shared/models/file.model';
import { CodxOmService } from '../../codx-om.service';

@Component({
  selector: 'popup-add-role.component',
  templateUrl: './popup-add-role.component.html',
  styleUrls: ['./popup-add-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupAddRoleComponent  extends UIComponent  {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() eventShow = new EventEmitter<boolean>();
  codxView: any;
  dialog: any;
  titleDialog = 'Chia sẻ quyền';
  titleSave = 'Lưu';
  titleFunction = 'Chức năng';
  titleDescription = 'Mô tả';
  titleAllow = 'Cho phép';
  titleFullControl = 'Full control';
  titleRightDescription = 'Người dùng có tất cả quyền trên folder/file';
  titleCreateFolder = 'Tạo thư mục';
  titleAllowCreateFolder = 'Cho phép tạo thư mục';
  titleView = 'Xem';
  titleViewDescription = 'Cho phép xem chi tiết folder/file';
  titleUpdate = 'Sửa';
  titleUpdateDescription = 'Cho phép chỉnh sửa thông tin của folder/file';
  titleDelete = 'Xóa';
  titleDeleteDesc = 'Cho phép xóa folder/file';
  titleShare = 'Chia sẻ';
  titleShareDesc = 'Cho phép chia sẻ folder/file';
  titleAssign = 'Chia sẻ quyền';
  titleAssignDesc = 'Cho phép chia sẻ và chỉnh sửa quyền';
  titleUpload = 'Tải lên';
  titleUploadDesc = 'Cho phép upload file';
  titleDownload = 'Tải về';
  titleDownloadDesc = 'Cho phép download file';
  titleFromDate = 'Ngày hiệu lực';
  titleToDate = 'Ngày hết hạn';
  propertiesFolder = false;
  closeResult = '';
  id: string;
  listLevel: any;
  listType: any;
  listFormat1: any;
  listFormat2: any;
  listFormat3: any;
  listFormat4: any;
  commenttext: string;
  fullName: string;
  newfile: string;
  updateversion: boolean
  type: string;
  copy: boolean;
  userID: string;
  disableSubItem: boolean;
  selectId: string;
  disableSave = false;
  menuList: string;
  folderId: string;
  id_to: string; // id forder copy to
  selection = 0;
  listNodeMove: any;
  listNodeAdd: any;
  folderName = "folder";
  fileName = [];//"file";
  datafile: ArrayBuffer[];
  percent = '0%';
  listTag: any;
  breadcumb: string[];
  breadcumbLink = [];
  viewFolderOnly = false;
  modePermission = false;
  readRight = false;
  createRight = false;
  assignRight = true;
  updateRight = true;
  downloadRight = true;
  uploadRight = true;
  shareRight = true;
  deleteRight = true;
  errorshow = false;
  security = false;
  createSubFolder = false;
  message: string;
  noeditName: boolean;
  modeSharing: boolean;
  confirmAll: boolean;
  isSystem: boolean;
  comment: string;
  mytitle = 0;oldPlan: any;
  isAfterRender=true;
;
  intervalCount = 0;
  objectId = 'file';
  objectType = '';
  functionID = '';
  remote: boolean;
  objectName = '';
  arrType = [];
  arrName = [];
  cate = 'cate';
  user: any;
  isFileList = false;
  mode: string;
  currentPemission = 0;
  information: boolean;
  license: boolean;
  options = new DataRequest();
  dataVll = [];
  currentPermision: string;
  full: boolean = true;
  isSetFull = false;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  assign: boolean;
  icon: string;
  startDate: Date;
  endDate: Date;
  approval = false;
  revision = false;
  physical = false;
  copyrights: any;
  copyrightsControl: any;
  approvers: string;
  revisionNote: string;
  location: string;
  public loading = false;
  private onScrolling = true;
  dataSelcected: any = [];
  entityName = "";
  predicate = "";
  dataValue = "";
  viewMember = "";
  valueMember = "";
  service = "";
  objUser: any;
  parentIdField = "";
  permissonActiveId: string;
  floor: string;
  range: string;
  shelf: string;
  compartment: string;
  currentRate = 0;
  selected = 0;
  hovered = 0;
  readonly = false;
  isSharing: boolean;
  isDownload: boolean;
  requestRight = "1";
  modeShare: string;
  modeRequest: string;
  isShare: boolean;
  onRole = false;
  listPerm: Permission[];
  // permissions: Permission[];
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  bccPermission: Permission[];
  shareContent: string;
  requestContent: string;
  requestTitle: string;
  totalRating: number;
  totalViews: number;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  styleRating: string;
  historyFileName: string;
  historyID: string;
  sendEmail: boolean;
  postblog: boolean;
  historyFileNameExt: string;
  clipboard: any;
  titlemessage = 'Thông báo';
  copymessage = 'Bạn có muốn lưu lên không ?';
  renamemessage = 'Bạn có muốn lưu với tên {0} không ?';
  //objectType="";
  indexSub: number;
  subItemLevel: string;
  comboboxName = "";
  listLanguages: any;
  showAll: boolean;
  emailTemplate: string;
  component: {};
  remotePermission: Permission[];
  listRemoteFolder: any;
  indexEdit: any;
  addnewIndex: any;
  hasShare = false;
  path: string;
  //treeAdd: TreeviewComponent;
  item: any = {};
  objectUpdate = {};
  fieldUpdate = "";
  data: any;
  isNewFolder = false;
  ////
  okrPlan:any
  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.oldPlan= dialogData.data[0];
    this.user = this.authStore.get();
    this.dialog = dialogRef;
    this.startDate = null;
    this.endDate = null;
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  // ngAfterViewInit(): void {

  // }

  // onInit(): void {
    
  onInit(): void {
    this.changePermission(0);
    this.getData();
    //this.getRoleShare();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

  
  getData() {
    this.codxOmService.getOKRPlansByID(this.oldPlan?.recID).subscribe((res:any)=>{
      if(res){
        this.okrPlan=res;
        this.isAfterRender=true;
      }
    })
  }
  getRoleShare() {
    
  }
  onSaveRightChanged($event, ctrl) {
    var value = $event.data;
    switch (ctrl) {
      case 'checkFolder':
        this.createSubFolder = value;
        this.detectorRef.detectChanges();
        break;

      case 'checkSecurity':
        this.security = value;
        break;
      case "full":
        this.full = value;
        if (this.isSetFull) {
          this.create = value;
          // if (this.readRight)
          this.read = value;
          //   if (this.deleteRight)
          this.delete = value;
          //   if (this.updateRight)
          this.update = value;
          //   if (this.uploadRight)
          this.upload = value;
          //   if (this.shareRight)
          this.share = value;
          //  if (this.downloadRight)
          this.download = value;
          this.assign = value;
        }
        break;
      case "approval":
        this.approval = value;
        //    if (!this.approval)
        this.approvers = "";
        break;
      case "physical":
        this.physical = value;
        break;
      case "revision":
        this.revision = value;
        break;
      case "copyrightsControl":
        this.copyrightsControl = value;
        break;
      case "sentemail":
        this.sendEmail = value;
        break;
      case "postBlob":
        this.postblog = value;
        break;
      case "assign":
        this.assign = value;
        break;
      case "fromdate":
        if (value != null)
          this.startDate = value.fromDate;
        break;
      case "todate":
        if (value != null)
          this.endDate = value.fromDate;
        break;
      default:
        this.isSetFull = false;
        this[ctrl] = value;
        break;
    }

    if (ctrl != 'full' && ctrl != 'copyrightsControl' && ctrl != 'revision' && ctrl != 'physical' && ctrl != 'approval' && value == false)
      this.full = false;

    if (this.assign && this.create && this.read && this.delete && this.update && this.upload && this.share && this.download)
      this.full = true;

    this.detectorRef.detectChanges();
  }

  checkCurrentRightUpdate(owner = true) {

    
  }

  checkCurrentRightUpdate1() {
    
  }

  onSaveEditingFile() {
    

  }



  checkItemRight(i) {
   
  }

  changePermission(index) {    
  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
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
        };
      });
  }

  allowSetRight() {
    // this.fileEditing.assign
    //var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.assignRight;
    //var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.fileEditing.assign;
    
  }

  onSaveRight() {
    
  }

  

  addRoleToList(list: Permission[], item: Permission) {
    

    return list;
  }

  onSaveRole($event) {
    
  }

}
