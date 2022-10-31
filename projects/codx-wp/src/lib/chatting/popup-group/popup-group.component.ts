import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { Template } from '@syncfusion/ej2-angular-base';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, CodxListviewComponent, DialogData, DialogRef, ImageViewerComponent, NotificationsService, ViewModel, ViewType } from 'codx-core';
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

  titlecreate = "Tạo Nhóm Chát";
  namegroupmessage = 'Cần điền đầy đủ thông tin trước khi lưu';
  usersmessage = 'Số thành viên phải trên 2 người';
  create = "Thêm";
  mssgNoti:string = "";


  @ViewChild("imageGroup") imageGroup: ImageViewerComponent;
  @ViewChild("listview") listview: CodxListviewComponent;


  views: Array<ViewModel> = [];
  changeDetectorRef: any;
  currView?: TemplateRef<any>;
  dData: any = {};

  dialogRef: DialogRef = null;
  dataRequest: any;



  constructor(
    private api: ApiHttpService,
    private change: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData,
    private notificationsService: NotificationsService,
    private cacheSer: CacheService,
    private dt: ChangeDetectorRef,
  ) {
    this.dialogRef = dialogRef;
    this.loadData();
  }

  //private notificationsService: NotificationsService;
  ngAfterViewInit(): void {
    this.listview.dataService.requestEnd = (t, data) => {
      if (t == 'loaded') {
        data.forEach(x => {
          x['checked'] = false;
        })
        this.dataRequest = data;
      }
    }
  }

  ngOnInit(): void {
  }
  getMessageNoti(mssgCode:string){
    this.cacheSer.message(mssgCode).subscribe((mssg:any) =>{
      debugger
      if(mssg && mssg?.defaultName){
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    })
  }



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
    this.data.members = this.userSelected;

    if (this.data.groupName == null) {
      //this.notificationsService.notify(this.namegroupmessage);
      debugger
    this.getMessageNoti("SYS009");
    this.dt.detectChanges();
    
      return;
    }
    if (this.data.members.length < 2) {
      debugger
      //this.notificationsService.notify(this.usersmessage);
      this.getMessageNoti("WP036");
    this.dt.detectChanges();
      return;
    }



    this.api.execSv("WP", "ERM.Business.WP", "ChatBusiness", "AddGroupChatAsync", this.data).subscribe((res: any) => {
      if (res) {
        let groupID = res.groupID;
        this.imageGroup.updateFileDirectReload(groupID).subscribe((res2) => {
          if (res2) {
            console.log(res2)
          }
        });
        // this.notificationsService.notifyCode("CHAT001");
        this.dialogRef.close();//close form

      }
    });


    console.log(this.listview)

  }
  onClose() {
    this.dialogRef.close();//close form

  }
  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**

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
