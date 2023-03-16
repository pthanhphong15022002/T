import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, HostBinding, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { CodxService, CallFuncService, ApiHttpService, DataService, FormModel, AuthStore, CacheService, NotificationsService, DialogModel, CodxListviewComponent, CRUDService } from 'codx-core';
import { group } from '@angular/animations';
import { PopupAddGroupComponent } from '../chat-list/popup/popup-add-group/popup-add-group.component';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

@Component({
  selector: 'codx-chat',
  templateUrl: './codx-chat.component.html',
  styleUrls: ['./codx-chat.component.css']
})
export class CodxChatComponent implements OnInit,AfterViewInit {
  @HostBinding('class') get class() {
    return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }
  loaded = false;
  totalMessage:number = 0;
  formModel:FormModel = null;
  user:any = null;
  funcID: string = 'WPT11';
  function: any = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  autoClose=true;
  lstBoxChat:any[] = [];
  @ViewChild("boxChat") boxChat:TemplateRef<any>;

  @ViewChild('listChat') listChat: ChatListComponent;
  constructor(
    private injector:Injector,
    public codxService:CodxService,
    private api:ApiHttpService,
    private signalRSV:SignalRService,
    private applicationRef:ApplicationRef,
    private callFCSV: CallFuncService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private dt: ChangeDetectorRef,
    private auth: AuthStore,
  ) 
  { 
    this.user = this.auth.get();
    this.formModel = new FormModel();
  }
  

  
  ngOnInit(): void {
    // get function - gridViewsetup
    if (this.funcID) {
      this.cache.functionList(this.funcID).subscribe((func: any) => {
        if (func) {
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
                this.dt.detectChanges();
              }
            });
          this.cache
            .moreFunction(func.formName, func.gridViewName)
            .subscribe((mFC: any) => {
              if (mFC) {
                this.moreFC = JSON.parse(JSON.stringify(mFC));
              }
            });
        }
      });
    }
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    // active new group - add box chat to all connection
    this.signalRSV.activeNewGroup.subscribe((res:any) => {
      if(res){
        this.addBoxChat(res.groupID);
      }
    });
    // active group - add box chat to connection
    this.signalRSV.activeGroup.subscribe((res:any) => {
      if(res)
      {
        let boxChat = this.checkBoxChat(res.groupID);
        if(!boxChat){
          this.getTotalMessage();
          this.addBoxChat(res.groupID);
        }
      }
    });
    //receiver message to connection
    this.signalRSV.reciverChat.subscribe((res:any) => {
      if(res.groupID){
        let isOpenBoxChat = this.checkBoxChat(res.groupID);
        if(!isOpenBoxChat){
          this.addBoxChat(res.groupID);
        }
      }
    });
  }
  // get total message
  getTotalMessage(){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "GetTotalMessageAsync")
      .subscribe((res:any) => {
        this.totalMessage = res;
      });
  }
  // open chat box
  openChatList(){
    if(!this.loaded)
      this.loaded = true;
  }
  // check box chat
  checkBoxChat(groupID:string):boolean {
    let _eleboxChats = document.getElementsByTagName("codx-chat-box");
    let _arrBoxChat = Array.from(_eleboxChats);
    if(Array.isArray(_arrBoxChat)){
      return _arrBoxChat.some(e => e.id === groupID);
    }
    return false;
  }
  // add box chat
  addBoxChat(groupID:any){
    let viewRef = this.boxChat.createEmbeddedView({ $implicit: groupID });
    this.applicationRef.attachView(viewRef);
    viewRef.detectChanges();
    let html = viewRef.rootNodes[0];
    let elementContainer = document.querySelector(".container-chat");
    if(elementContainer){
      let length = elementContainer.children.length;
      // add box chat
      if(length < 2){ 
        html.setAttribute('style',`
        margin-right: 10px;
        background-color: white;`);
        html.setAttribute('id',groupID);
        elementContainer.append(html);
      }
      else
      {
        debugger
        let boxChats = document.getElementsByTagName("codx-chat-box");
        
      }
    }
  }

  // open popup 
  openPopupAdd(){
    this.autoClose = false;
    if (this.function) {
      let option = new DialogModel();
      option.FormModel = this.formModel;
      let data = {
        headerText: 'Tạo nhóm chat',
        gridViewSetUp: this.grdViewSetUp,
      };
      let popup = this.callFCSV.openForm(
        PopupAddGroupComponent,
        '',
        0,
        0,
        this.function.funcID,
        data,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if(res.event){
          this.listChat.addGroup(res.event);
        }
        this.autoClose = true;
      });
    }
  }
  // check read all
  clickReadAll(){
    this.listChat.readAllMessage();
    this.totalMessage = 0;
  }
  // searrch
  search(event: any) {
    this.listChat.search(event);
  }
  //select goup chat
  selectItem(group: any){
    group.isRead = true;
    this.totalMessage -= group.messageMissed;
    group.messageMissed = 0;
    this.signalRSV.sendData(group,"ActiveGroupAsync");
    this.dt.detectChanges();
  }

  // select item search
  selectItemSeach(item: any) {
    if(item.type != 'H'){
      item.type = item.type == 'U' ? '1':'2';
      this.signalRSV.sendData(item,"GetGroupSearch");
    }
  }

  clear(event){
    debugger
  }
  
}
