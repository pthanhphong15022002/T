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
  CRUDService,
  UserModel,
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
  user: UserModel;
  funcID: string = 'WPT11';
  function: any = null;
  lstBoxChat: any[] = [];
  @ViewChild('codxChatContainer') codxChatContainer: TemplateRef<any>;
  @ViewChild('codxListChat') codxListChat: CodxChatListComponent;
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
  )
  {
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
            //this.dt.detectChanges();
          })
        }
      });
  }

  showChat:boolean = true;
  ngOnInit(): void {
    this.showChat = this.user.tenant ? true : false;
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    this.addContainerChat();
    this.signalRSV.incomingMessage
    .subscribe((res: any) => {
      if(res && this.user && res?.createdBy != this.user?.userID)
      {
        this.count++;
        this.dt.detectChanges();
      }
    });

    this.signalRSV.openBoxChat
    .subscribe((res: any) => {
      if(res)
      {
        this.getTotalMessage();
      }
    });

    this.signalRSV.removeGroup
    .subscribe((res: any) => {
      if(res)
      {
        this.getTotalMessage();
      }
    });
  }

  getTotalMessage() {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetTotalMessageAsync')
      .subscribe((res: any) => {
        this.count = res;
      });
  }

  openChatList() {
    if (!this.loaded) {
      this.loaded = true;
    }
  }

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
      850,
      window.innerHeight - 100,
      this.function.funcID,
      data,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if (res.event)
      {
        (this.codxListChat.codxListView.dataService as CRUDService).add(res.event).subscribe();
      }
    });
  }

  clickReadAll() {
    // chưa có mssgCode
    this.notifySV.alertCode('Đánh dấu đã xem tất cả ?')
    .subscribe((res: any) => {
      if (res?.event?.status === "Y")
      {
        this.count = 0;
        this.dt.detectChanges();
        this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'ChatBusiness',
          'SeenAllAsync'
        ).subscribe((res:boolean) => {
          if(res)
          {
            this.codxListChat.codxListView.dataService.data.map((item:any) => { item.lastMssg.isRead = true });
          }
        });
      }
    });
  }

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
