import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, HostBinding, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { CodxService, CallFuncService, ApiHttpService, DataService, FormModel, AuthStore, CacheService, NotificationsService, DialogModel, CodxListviewComponent, CRUDService } from 'codx-core';
import { group } from '@angular/animations';
import { PopupAddGroupComponent } from '../chat-list/popup/popup-add-group/popup-add-group.component';

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

  @ViewChild("chatBox") chatBox:TemplateRef<any>;
  @ViewChild('codxListViewGroup') codxListViewGroup: CodxListviewComponent;
  @ViewChild('codxListViewSerach') codxListViewSerach: CodxListviewComponent;
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
    this.dataSVSearch = new DataService(this.injector);
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
    this.dataSVSearch.service = "WP";
    this.dataSVSearch.assemblyName = "ERM.Business.WP";
    this.dataSVSearch.className = "GroupBusiness";
    this.dataSVSearch.method = "SearchAsync";
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
      if(res){
        this.addBoxChat(res.groupID);
      }
    });
    //receiver message to connection
    this.signalRSV.reciverChat.subscribe((res:any) => {
      if(res.groupID){
        this.addBoxChat(res.groupID);
        if(this.codxListViewGroup){
          let data = this.codxListViewGroup.dataService.data;
          let _index = data.findIndex(e => e['groupID'] === res.groupID);
          if(_index > -1){
            let group = data[_index]; 
            group.message = res.message;
            group.modifiedOn = res.modifiedOn;
            group.isRead = res.status.some(x => x["UserID"] === this.user.UserID);
            (this.codxListViewGroup.dataService as CRUDService).removeIndex(_index).subscribe();
            (this.codxListViewGroup.dataService as CRUDService).add(group).subscribe();
          }
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
    this.loaded = true;
  }
  // check box chat
  checkBoxChat(groupID:string):boolean{
    let _eleChatBoxs = document.getElementsByTagName("codx-chat-box");
    let _arrBoxChat = Array.from(_eleChatBoxs);
    if(Array.isArray(_arrBoxChat)){
      return _arrBoxChat.some(e => e.id === groupID);
    }
    return false;
  }
  // add box chat
  addBoxChat(groupID:any){
    if(!this.checkBoxChat(groupID)){
      this.getTotalMessage();
      let viewRef = this.chatBox.createEmbeddedView({ $implicit: groupID });
      this.applicationRef.attachView(viewRef);
      viewRef.detectChanges();
      let html = viewRef.rootNodes[0];
      let elementContainer = document.querySelector(".container-chat");
      if(elementContainer){
        let length = elementContainer.children.length;
        // add box chat
        if(length < 3){ 
          html.setAttribute('style',`
          position: fixed!important;
          bottom: 0px;
          right: ${(length*320 + 100)}px;
          margin-top: -500px;
          background-color: white;`);
          html.setAttribute('id',groupID);
          elementContainer.append(html);
        }
        else{
          
        }
      }
    }
  }

  // open popup 
  openPopupAddGroup(){
    if (this.function) {
      let option = new DialogModel();
      option.DataService = this.codxListViewGroup.dataService;
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
          (this.codxListViewGroup.dataService as CRUDService).add(res.event).subscribe();
        }
      });
    }
  }
  // check read all
  clickCheckSeenAll(){
    this.api.execSv("WP","ERM.Business.WP","ChatBusiness","SeenAllMessageAsync",[])
      .subscribe((res:boolean)=>{
        if(res){
          this.codxListViewGroup.dataService.data.map(e => {
            e.isRead = true;
            e.mssgCount = 0;
          });
          this.totalMessage = 0;
          this.dt.detectChanges();
        }
      });
  }
  searched:boolean = false;
  dataSVSearch:DataService = null;
  // searrch
  search(event: any) {
    this.searched = event ? true : false;
    if(this.dataSVSearch)
      this.dataSVSearch.search(event).subscribe(res=> console.log(res));
  }
  //select goup chat
  selectItem(group: any){
    group.isRead = true;
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

  
}
