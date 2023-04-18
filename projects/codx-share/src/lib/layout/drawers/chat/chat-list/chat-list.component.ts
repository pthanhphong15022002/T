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
import { SignalRService } from 'projects/codx-share/src/lib/layout/drawers/chat/services/signalr.service';
import { MessageSystemPipe } from '../chat-box/mssgSystem.pipe';
import { GRID_CLASS } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';

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
  user:any = null;
  searched:boolean = false;
  messageSystemPipe:MessageSystemPipe = null;
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private applicationRef:ApplicationRef,
    private auth: AuthStore,

  ) 
  {
    this.user = this.auth.get();
    this.formModel = new FormModel();
    this.messageSystemPipe = new MessageSystemPipe(this.cache,this.applicationRef);
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
      debugger
      if (res?.mssg){
        let mssg = res.mssg;
        let data = this.codxListView.dataService.data;
        if(mssg){
          let index = data.findIndex(e => e['groupID'] === mssg.groupID);
          if(index != -1){
            let group = JSON.parse(JSON.stringify(data[index])); 
            if(mssg.messageType && mssg.messageType !== "3")
            {
              group.message = mssg.message;
            }
            else
            {
              group.message = "";
            }
            group.modifiedOn = mssg.modifiedOn;
            group.isRead = mssg.status.some(x => x["UserID"] === this.user.UserID);
            this.codxListView.dataService.data.splice(index,1);
            (this.codxListView.dataService as CRUDService).add(group).subscribe();
          }
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
    group.isRead = true;
    group.messageMissed = 0;
    this.signalRSV.sendData("ActiveGroupAsync",group);
  }
   // select item search
   selectItemSeach(item: any) {
    if(item.type != 'H'){
      item.type = item.type == 'U' ? '1':'2';
      this.signalRSV.sendData("GetGroupSearch",item);
    }
  }
  
  // open popup add group chat
  addGroup(group:any) {
    if(group){
      (this.codxListView.dataService as CRUDService).add(group).subscribe();
    }
  }

}
