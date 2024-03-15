import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CodxService,
  CallFuncService,
  ApiHttpService,
  FormModel,
  AuthStore,
  CacheService,
  NotificationsService,
  DialogModel,
  AuthService,
} from 'codx-core';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { CodxChatListComponent } from '../chat-list/chat-list.component';
import { AddGroupChatComponent } from '../popup/popup-add-group/popup-add-group.component';
import { SignalRService } from '../services/signalr.service';
import { CHAT } from '../models/chat-const.model';
declare var window: any;

@Component({
  selector: 'codx-chat',
  templateUrl: './codx-chat.component.html',
  styleUrls: ['./codx-chat.component.scss'],
  providers: [NgbDropdownConfig]
})
export class CodxChatComponent implements OnInit, AfterViewInit {
  @HostBinding('class') get class() {
    return (
      'd-flex align-items-center ' + this.codxService.toolbarButtonMarginClass
    );
  }

  loaded = false;
  loadFavorite = false;
  count: number = 0;
  formModel: FormModel;
  grdViewSetUp
  user: any;
  funcID: string = 'WPT11';
  function: any = null;
  lstBoxChat: any[] = [];
  @ViewChild('codxChatContainer') codxChatContainer: TemplateRef<any>;
  @ViewChild('codxListChat') codxListChat: CodxChatListComponent;
  @ViewChild(NgbDropdown) ngbDropdown: NgbDropdown;
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private api: ApiHttpService,
    public codxService: CodxService,
    private signalRSV: SignalRService,
    private applicationRef: ApplicationRef,
    private callFCSV: CallFuncService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private dt: ChangeDetectorRef,
    private dropdownConfig:NgbDropdownConfig
  ) 
  {
    dropdownConfig.autoClose = "outside";
    this.user = this.auth.get();
    this.cache.functionList(this.funcID)
      .subscribe((func:any) => {
        if (func) 
        {
          this.formModel = new FormModel();
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.cache.gridViewSetup(this.formModel.formName,this.formModel.gridViewName)
          .subscribe((grd:any) => {
            this.grdViewSetUp = grd;
            this.dt.detectChanges();
          })
        }
      });
  }

  ngOnInit(): void {
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    this.addContainerChat();
    // message
    this.signalRSV.chatboxChange
    .subscribe((res: any) => {
      if(res && this.user && res?.createdBy != this.user?.userID)
      {
        this.count++;
        this.dt.detectChanges();
      }
    });

    // open box chat
    this.signalRSV.openBoxChat
    .subscribe((res: any) => {
      if(res)
      {
        this.getTotalMessage();
      }
    });

    // add group
    this.signalRSV.addGroup
    .subscribe((group:any) => {
      if(group)
      {
        this.getTotalMessage();
      }
    });
  }
  // get count message
  getTotalMessage() {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetTotalMessageAsync')
      .subscribe((res: any) => {
        this.count = res;
      });
  }
  // open chat box
  openChatList() {
    if (!this.loaded) {
      this.loaded = true;
    }
  }

  // add codx chat container
  addContainerChat() {
    let viewRef = this.codxChatContainer.createEmbeddedView(null);
    if (viewRef) {
      this.applicationRef.attachView(viewRef);
      viewRef.detectChanges();
      let view = viewRef.rootNodes[0];
      document.querySelector('#codx-container-chat')?.append(view);
      this.codxChatContainer.elementRef.nativeElement.remove();
    }
  }
  //click  open popup
  clickOpenPopup() {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    let data = {
      headerText: 'Tạo nhóm chat',
      gridViewSetUp: this.grdViewSetUp,
    };
    let popup = this.callFCSV.openForm(
      AddGroupChatComponent,
      '',
      0,
      window.innerHeight - 100,
      this.function.funcID,
      data,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if (res.event) 
        this.codxListChat.addGroup(res.event);
    });
  }
  // check read all
  clickReadAll() {
    // chưa có mssgCode
    this.notifySV.alertCode('Đánh dấu xem tất cả?').subscribe((res: any) => {
      if (res.event.status === 'Y') {
        this.codxListChat.readAllMessage();
        this.count = 0;
      }
    });
  }

  // searrch
  search(searchText:any, searchType = "") 
  {
    if(searchType == "searchFavorite")
    {
      this.loadFavorite =! this.loadFavorite;
      if(!this.loadFavorite) searchType = "";
      this.dt.detectChanges();
    }
    if(this.codxListChat) this.codxListChat.search(searchText,searchType);
  }


  selectItemSeach(item: any) {
    if (item.type != 'H') {
      this.signalRSV.sendData(
        CHAT.BE_FUNC.FindGroupAsync,
        item.id,
        item.type == 'U' ? '1' : '2'
      );
    }
  }

}
