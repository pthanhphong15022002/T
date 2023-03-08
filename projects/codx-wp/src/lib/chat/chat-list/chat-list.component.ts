import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxListviewComponent,
  CRUDService,
  DataRequest,
  DataService,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { PopupAddGroupComponent } from './popup/popup-add-group/popup-add-group.component';

@Component({
  selector: 'wp-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit, AfterViewInit {
  
  @Input() isOpen: boolean; // check open dropdown
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() checkSeenAll = new EventEmitter<boolean>();

  
  funcID: string = 'WPT11';
  function: any = null;
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  user:any = null;
  dataSVSearch:DataService = null;
  searched:boolean = false;
  @ViewChild('codxListViewGroup') codxListViewGroup: CodxListviewComponent;
  @ViewChild('codxListViewSerach') codxListViewSerach: CodxListviewComponent;
  @ViewChild("chatBox") chatBox:TemplateRef<any>;
  constructor(
    private injector:Injector,
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private callFCSV: CallFuncService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private dt: ChangeDetectorRef,
    private applicationRef: ApplicationRef,
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

  }

  ngAfterViewInit() {
    // add mesage
    this.signalRSV.signalChat.subscribe((res: any) => {
      if (res) 
      {
        this.addBoxChat(res.groupID);
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
    });
    
  }
  // searrch
  search(event: any) {
    this.searched = event ? true : false;
    this.dt.detectChanges();
    if(this.dataSVSearch)
      this.dataSVSearch.search(event).subscribe(res=> console.log(res));
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
          this.dt.detectChanges();
          this.checkSeenAll.emit();
        }
      });
  }
  //click goup chat
  clickGroupChat(group: any){
    if(!group.isRead){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "ChatBusiness",
        "SeenMessageByGroupAsync",
        [group.groupID])
        .subscribe((res:boolean) => group.isRead = res);
    }
    this.addBoxChat(group.groupID);
  }
  // click group chat - chat box
  openChatBox(group: any) {
    if(group["type"] === "U"){
      this.api.execSv("WP","ERM.Business.WP","GroupBusiness","GetGroupByUserIDAsync",[group.id,group.name])
      .subscribe((res:any)=>{
        if(res[0].groupID){
          this.addBoxChat(res[0].groupID);
        }
      });
    }
    else if(group["type"] === "G"){
      if(!group.isRead){
        this.api.execSv(
          "WP",
          "ERM.Business.WP",
          "ChatBusiness",
          "SeenMessageByGroupAsync",
          [group.groupID])
          .subscribe();
        group.isRead = true;
      }
      this.addBoxChat(group.groupID);
    }
  }

  // open popup add group chat
  openPopupAddGroup() {
    if (this.function) {
      this.isOpen = false;
      this.isOpenChange.emit(this.isOpen);
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
        debugger
        if(res.event){
          let boxChat = res.event[0];
          (this.codxListViewGroup.dataService as CRUDService).add(boxChat).subscribe();
          this.signalRSV.templateChatBox = this.chatBox;
          this.signalRSV.sendData(boxChat,"ActiveGroupAsync");
        }
        this.isOpen = true;
        this.isOpenChange.emit(this.isOpen);
      });
    }
  }
  // add box chat
  addBoxChat(groupID:any){
    let _eleChatBoxs = document.getElementsByTagName("codx-chat-box");
    let _arrBoxChat = Array.from(_eleChatBoxs);
    let _boxChat = _arrBoxChat.find(e => e.id === groupID);
    if(!_boxChat){
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
}
