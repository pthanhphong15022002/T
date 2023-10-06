import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  OnInit,
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
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { CodxChatListComponent } from '../chat-list/chat-list.component';
import { AddGroupChatComponent } from '../popup/popup-add-group/popup-add-group.component';
import { SignalRService } from '../services/signalr.service';
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
  count:number = 0;
  formModel:FormModel = null;
  user:any = null;
  funcID: string = 'WPT11';
  function: any = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  autoClose: boolean = true;
  lstBoxChat: any[] = [];
  @ViewChild('codxChatContainer', { static: true })
  codxChatContainer: TemplateRef<any>;
  @ViewChild('listChat') listChat: CodxChatListComponent;
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
    private dt: ChangeDetectorRef
  ) {
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
          // grid view set up
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
              }
            });
          // more function
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
    this.getCountMessage();
    this.addContainerChat();
  }

  ngAfterViewInit(): void {
    this.signalRSV.activeGroup.subscribe((res:any) => {
      this.getCountMessage();
    });
    // this.signalRSV.disConnected.subscribe((res) => {
    //   debugger
    //   let ele = document.getElementsByTagName("codx-chat-container");
    //   ele[0].remove();
    // })
  }
  // get count message
  getCountMessage(){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "GetTotalMessageAsync")
      .subscribe((res:any) => {
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
    this.autoClose = false;
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
      window.innerHeight,
      this.function.funcID,
      data,
      '',
      option
    );
    popup.closed.subscribe((res: any) => {
      if (res.event) {
        this.listChat.addGroup(res.event);
      }
      this.autoClose = true;
    });
  }
  // check read all
  clickReadAll() {
    // chưa có mssgCode
    this.autoClose = false;
    this.notifySV.alertCode('Đánh dấu xem tất cả?').subscribe((res: any) => {
      if (res.event.status === 'Y') {
        this.listChat.readAllMessage();
        this.count = 0;
      }
      this.autoClose = true;
    });
  }
  // searrch
  search(event: any) {
    if (this.listChat) {
      this.listChat.search(event);
    }
  }
  //select goup chat
  selectItem(group: any) {
    group.isRead = true;
    if (group.messageMissed > 0) {
      group.messageMissed = 0;
      this.count -= group.messageMissed;
    }
    this.signalRSV.sendData('OpenGroupAsync', group);
    this.dt.detectChanges();
  }
  // select item search
  selectItemSeach(item: any) {
    if (item.type != 'H') {
      this.signalRSV.sendData(
        'GetGroupSearch',
        item.id,
        item.type == 'U' ? '1' : '2'
      );
    }
  }

  // close ngbDropdown
  close() {
    this.ngbDropdown.close();
  }
}
