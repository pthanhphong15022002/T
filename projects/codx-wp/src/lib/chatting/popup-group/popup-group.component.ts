import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { Post } from '@shared/models/post';
import { Template } from '@syncfusion/ej2-angular-base';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthStore, CacheService, CodxListviewComponent, DialogData, DialogRef, ImageViewerComponent, NotificationsService, UrlUtil, Util, ViewModel, ViewType } from 'codx-core';
import { ChatBoxInfo } from '../chat.models';

@Component({
  selector: 'lib-popup-group',
  templateUrl: './popup-group.component.html',
  styleUrls: ['./popup-group.component.scss']
})
export class PopupGroupComponent implements OnInit {
  userSelected: any[] = [];
  data: ChatBoxInfo = new ChatBoxInfo();
  users: any = new Array();
  searchUser = "";
  public checkuserr: boolean = false;

  mssgNoti:string = "";


  @ViewChild("imageGroup") imageGroup: ImageViewerComponent;
  @ViewChild("listview") listview: CodxListviewComponent;

  
  @Output() evtNewGroup = new EventEmitter;//event truyền lại view chating


  views: Array<ViewModel> = [];
  changeDetectorRef: any;
  currView?: TemplateRef<any>;
  dData: any = {};

  dialogRef: DialogRef = null;
  dataRequest: any;
  groupId: any;
  senderId: any;
  senderName: any;
  Group: any;

  constructor(
    private api: ApiHttpService,
    private change: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData,
    private notificationsService: NotificationsService,
    private cacheSer: CacheService,
    private dt: ChangeDetectorRef,
  
    authStore: AuthStore,//
  ) {
    this.dialogRef = dialogRef;
    
    this.users = authStore.get();//boxchat
    this.loadData();
  }

  //private notificationsService: NotificationsService;
  ngAfterViewInit(): void {
    this.listview.dataService.requestEnd = (t, data) => {
      if (t == 'loaded') {
        data.forEach(x => {
          x['checked'] = false;
        })
        debugger;
        this.dataRequest = data;
      }
    }
  }

  ngOnInit(): void {
  }
  /* getMessageNoti(mssgCode:string){
    this.notificationsService.notifyCode("SYS009");
    this.cacheSer.message(mssgCode).subscribe((mssg:any) =>{
      debugger
      if(mssg && mssg?.defaultName){
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    })
  } */



  selectUser(user) {
    /* this.userSelected = user;
    this.change.detectChanges(); */
  }

  loadData() {
    let options = {
      page: 1,
      pageSize: 50,
      entityName: "AD_Users",
      formName: "Users",
      gridViewName: "grvUsers",
      funcID: "ADS05",
      pageLoading: true,
      searchText: this.searchUser
    };
    // this.api.exec<any>(
    //     'ERM.Business.WP',
    //     'ChatBusiness',
    //     'MockSearchUsers', options).subscribe((res) => {
    //         debugger;
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
    //lay lai list va xu ly
    if (this.dataRequest) {
      var index = this.listview.dataService?.data.findIndex((x) => x.UserID == data.UserID);//where data
      this.dataRequest[index]['checked'] = !data['checked'];//gan data
      if (this.dataRequest[index]['checked']) {//check data
        data.menberType = "2";
        this.userSelected.push(this.dataRequest[index]);
      } else {
        this.userSelected = this.userSelected.filter(x => x.UserID != this.dataRequest[index].UserID)
      }
    }
    /* if(this.checkuserr==false){
      this.checkuserr = true;
      this.userSelected.push(data);

    }else{
      this.checkuserr = false;
      this.userSelected = this.userSelected.filter(x=>x.userID != data.userID)

    } */
    this.change.detectChanges();
  }
  remoteuser(data: any) {
    //this.userSelected = this.userSelected.filter(x=>x.userID != data.userID);
    this.clickUser(data);
    //const checked = data.checked; 
    //crrValue
  }
  clickCreateGroup() {
    //debugger;
    this.data.members = this.userSelected;

    if (this.data.groupName == null) {
      //this.notificationsService.notify(this.namegroupmessage);
      
      this.cacheSer.message
      this.notificationsService.notifyCode("SYS009");
      this.dt.detectChanges();
    
      return;
    }
    if (this.data.members.length < 2) {
      debugger
      //this.notificationsService.notify(this.usersmessage);
      this.notificationsService.notifyCode("WP036");
      this.cacheSer.message("").subscribe((res)=>{
      })
    this.dt.detectChanges();
      return;
    }

    debugger;
    this.senderId = this.users.userID;//
    this.senderName = this.users.userName;//
    this.api.execSv("WP", "ERM.Business.WP", "ChatBusiness", "AddGroupChatAsync", this.data).subscribe((res: any) => {
      if (res) {
        debugger;
        this.Group = res ;
        this.groupId = res.groupID;
        

        this.imageGroup.updateFileDirectReload(this.groupId).subscribe((res2) => {
          if (res2) {
            console.log(res2)
          }
        });

        this.api.exec<Post>('ERM.Business.WP', 'ChatBusiness', 'SendMessageAsync', {
        groupId: this.groupId,
        message: ".",
        messageType: 1,
        senderId: this.senderId,
        senderName: this.senderName,
        refContent: null,
        refId: '00000000-0000-0000-0000-000000000000'
      })
      .subscribe(async (resp: any) => {
        
        if (!resp) {
          //Xử lý gửi tin nhắn không thành công
          return;
        }
        // debugger;
        // if (!this.groupId) {
        //   this.groupId = resp[1].groupID;
        //   this.groupType = resp[1].groupType;
        //   this.groupIdChange.emit(this.groupId);
        // }
        // if (this.groupType == '1') {
        //   this.chatService.sendMessage(resp[0], 'SendMessageToUser');
        // } else {subscribe(
        //   this.chatService.sendMessage(resp[0], 'SendMessageToGroup');
        // }

      });


      

        // this.notificationsService.notifyCode("CHAT001");
        // if(this.evtNewGroup){
        //   this.evtNewGroup.emit(res);
        // }
        debugger;
        this.dialogRef.close(res);//close form

      }
    });

    //send messager
    

    console.log(this.listview)
  }
  onClose() {
    this.dialogRef.close();
  }
  ngOnChanges() {
    console.log("load");
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
  onSelectionChanged(event: any) { }
}
