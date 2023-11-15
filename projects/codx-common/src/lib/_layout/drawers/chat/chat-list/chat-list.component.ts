import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxListviewComponent,
  CRUDService,
  FormModel,
} from 'codx-core';
import { SignalRService } from '../services/signalr.service';

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
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private applicationRef: ApplicationRef,
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
    this.signalRSV.chat.subscribe((res: any) => {
      if (res) {
        let mssg = res.mssg;
        let lstData = this.codxListView.dataService.data;
        let idx = lstData.findIndex((x: any) => x.groupID === res.groupID);
        if (idx != -1 && mssg?.message) {
          let group = JSON.parse(JSON.stringify(lstData[idx]));
          mssg.message =
            mssg.messageType === '3' || mssg.messageType === '5'
              ? ''
              : mssg.message;
          mssg.isRead = mssg.status.some(
            (x: any) => x.userID === this.user.userID
          );
          group.message = JSON.parse(JSON.stringify(mssg));
          lstData.splice(idx, 1);
          (this.codxListView.dataService as CRUDService).add(group).subscribe();
          this.dt.detectChanges();
        }
      }
    });
    this.signalRSV.undoMssg.subscribe((res: any) => {
      if (res) {
        let lstData = this.codxListView.dataService.data;
        let idx = lstData.findIndex((x: any) => x.groupID === res.groupID);
        if (idx != -1) {
          let group = JSON.parse(JSON.stringify(lstData[idx]));
          let mssg = JSON.parse(JSON.stringify(group.message));
          mssg.message = '';
          group.message = JSON.parse(JSON.stringify(mssg));
          lstData.splice(idx, 1);
          (this.codxListView.dataService as CRUDService).add(group).subscribe();
          this.dt.detectChanges();
        }
      }
    });
    //new group
    this.signalRSV.activeNewGroup.subscribe((res: any) => {
      if (res?.group) {
        (this.codxListView.dataService as CRUDService)
          .add(res.group)
          .subscribe();
      }
    });
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
    this.signalRSV.sendData('OpenBoxChat', group);
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

  // open popup add group chat
  addGroup(group: any) 
  {
    if(group) 
    {
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
    }
  }
}
