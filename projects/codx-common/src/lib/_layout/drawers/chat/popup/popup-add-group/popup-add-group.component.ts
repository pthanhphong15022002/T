import { group } from 'console';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  Util,
} from 'codx-core';
import { SignalRService } from '../../services/signalr.service';
import { GroupItem, WP_Groups } from '../../models/WP_Groups.model';
import { CHAT } from '../../models/chat-const.model';

@Component({
  selector: 'chat-popup-add',
  templateUrl: './popup-add-group.component.html',
  styleUrls: ['./popup-add-group.component.css'],
})
export class AddGroupChatComponent implements OnInit, AfterViewInit {
  dialogData: any = null;
  dialogRef: any = null;
  gridViewSetUp: any = null;
  user: any = null;
  headerText: string = '';
  group: GroupItem;
  gridModel: DataRequest;
  strUserID: string = '';
  arrUsers: string[] = [];
  @ViewChild('codxImg') codxImg: ImageViewerComponent;
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  constructor(
    private api: ApiHttpService,
    private notifiSV: NotificationsService,
    private dt: ChangeDetectorRef,
    private auth: AuthStore,
    private signalRSV: SignalRService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    this.user = this.auth.get();
    this.group = new GroupItem();
    this.gridModel = new DataRequest();
  }

  ngOnInit(): void {
    this.setData();
  }
  ngAfterViewInit(): void {
  }

  // set data
  setData() {
    if (this.dialogData) {
      this.headerText = this.dialogData.headerText;
      this.gridViewSetUp = this.dialogData.gridViewSetUp;
      this.gridModel.funcID = this.dialogRef.formModel.funcID;
    }
  }

  searchEvent(textSearch: any) {
    this.codxListView.dataService.search(textSearch);
  }

  valueChange(event) {
    if (event) 
    {
      this.group.groupName = event.data;
      this.dt.detectChanges();
    }
  }

  selectedChange(data:any) {
    if (data) 
    {
      let idx = this.group.members.findIndex(x => x.userID == data.UserID);
      if(idx >- 1)
      {
        this.removeMember(data.UserID);
      }
      else 
      {
        let member = {
          userID: data.UserID,
          userName: data.UserName,
          tags:"",
          createdBy:this.user.userID,
          createdOn:new Date()
        };
        this.group.members.push(member);
        var input = document.querySelector(`codx-input[data-id="${data.UserID}"] ejs-checkbox span.e-icons`);
        if(input) 
          input.classList.add('e-check');
        this.dt.detectChanges();
      }
    }
  }

  selectAll:boolean = false;
  checkBoxChange(event:any){
    this.selectAll = event.data;
    if(this.selectAll)
    {
      if(!this.group.members)
        this.group.members = [];
      this.codxListView
      .dataService.data
      .forEach(item => {
        let exist = this.group.members.some(x => x.userID == item.UserID);
        if(!exist)
        {
          let member = {
            userID: item.UserID,
            userName: item.UserName,
            positionName : item.PositionName,
            tags: "",
            createdBy: this.user.userID,
            createdOn: new Date()
          };
          this.group.members.push(member);
        }
      });
    }
    else
      this.group.members = [];
    this.dt.detectChanges();
  }

  
  
  removeMember(userID:string) {
    let idx = this.group.members.findIndex(x => x.userID == userID);
    if(idx > -1)
    {
      this.group.members.splice(idx,1);
      var input = document.querySelector(`codx-input[data-id="${userID}"] ejs-checkbox span.e-icons`);
      if(input && input.classList.contains('e-check')) 
        input.classList.remove('e-check');
      this.dt.detectChanges();
    }
  }

  isLoading: boolean = false;
  insertGroup() {
    if(this.group && this.group?.members?.length > 0)
    {
      this.isLoading = true;
      this.group.groupID = Util.uid();
      this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'GroupBusiness',
        'SaveAsync',
        this.group)
        .subscribe((res:any) => {
        if (res) 
        {
          this.codxImg
          .updateFileDirectReload(res.groupID)
          .subscribe((res2: any) => 
          {
            this.signalRSV.sendData(CHAT.BE_FUNC.AddGroupAsync, res.groupID);
            this.notifiSV.notifyCode('CHAT004');
            this.dialogRef.close(res);
          });
        } 
        else this.notifiSV.notifyCode('CHAT005');
      });
    }
    else this.notifiSV.notify('Vui lòng chọn thành viên');
  }
}
