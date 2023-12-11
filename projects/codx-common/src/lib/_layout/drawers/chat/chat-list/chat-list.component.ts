import { group } from 'console';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxListviewComponent,
  CRUDService,
  FormModel,
} from 'codx-core';
import { SignalRService } from '../services/signalr.service';
import { CodxChatBoxComponent } from '../chat-box/chat-box.component';
import { CHAT } from '../models/chat-const.model';

@Component({
  selector: 'codx-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class CodxChatListComponent implements OnInit, AfterViewInit {
  funcID: string = 'WPT11';
  function: any = null;
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  user: any = null;
  searched: boolean = false;
  idField: object = {
    id: 'groupID',
  };
  
  @Output('getTotalMessage') getTotalMessage: EventEmitter<any> = new EventEmitter();
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private applicationRef: ApplicationRef,
    private callfc: CallFuncService,
    private auth: AuthStore
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
    // add mesage
    this.signalRSV.chatboxChange.subscribe((res: any) => {
      if (res?.event && res?.data) {
        switch(res?.event){
          case CHAT.UI_FUNC.DeletedMessage:
            {
              break;
            }
          default:{              
            let mssg = res.data;
            let lstData = this.codxListView.dataService.data;
            let idx = lstData.findIndex((x: any) => x.groupID === res.groupID|| x?.groupID == res?.data?.groupID);
            if (idx != -1 && mssg?.message) {
              let group = JSON.parse(JSON.stringify(lstData[idx]));
              mssg.message =
                mssg.messageType === '3' || mssg.messageType === '5'
                  ? ''
                  : mssg.message;
              if(mssg.status)
              {
                mssg.isRead = mssg.status.some((x: any) => x.userID === this.user.userID);
              }
              
              group.message = JSON.parse(JSON.stringify(mssg));
              lstData.splice(idx, 1);
              (this.codxListView.dataService as CRUDService).add(group).subscribe();
              this.dt.detectChanges();
            }
            break;
          }
        }
        
      }
    });
    // this.signalRSV.deletedMessage.subscribe((res: any) => {
    //   if (res) {
    //     let lstData = this.codxListView.dataService.data;
    //     let idx = lstData.findIndex((x: any) => x.groupID === res.groupID || x?.groupID == res?.mssg?.groupID);
    //     if (idx != -1) {
    //       let group = JSON.parse(JSON.stringify(lstData[idx]));
    //       let mssg = JSON.parse(JSON.stringify(group.message));
    //       mssg.message = '';
    //       group.message = JSON.parse(JSON.stringify(mssg));
    //       lstData.splice(idx, 1);
    //       (this.codxListView.dataService as CRUDService).add(group).subscribe();
    //       this.dt.detectChanges();
    //     }
    //   }
    // });
    //Online Status
    // this.signalRSV.updateOnlineStatus.subscribe((res: any) => {      
    //   if (res?.data?.length>0 && this.codxListView?.dataService?.data?.length>0) {
    //     debugger;
    //     let gr = this.codxListView?.dataService?.data.filter(x=>res?.data?.some( g=> g ==x.group));
    //   }
    // });
  }
  // check read all
  readAllMessage() {
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'ChatBusiness',
        'SeenAllMessageAsync',
        []
      )
      .subscribe((res: boolean) => {
        if (res) {
          this.codxListView.dataService.data.map((e) => {
            e.isRead = true;
            e.messageMissed = 0;
          });
          this.dt.detectChanges();
        }
      });
  }
  // searrch
  search(event: any) {
    if (event) 
    {
      this.searched = true;
      this.codxListView.dataService.method = 'SearchAsync';
      this.codxListView.dataService.search(event);
    } 
    else 
    {
      this.searched = false;
      this.codxListView.dataService.method = 'GetGroupAsync';
      this.codxListView.dataService.search(event);
    }
    this.dt.detectChanges();
  }

  //select goup chat
  selectItem(group: any) {
    this.signalRSV.sendData(CHAT.BE_FUNC.LoadGroup, group?.groupID);
    group.message.isRead=true;
    this.dt.detectChanges();
    this.api
    .execSv(
      'WP',
      'ERM.Business.WP',
      'ChatBusiness',
      'UpdateMessageByGroupAsync',
      group?.groupID
    ).subscribe(res=>{
      if(res){
        this.getTotalMessage.emit();
      }
    })

  }
  // select item search
  selectItemSeach(item: any) {
    if (item.type != 'H') {
      this.signalRSV.sendData(
        CHAT.BE_FUNC.SearchGroup,
        item.id,
        item.type == 'U' ? '1' : '2'
      );
    }
  }

  // open popup add group chat
  addGroup(group: any) 
  {
    if(group) 
    {
      let groups = (this.codxListView.dataService as CRUDService)?.data?.filter(x=>x?.groupID == group?.groupID);
      if(groups?.length > 0){
        return;
      }      
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
    }
  }
}
