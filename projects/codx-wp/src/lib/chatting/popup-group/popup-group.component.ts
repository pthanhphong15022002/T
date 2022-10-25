import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Template } from '@syncfusion/ej2-angular-base';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CodxListviewComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ChatBoxInfo } from '../chat.models';

@Component({
  selector: 'lib-popup-group',
  templateUrl: './popup-group.component.html',
  styleUrls: ['./popup-group.component.scss'],
})
export class PopupGroupComponent implements OnInit {
  userSelected: any[] = [];
  data: ChatBoxInfo = new ChatBoxInfo();
  users: any = new Array();
  searchUser = '';
  public checkuserr: boolean = false;

  titlecreate = 'Tạo Nhóm Chát';
  namegroupmessage = 'Cần điền đầy đủ thông tin trước khi lưu';
  usersmessage = 'Số thành viên phải trên 2 người';
  create = 'Thêm';

  @ViewChild('imageGroup') imageGroup: ImageViewerComponent;
  @ViewChild('listview') listview: CodxListviewComponent;

  views: Array<ViewModel> = [];
  changeDetectorRef: any;
  currView?: TemplateRef<any>;
  dData: any = {};

  dialogRef: DialogRef = null;

  constructor(
    private api: ApiHttpService,
    private change: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData,
    private notificationsService: NotificationsService
  ) {
    this.dialogRef = dialogRef;
    this.loadData();
  }

  //private notificationsService: NotificationsService;
  ngAfterViewInit(): void {}

  ngOnInit(): void {}

  selectUser(user) {
    /* this.userSelected = user;
    this.change.detectChanges(); */
  }

  loadData() {
    let options = {
      page: 1,
      pageSize: 50,
      entityName: 'AD_Users',
      formName: 'Users',
      gridViewName: 'grvUsers',
      funcID: 'ADS05',
      pageLoading: true,
      searchText: this.searchUser,
    };
    // this.api.exec<any>(
    //     'ERM.Business.WP',
    //     'ChatBusiness',
    //     'MockSearchUsers', options).subscribe((res) => {
    //
    //         if (res)
    //         {
    //           this.users = res[0];
    //           this.users.map((e) =>
    //           {
    //             this.dData[e.userID] = e;
    //           })
    //         }
    //         this.change.detectChanges();
    //     });
    // this.api.execSv(
    //   "SYS",
    //   'ERM.Business.CM',
    //   'DataBusiness',
    //   'LoadDataCbxAsync',
    //    options).subscribe((res) => {
    //       if (res)
    //       {
    //         // this.users = res[0];
    //         // this.users.map((e) =>
    //         // {
    //         //   this.dData[e.userID] = e;
    //         // })
    //         console.log(res)
    //       }
    //       this.change.detectChanges();
    //   });
  }
  clickUser(data: any) {
    data.checked = !data.checked;
    /* if(this.checkuserr==false){
      this.checkuserr = true;
      this.userSelected.push(data);

    }else{
      this.checkuserr = false;
      this.userSelected = this.userSelected.filter(x=>x.userID != data.userID)

    } */
    debugger;
    if (data) {
      if (data.checked == true) {
        data.menberType = '2';
        this.userSelected.push(data);
      } else {
        // data.checked = !data.checked;
        // for(let datauser of this.userSelected){
        //   if(datauser.userID == data.userID)
        // }
        this.userSelected = this.userSelected.filter(
          (x) => x.UserID != data.UserID
        );
      }
    }

    this.change.detectChanges();
  }
  remoteuser(data: any) {
    //this.userSelected = this.userSelected.filter(x=>x.userID != data.userID);
    this.clickUser(data);
    //const checked = data.checked;
    //crrValue
  }
  clickCreateGroup() {
    this.data.members = this.userSelected;

    if (this.data.groupName == null) {
      //this.notificationsService.notify(this.namegroupmessage);
      return;
    }
    if (this.data.members.length <= 1) {
      //this.notificationsService.notify(this.usersmessage);
      return;
    }

    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'ChatBusiness',
        'AddGroupChatAsync',
        this.data
      )
      .subscribe((res: any) => {
        if (res) {
          let groupID = res.groupID;
          this.imageGroup.updateFileDirectReload(groupID).subscribe((res2) => {
            if (res2) {
              console.log(res2);
            }
          });
          // this.notificationsService.notifyCode("CHAT001");
          this.dialogRef.close(); //close form
        }
      });

    console.log(this.listview);
  }
  onClose() {
    this.dialogRef.close(); //close form
  }
  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**

    console.log('load');
  }
  onSearch(e) {
    this.listview.dataService.search(e).subscribe();
    // if(e) {
    //   if (this.lstView) this.lstView.dataService.search(e).subscribe();
    //   this.detectorRef.detectChanges();
    // }
  }
  valueChange(e) {
    this.data[e.field] = e.data;
  }
  onSelectionChanged(event: any) {}
}
