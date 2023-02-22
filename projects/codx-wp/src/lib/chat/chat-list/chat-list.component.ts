import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
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
  
  funcID: string = 'WPT11';
  function: any = null;
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  user:any = null;
  dataSerach:any[] = [];
  searched:boolean = false;
  @ViewChild('codxListViewGroup') codxListViewGroup: CodxListviewComponent;
  @ViewChild('codxListViewSerach') codxListViewSerach: CodxListviewComponent;
  @ViewChild("chatBox") chatBox:TemplateRef<any>;
  constructor(
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
  }

  ngAfterViewInit() {
    // add group
    this.signalRSV.signalGroup.subscribe((res: any) => {
      if (res) 
      {
        (this.codxListViewGroup.dataService as CRUDService).add(res).subscribe();
      }
    });
    // add mesage
    this.signalRSV.signalChat.subscribe((res: any) => {
      if (res) 
      {
        this.addBoxChat(res.groupID);
        let _group = this.codxListViewGroup.dataService.data;
        let _index = _group.findIndex(e => e['groupID'] === res.groupID);
        if(_index > -1){
          _group[_index].message = res.message;
          _group[_index].isRead = res.status.some(x => x["UserID"] === this.user.UserID);
        }
      }
    });
  }
  // searrch
  search(event: any) {
    if(event){
      debugger
      this.searched = true;
      this.codxListViewSerach.dataService.search(event).subscribe();
      // this.api.execSv("WP","ERM.Business.WP","GroupBusiness","SearchAsync",[event,0])
      // .subscribe((res:any) =>{
      //   this.dataSerach = res;
      //   this.dt.detectChanges();
      // });
    }
    else
      this.searched = false;
    
  }
  // click group chat - chat box
  openChatBox(group: any) {
    if (group) 
    {
      if(!group.isRead)
      {
        //update status message
        this.api.execSv(
          "WP",
          "ERM.Business.WP",
          "ChatBusiness",
          "UpdateMessageAsync",
          [group.lastMssgID])
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
        this.isOpen = true;
        this.isOpenChange.emit(this.isOpen);
        // if (res.event) 
        // {
        //   let group = res.event;
        //   (this.codxListViewGroup.dataService as CRUDService).add(group).subscribe();
        // }
      });
    }
  }

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
        if(length < 3) // add box chat
        {
          html.setAttribute('style',`
          position: fixed!important;
          bottom: 0px;
          right: ${(length*320 + 100)}px;
          margin-top: -500px;
          background-color: white;`);
          html.setAttribute('id',groupID);
          elementContainer.append(html);
      }
      else // tạo bong bóng chat
      {
        
      }
    }
    }
  }
}
