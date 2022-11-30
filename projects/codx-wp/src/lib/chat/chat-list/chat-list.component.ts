import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxListviewComponent, CRUDService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { PopupAddGroupComponent } from './popup/popup-add-group/popup-add-group.component';

@Component({
  selector: 'wp-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit,  AfterViewInit {

  @Input() isOpen:boolean; // check open dropdown
  @Output() isOpenChange = new EventEmitter<boolean>();
  funcID:string = "WPT11";
  function:any = null;
  formModel:FormModel = new FormModel();
  grdViewSetUp:any = null;
  moreFC:any = null;
  @ViewChild("codxListView") codxListView : CodxListviewComponent
  constructor
  (
    private api:ApiHttpService,
    private signalRSV:SignalRService,
    private callFCSV:CallFuncService,
    private cache:CacheService,
    private notifySV:NotificationsService,
    private dt:ChangeDetectorRef,
  ) 
  { 
  }

  ngOnInit(): void 
  {
    // get function - gridViewsetup
    if(this.funcID)
    {
      this.cache.functionList(this.funcID).subscribe((func:any) =>{
        if(func)
        {
          console.log(func);
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.cache.gridViewSetup(func.formName,func.gridViewName).subscribe((grd:any)=>{
            if(grd)
            {
              console.log(grd);
              this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
              this.dt.detectChanges();
            }
          });
          this.cache.moreFunction(func.formName,func.gridViewName).subscribe((mFC:any)=>{
            if(mFC)
            {
              console.log(mFC);
              this.moreFC = JSON.parse(JSON.stringify(mFC));
            }
          });
        }
      });
    }
  }

  ngAfterViewInit(){
    this.signalRSV.signalREmit.subscribe((res:any) =>{
      debugger
      if(res)
      {
        console.log('openGroup: ',res);
        if(this.codxListView)
        {
          (this.codxListView.dataService as CRUDService).update(res).subscribe();
        }
      }
    })
  }
  // searrch
  search(event:any){

  }
  // click group chat
  clickGroupChat(group:any){
    if(group)
    {
      this.api.execSv("WP","ERM.Business.WP","ChatBusiness","OpenGroupChatAsync",[group.groupID])
      .subscribe((res:any) =>
      {
        if(res)
        {
          this.signalRSV.sendData(res,"OpenGroupChat");
        }
      });
    }
  }

  // open popup add group chat 
  openPopupAddGroup()
  {
    if(this.function)
    {
      this.isOpen = false;
      this.isOpenChange.emit(this.isOpen);
      let option = new DialogModel();
      option.DataService = this.codxListView.dataService;
      option.FormModel = this.formModel;
      let data = {
        headerText : "Tạo nhóm chat",
        gridViewSetUp: this.grdViewSetUp
      }
      let popup = this.callFCSV.openForm(PopupAddGroupComponent,"",0,0,this.function.funcID,data,"",option)
      popup.closed.subscribe((res:any) => {
        this.isOpen = true;
        this.isOpenChange.emit(this.isOpen);
        if(res.event)
        {
          let group = res.event;
          (this.codxListView.dataService as CRUDService).add(group).subscribe();
        }
      });
    }
  }
}
