import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CodxListviewComponent, CRUDService, DataRequest, DialogData, DialogRef, ImageViewerComponent, NotificationsService, Util } from 'codx-core';
import { WP_Groups } from 'projects/codx-share/src/lib/layout/drawers/chat/models/WP_Groups.model';
import { SignalRService } from 'projects/codx-share/src/lib/layout/drawers/chat/services/signalr.service';

@Component({
  selector: 'chat-popup-add',
  templateUrl: './popup-add-group.component.html',
  styleUrls: ['./popup-add-group.component.css']
})
export class AddGroupChatComponent implements OnInit,AfterViewInit {

  dialogData:any = null;
  dialogRef:any = null;
  gridViewSetUp:any = null;
  user:any = null;
  headerText:string = "";
  group:WP_Groups ;
  gridModel:DataRequest;
  strUserID:string = "";
  arrUsers:string[] = [];
  @ViewChild("codxImg") codxImg:ImageViewerComponent;
  @ViewChild("listview") listview:CodxListviewComponent;
  @ViewChild("listviewSelected") listviewSelected:CodxListviewComponent;
  constructor(
    private api:ApiHttpService,
    private notifiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth: AuthStore,
    private signalRSV: SignalRService,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef,
  )
  {
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    this.user = this.auth.get();
    this.group = new WP_Groups();
    this.gridModel = new DataRequest();
  }
  
  

  ngOnInit(): void {
    this.setData();
    
  }
  ngAfterViewInit(): void {
  }
  // set data
  setData(){
    if(this.dialogData)
    {
      this.headerText = this.dialogData.headerText;
      this.gridViewSetUp = this.dialogData.gridViewSetUp;
      this.gridModel.funcID = this.dialogRef.formModel.funcID;
    }
  }

  searchEvent(textSearch:any){
    this.listview.dataService.search(textSearch).subscribe();
  }
  // value change
  valueChange(event){
    if(event)
    {
      this.group.groupName = event.data;
      this.dt.detectChanges();
    }
  }

  // select member
  selectedChange(event){
    if(event?.data)
    {
      let itemSelected = event.data;
      let isExist = this.arrUsers.some(x => x == itemSelected.UserID);
      if(isExist) // đã tồn tại
      {
        this.removeMember(itemSelected);
      }
      else
      { 
        let member = {
          userID : itemSelected.UserID,
          userName: itemSelected.UserName
        }
        this.group.members.push(member);
        this.arrUsers.push(itemSelected.UserID);
        this.strUserID += itemSelected.UserID + ";";
        (this.listviewSelected.dataService as CRUDService) 
        .add(itemSelected)
        .subscribe((x) => {
          this.dt.detectChanges();
          var input = document.querySelector(`codx-input[data-id="${itemSelected.UserID}"] ejs-checkbox span.e-icons`);
          if (input) {
            input.classList.add('e-check');
          }
        });
      }
    }
  }
  
  // select remove
  selectedRemoveChange(event:any){
    if(event)
    {
      let itemSelected = event.data;
      this.removeMember(itemSelected);
    }
  }
  //remove member
  removeMember(data:any){
    if(data)
    {
      this.group.members = this.group.members.filter(x => x != data.UserID);
      this.arrUsers = this.arrUsers.filter(x => x != data.UserID);
      this.strUserID = this.arrUsers.toString();
      this.dt.detectChanges();
      (this.listviewSelected.dataService as CRUDService)
        .remove(data)
        .subscribe((x) => 
        {
          var input = document.querySelector(`codx-input[data-id="${data.UserID}"] ejs-checkbox span.e-icons`);
          if(input && input.classList.contains("e-check"))
          {
            input.classList.remove('e-check');
          } 
        });
    }
  }
  // insert group
  insertGroup(){
    debugger
    if(this.group){
      if(!Array.isArray(this.group.members)){
        this.notifiSV.notify("Vui lòng chọn thành viên");
        return;
      }
      this.group.groupID = Util.uid();
      this.group.groupType = "2";
      this.codxImg.updateFileDirectReload(this.group.groupID)
      .subscribe((res:any) => {
        if(res){
          this.api.execSv(
          "WP", 
          "ERM.Business.WP", 
          "GroupBusiness", 
          "InsertGroupAsync",[this.group])
          .subscribe((res:any) => {
            if(res){
              this.signalRSV.sendData("ActiveNewGroup",res);
              this.dialogRef.close(res);
              this.notifiSV.notify("Tạo nhóm chat thành công");

            }
            else{
              this.dialogRef.close(null);
              this.notifiSV.notify("Tạo nhóm chat không thành công");
            }
          });
        }
      });
    }
    
  }
}
