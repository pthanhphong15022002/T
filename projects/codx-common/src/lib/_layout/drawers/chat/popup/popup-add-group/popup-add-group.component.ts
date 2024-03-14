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
  @ViewChild('codxListView1') codxListView1: CodxListviewComponent;
  @ViewChild('codxListView2') codxListView2: CodxListviewComponent;
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
    // this.codxListView1.onResize();
    // this.codxListView2.onResize();
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
    this.codxListView1.dataService.search(textSearch);
  }
  // value change
  valueChange(event) {
    if (event) {
      this.group.groupName = event.data;
      this.dt.detectChanges();
    }
  }

  // select member
  selectedChange(event) {
    if (event?.data) {
      let itemSelected = event.data;
      let isExist = this.arrUsers.some((x) => x == itemSelected.UserID);
      if (isExist) {
        // đã tồn tại
        this.removeMember(itemSelected);
      } else {
        let member = {
          userID: itemSelected.UserID,
          userName: itemSelected.UserName,
          tags:"",
          createdBy:this.user.userID,
          createdOn:new Date()
        };
        this.group.members.push(member);
        this.arrUsers.push(itemSelected.UserID);
        this.strUserID += itemSelected.UserID + ';';
        (this.codxListView2.dataService as CRUDService)
          .add(itemSelected)
          .subscribe((x) => {
            this.dt.detectChanges();
            var input = document.querySelector(
              `codx-input[data-id="${itemSelected.UserID}"] ejs-checkbox span.e-icons`
            );
            if (input) {
              input.classList.add('e-check');
            }
          });
      }
    }
  }

  // select remove
  selectedRemoveChange(event: any) {
    if (event) {
      let itemSelected = event.data;
      this.removeMember(itemSelected);
    }
  }
  //remove member
  removeMember(data: any) {
    if (data) {
      this.group.members = this.group.members.filter((x) => x != data.UserID);
      this.arrUsers = this.arrUsers.filter((x) => x != data.UserID);
      this.strUserID = this.arrUsers.join(";");
      (this.codxListView2.dataService as CRUDService)
        .remove(data)
        .subscribe((x) => {
          var input = document.querySelector(
            `codx-input[data-id="${data.UserID}"] ejs-checkbox span.e-icons`
          );
          if (input && input.classList.contains('e-check')) {
            input.classList.remove('e-check');
          }
        });
      this.dt.detectChanges();
    }
  }

  isLoading: boolean = false;
  // insert group
  insertGroup() {
    if(this.group && this.group?.members?.length > 0)
    {
      this.isLoading = true;
      this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'GroupBusiness',
        'SaveAsync',
        this.group)
        .subscribe((res1:any) => {
        if (res1) 
        {
          this.codxImg
          .updateFileDirectReload(res1.groupID)
          .subscribe((res2: any) => 
          {
            // this.signalRSV.sendData(CHAT.BE_FUNC.LoadGroup, res1.groupID);
            this.signalRSV.sendData("NewGroup", res1.groupID);
            this.notifiSV.notifyCode('CHAT004');
            this.dialogRef.close(res1);
          });
        } 
        else this.notifiSV.notifyCode('CHAT005');
      });
    }
    else this.notifiSV.notify('Vui lòng chọn thành viên');
  }
}
