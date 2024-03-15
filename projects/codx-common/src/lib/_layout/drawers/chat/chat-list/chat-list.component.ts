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
    // recive mesage
    this.signalRSV.chatboxChange
    .subscribe((mssg: any) => {
      if (mssg) 
      {
        let idx = this.codxListView.dataService.data.findIndex(x => x.groupID == mssg.groupID);
        if(idx > -1)
        {
          this.codxListView.dataService.data[idx].message = mssg;
          this.swapElements(this.codxListView.dataService.data,0,idx);
          this.dt.detectChanges();
        }
      }
    });

    
    // add group
    this.signalRSV.addGroup
    .subscribe((group:any) => {
      if(group)
      {
        (this.codxListView.dataService as CRUDService).add(group)
        .subscribe();
      }
    });

    // remove group
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

  swapElements = (array, index1, index2) => {
    if(index1 != index2)
    {
      let temp = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    }
  };

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
  search(searchText: any, searchType = "") {
    if (searchType === "searchFavorite") 
    {
      this.isSearching = false;
      this.codxListView.dataService.predicates = "IsFavorite = @0"
      this.codxListView.dataService.dataValues = "true";
      this.codxListView.dataService.method = "GetListGroupAsync";
      this.dt.detectChanges();
      this.codxListView.dataService.search(searchText);
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
      this.dt.detectChanges();
      this.codxListView.dataService.search(searchText);
    }
  }

  //select goup chat
  selectItem(data: any) {
    if(data)
    {
      this.signalRSV.sendData(CHAT.BE_FUNC.OpenBoxChatAsync, data.groupID);
      if (data.message) data.message.isRead = true;
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
  // select item search
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

  // open popup add group chat
  addGroup(group: any) {
    if (group) {
      let groups = (this.codxListView.dataService as CRUDService)?.data?.filter(
        (x) => x?.groupID == group?.groupID
      );
      if (groups?.length > 0) {
        return;
      }
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
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
          data.isFavorite = !data.isFavorite;
          this.updateFavorite(data.groupID,data.groupType, data.isFavorite);
          break;
      }
      this.dt.detectChanges();
    }
  }


  updateFavorite(groupID:string,groupType:string, value:boolean) {
    this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'ContactFavoriteBusiness',
      'AddAndUpdateFavoriteAsync',
      [groupID, groupType, value]
    ).subscribe();
  }


  beforeDelete(opt:RequestOption,groupID:string){
    opt.service = "WP";
    opt.assemblyName = "ERM.Business.WP";
    opt.className = "GroupBusiness";
    opt.methodName = "DeleteByIDAsync";
    opt.data = groupID;
    return true;
  }
}
