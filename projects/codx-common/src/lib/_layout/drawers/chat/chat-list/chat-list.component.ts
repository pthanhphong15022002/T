import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { group } from 'console';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
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

@Component({
  selector: 'codx-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class CodxChatListComponent implements OnInit, AfterViewInit {

  @Input() formModel: FormModel;
  @Output('getTotalMessage') getTotalMessage: EventEmitter<any> = new EventEmitter();
  @ViewChild('codxListView') codxListView: CodxListviewComponent;

  user: any = null;
  isSearching: boolean = false;

  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private CodxCommonService: CodxCommonService,
    private auth: AuthStore
  ) 
  {
    this.user = this.auth.get();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.signalRSV.reciveMesage
    .subscribe((mssg: any) => {
      if (mssg) 
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == mssg.groupID);
        if(idx > -1)
        {
          this.codxListView.dataService.data[idx].lastMssg = mssg;
          (this.codxListView.dataService as CRUDService).update(this.codxListView.dataService.data[idx]).subscribe();
        }
      }
    });

    this.signalRSV.groupChange
    .subscribe((group:any) => {
      if(group)
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == group.groupID);
        if(idx > -1)
          (this.codxListView.dataService as CRUDService).update(group).subscribe();
      } 
    });

    this.signalRSV.addGroup
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
    })

    this.signalRSV.removeGroup
    .subscribe((groupID:any) => {
      if(groupID && this.codxListView.dataService.data.length > 0)
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == groupID);
        if(idx > -1)
          (this.codxListView.dataService as CRUDService).removeIndex(idx).subscribe();
      }
    });

    
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
      this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'ChatBusiness',
          'UpdateMessageByGroupAsync',
          data.groupID
        ).subscribe();
      this.dt.detectChanges();
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
      this.api.execSv(
        'WP',
        'ERM.Business.WP',
        'ContactFavoriteBusiness',
        'AddAndUpdateFavoriteAsync',
        [group.groupID, group.groupType, group.isFavorite]
      ).subscribe((res:any) => 
      {
        if(res) this.signalRSV.sendData(CHAT.BE_FUNC.FavoriteGroupAsync,group.groupID);
      })
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


}
