import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  OnDestroy,
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
import { CodxChatListComponent } from '../chat-list/chat-list.component';
import { AddGroupChatComponent } from '../popup/popup-add-group/popup-add-group.component';
import { SignalRService } from '../services/signalr.service';
import { CHAT } from '../models/chat-const.model';
import { Subscription } from 'rxjs';
declare var window: any;

@Component({
  selector: 'codx-chat',
  templateUrl: './codx-chat.component.html',
  styleUrls: ['./codx-chat.component.scss'],
})
export class CodxChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class') get class() {
    return (
      'd-flex align-items-center ' + this.codxService.toolbarButtonMarginClass
    );
  }
  subscriptions = new Subscription();
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
    let requestFunc = this.cache.functionList(this.funcID)
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
          })
        }
      });
    this.subscriptions.add(requestFunc);
  }
  

  showChat:boolean = false;
  ngOnInit(): void {
    this.showChat = this.user.tenant ? true : false;
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    this.addContainerChat();
    let subscribe1 = this.signalRSV.incomingMessage
    .subscribe((mssg: any) => {
      if(mssg && this.user && mssg?.createdBy != this.user?.userID)
      {
        if(mssg.message?.includes(`<span contenteditable="false" class="e-mention-chip">`))
        {
          this.notifySV.notify("Ai đó đã nhắc đến bạn","1",3000);
        }
        this.count++;
        this.dt.detectChanges();
      }
    });
    let subscribe2 = this.signalRSV.openBoxChat
    .subscribe((res: any) => {
      if(res)
      {
        this.getTotalMessage();
      }
    });

    let subscribe3 =this.signalRSV.removeGroup
    .subscribe((res: any) => {
      if(res)
      {
        this.getTotalMessage();
      }
    });

    this.subscriptions.add(subscribe1);
    this.subscriptions.add(subscribe2);
    this.subscriptions.add(subscribe3);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTotalMessage() {
    let subscribe = this.api
      .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetTotalMessageAsync')
      .subscribe((res: any) => {
        this.count = res;
        this.dt.detectChanges();
      });
    this.subscriptions.add(subscribe);
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
    let subscribe = popup.closed.subscribe((res: any) => {
      if (res.event)
      {
        (this.codxListChat.codxListView.dataService as CRUDService).add(res.event).subscribe();
      }
    });
    this.subscriptions.add(subscribe);
  }

  clickReadAll() {
    let subscribe1 = this.notifySV.alertCode('Đánh dấu đã xem tất cả ?') // chưa có mssgCode
    .subscribe((res: any) => {
      if (res?.event?.status === "Y")
      {
        this.count = 0;
        this.dt.detectChanges();
        let subscribe2 = this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'ChatBusiness',
          'SeenAllAsync'
        ).subscribe((res:boolean) => {
          if(res)
          {
            this.codxListChat.codxListView.dataService.data.map((item:any) => item.lastMssg.isRead = true );
            this.dt.detectChanges();
          }
        });
        this.subscriptions.add(subscribe2);
      }
    });
    this.subscriptions.add(subscribe1);
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
