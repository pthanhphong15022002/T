import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Template } from '@syncfusion/ej2-angular-base';
import { ApiHttpService, NotificationsService, ViewModel, ViewType } from 'codx-core';
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


  views: Array<ViewModel> = [];
  changeDetectorRef: any;
  currView?: TemplateRef<any>;
  dData:any = {};



  constructor(private api: ApiHttpService,
      private change: ChangeDetectorRef) {
      this.loadData();
  }
  
  private notificationsService: NotificationsService;
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
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
      this.api.exec<any>(
          'ERM.Business.WP',
          'ChatBusiness',
          'MockSearchUsers', options).subscribe((res) => {
              if (res) 
              {
                this.users = res[0];
                this.users.map((e) =>
                {
                  this.dData[e.userID] = e;
                })
              }
              this.change.detectChanges();
          });
  }
  clickUser(data:any){
    data.checked = !data.checked;
    /* if(this.checkuserr==false){
      this.checkuserr = true;
      this.userSelected.push(data);

    }else{
      this.checkuserr = false;
      this.userSelected = this.userSelected.filter(x=>x.userID != data.userID)

    } */
    if(data){
      
      if(data.checked == true){
        data.menberType = "2";
        this.userSelected.push(data);
      }else
      {
        // data.checked = !data.checked;
        // for(let datauser of this.userSelected){
        //   if(datauser.userID == data.userID) 
        // }
        this.userSelected = this.userSelected.filter(x=>x.userID != data.userID)
      }
    }
    
    this.change.detectChanges();
  }
  remoteuser(data:any){
    //this.userSelected = this.userSelected.filter(x=>x.userID != data.userID);
    this.clickUser(data);
    const checked = data.checked; 
    //crrValue
  }
  clickCreateGroup(){
    
    this.data.members = this.userSelected;
    this.api.execSv("WP","ERM.Business.WP","ChatBusiness","AddGroupChatAsync",this.data).subscribe((res:boolean) => {
      if(res){
        this.notificationsService.notifyCode("CHAT001");

      }
    });

  }
  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**
  
     console.log("load");
    }   
  onSearch(e) {
    // if(e) {
    //   if (this.lstView) this.lstView.dataService.search(e).subscribe();
    //   this.detectorRef.detectChanges();
    // }
  }
  valueChange(e){
    this.data[e.field] = e.data;
  }
}
