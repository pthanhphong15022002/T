import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
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
  DataService,
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
  funcID: string = 'WPT11';
  function: any = null;
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  user:any = null;
  dataSVSearch:DataService = null;
  searched:boolean = false;
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  constructor(
    private injector:Injector,
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
    this.dataSVSearch = new DataService(this.injector);
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
    this.dataSVSearch.service = "WP";
    this.dataSVSearch.assemblyName = "ERM.Business.WP";
    this.dataSVSearch.className = "GroupBusiness";
    this.dataSVSearch.method = "SearchAsync";

  }

  ngAfterViewInit() {
    // add mesage
    this.signalRSV.reciverChat.subscribe((res: any) => {
      if (res.groupID){
        let data = this.codxListView.dataService.data;
        let _index = data.findIndex(e => e['groupID'] === res.groupID);
        if(_index > -1){
          let group = data[_index]; 
          group.message = res.message;
          group.modifiedOn = res.modifiedOn;
          group.isRead = res.status.some(x => x["UserID"] === this.user.UserID);
          (this.codxListView.dataService as CRUDService).removeIndex(_index).subscribe();
          (this.codxListView.dataService as CRUDService).add(group).subscribe();
        }
      }
    });
    
  }
  // check read all
  readAllMessage(){
    this.api.execSv("WP","ERM.Business.WP","ChatBusiness","SeenAllMessageAsync",[])
      .subscribe((res:boolean)=>{
        if(res){
          this.codxListView.dataService.data.map(e => {
            e.isRead = true;
            e.messageMissed = 0;
          });
          this.dt.detectChanges();
        }
      });
  }
  // searrch
  search(event: any) {
    if(event){
      this.searched = true;
      this.codxListView.dataService.method = 'SearchAsync';
      this.codxListView.dataService.search(event).subscribe();
    }
    else
    {
      this.searched = false;
      this.codxListView.dataService.method = 'GetGroupAsync';
      this.codxListView.dataService.search(event).subscribe();
    }
    this.dt.detectChanges();

  }

  
   //select goup chat
   selectItem(group: any){
    debugger
    group.isRead = true;
    group.messageMissed = 0;
    this.signalRSV.sendData(group,"ActiveGroupAsync");
  }
   // select item search
   selectItemSeach(item: any) {
    if(item.type != 'H'){
      item.type = item.type == 'U' ? '1':'2';
      this.signalRSV.sendData(item,"GetGroupSearch");
    }
  }
  
  // open popup add group chat
  addGroup(group:any) {
    if(group){
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
    }
  }

}
