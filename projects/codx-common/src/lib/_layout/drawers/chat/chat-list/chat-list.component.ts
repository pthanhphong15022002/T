import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { group } from 'console';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
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
  NotificationsService,
  RequestOption,
} from 'codx-core';
import { SignalRService } from '../services/signalr.service';
import { CHAT } from '../models/chat-const.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'codx-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class CodxChatListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() formModel: FormModel;
  @ViewChild('codxListView') codxListView: CodxListviewComponent;

  subscriptions = new Subscription();
  user: any = null;
  isSearching: boolean = false;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private signalRSV: SignalRService,
    private auth: AuthStore
  ) 
  {
    this.user = this.auth.get();
  }
 

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let subscribe1 = this.signalRSV.incomingMessage
    .subscribe((mssg: any) => {
      if (mssg) 
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == mssg.groupID);
        if(idx > -1)
        {
          this.codxListView.dataService.data[idx].lastMssg = mssg;
          (this.codxListView.dataService as CRUDService).update(this.codxListView.dataService.data[idx]).subscribe();
        }
        else
        {
          this.api.execSv(
            'WP',
            'ERM.Business.WP',
            'GroupBusiness',
            'GetGroupByIDAsync',
            [mssg.groupID]
          ).subscribe((res:any) => 
          {
            if(res) this.addGroup(res);
          });
        }
        
      }
    });

    let subscribe2 = this.signalRSV.groupChange
    .subscribe((group:any) => {
      if(group)
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == group.groupID);
        if(idx > -1)
          (this.codxListView.dataService as CRUDService).update(group).subscribe();
      } 
    });

    let subscribe3 = this.signalRSV.addGroup
    .subscribe((groupID:any) => {
      if(groupID)
      {
        this.api.execSv(
          'WP',
          'ERM.Business.WP',
          'GroupBusiness',
          'GetGroupByIDAsync',
          [groupID]
        ).subscribe((res:any) => 
        {
          if(res) this.addGroup(res);
        });
      }
    });

    let subscribe4 = this.signalRSV.removeGroup
    .subscribe((groupID:any) => {
      if(groupID)
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == groupID);
        if(idx > -1)
        {
          (this.codxListView.dataService as CRUDService)
          .remove(this.codxListView.dataService.data[idx])
          .subscribe();
        }
      }
    });
    this.subscriptions.add(subscribe1);
    this.subscriptions.add(subscribe2);
    this.subscriptions.add(subscribe3);
    this.subscriptions.add(subscribe4);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  search(searchText: any, searchType = "") {
    if (searchType === "searchFavorite") 
    {
      this.isSearching = false;
      this.codxListView.dataService.predicates = "IsFavorite = @0"
      this.codxListView.dataService.dataValues = "true";
      this.codxListView.dataService.method = "GetListGroupAsync";
    } 
    else
    {
      this.codxListView.dataService.predicates = null;
      this.codxListView.dataService.dataValues = null;
      if (searchText) 
      {
        this.isSearching = true;
        this.codxListView.dataService.method = 'SearchGroupAsync';
      } 
      else 
      {
        this.isSearching = false;
        this.codxListView.dataService.method = "GetListGroupAsync";
      }
    }
    this.dt.detectChanges();
    this.codxListView.dataService.search(searchText);
  }

  selectItem(data: any) {
    if(data)
    {
      this.signalRSV.sendData(CHAT.BE_FUNC.OpenBoxChatAsync, data.groupID);
      if (data.lastMssg) data.lastMssg.isRead = true;
      this.dt.detectChanges();
      let subscribe = this.api.execSv(
          'WP',
          'ERM.Business.WP',
          'ChatBusiness',
          'UpdateMessageByGroupAsync',
          data.groupID
        ).subscribe();
      this.subscriptions.add(subscribe);
    }
  }

  selectItemSeach(item: any) {
    if (item.type != 'H') 
    {
      this.signalRSV.sendData(
        CHAT.BE_FUNC.FindGroupAsync,
        item.id,
        item.type == 'U' ? '1' : '2'
      );
    }
  }

  clickMF(type, data) {
    if (type && data) 
    {
      switch (type) 
      {
        case 'delete':
          (this.codxListView.dataService as CRUDService)
          .delete([data],true,(opt) => this.beforeDelete(opt,data.groupID))
          .subscribe((res:any) => {
            if(res)
              this.signalRSV.sendData(CHAT.BE_FUNC.RemoveGroupAsync,data.groupID);
          });
          break;
        case 'favorite':
          this.updateFavorite(data);
          break;
      }
      this.dt.detectChanges();
    }
  }

  updateFavorite(group:any) {
   if(group)
   {
      group.isFavorite = !group.isFavorite;
      let subscribe = this.api.execSv(
        'WP',
        'ERM.Business.WP',
        'ContactFavoriteBusiness',
        'AddAndUpdateFavoriteAsync',
        [group.groupID, group.groupType, group.isFavorite]
      ).subscribe((res:any) => 
      {
        if(res) this.signalRSV.sendData(CHAT.BE_FUNC.FavoriteGroupAsync,group.groupID);
      });
      this.subscriptions.add(subscribe);
   } 
  }

  beforeDelete(opt:RequestOption,groupID:string){
    opt.service = "WP";
    opt.assemblyName = "ERM.Business.WP";
    opt.className = "GroupBusiness";
    opt.methodName = "DeleteByIDAsync";
    opt.data = groupID;
    return true;
  }

  addGroup(group: any) {
    if (group) 
    {
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
    }
  }


  seenAllMessage(){
    if(!this.isSearching && this.codxListView.dataService.data.length > 0)
    {
      (this.codxListView.dataService as CRUDService).data.map(x => {
        if(x.lastMssg)
        {
          x.lastMssg.isRead = true;
          x.lastMssg.createdOn = new Date();
        }
      }) ;
      this.dt.detectChanges();
    }
  }

}
