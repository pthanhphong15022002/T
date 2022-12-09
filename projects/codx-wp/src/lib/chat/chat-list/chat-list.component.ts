import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxListviewComponent,
  CRUDService,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { PopupAddGroupComponent } from './popup/popup-add-group/popup-add-group.component';

@Component({
  selector: 'wp-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit, AfterViewInit {
  
  @Input() isOpen: boolean; // check open dropdown
  @Output() isOpenChange = new EventEmitter<boolean>();
  funcID: string = 'WPT11';
  function: any = null;
  formModel: FormModel = new FormModel();
  grdViewSetUp: any = null;
  moreFC: any = null;
  @ViewChild('codxListView') codxListView: CodxListviewComponent;
  @ViewChild("chatBox") chatBox:TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private callFCSV: CallFuncService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private dt: ChangeDetectorRef,
    private _applicationRef: ApplicationRef,
  ) {}

  ngOnInit(): void {
    // get function - gridViewsetup
    if (this.funcID) {
      this.cache.functionList(this.funcID).subscribe((func: any) => {
        if (func) {
          console.log(func);
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                console.log(grd);
                this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
                this.dt.detectChanges();
              }
            });
          this.cache
            .moreFunction(func.formName, func.gridViewName)
            .subscribe((mFC: any) => {
              if (mFC) {
                console.log(mFC);
                this.moreFC = JSON.parse(JSON.stringify(mFC));
              }
            });
        }
      });
    }
  }

  ngAfterViewInit() {
    this.signalRSV.signalGroup.subscribe((res: any) => {
      if (res) 
      {
        (this.codxListView.dataService as CRUDService).add(res).subscribe();
      }
    });
  }
  // searrch
  search(event: any) {

  }
  // click group chat - chat box
  openChatBox(group: any) {
    if (group?.groupID) 
    {
      this.addBoxChat(group);
    }
  }

  // open popup add group chat
  openPopupAddGroup() {
    if (this.function) {
      this.isOpen = false;
      this.isOpenChange.emit(this.isOpen);
      let option = new DialogModel();
      option.DataService = this.codxListView.dataService;
      option.FormModel = this.formModel;
      let data = {
        headerText: 'Tạo nhóm chat',
        gridViewSetUp: this.grdViewSetUp,
      };
      let popup = this.callFCSV.openForm(
        PopupAddGroupComponent,
        '',
        0,
        0,
        this.function.funcID,
        data,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        this.isOpen = true;
        this.isOpenChange.emit(this.isOpen);
        // if (res.event) 
        // {
        //   let group = res.event;
        //   (this.codxListView.dataService as CRUDService).add(group).subscribe();
        // }
      });
    }
  }


  addBoxChat(group:any){
    let viewRef = this.chatBox.createEmbeddedView({ $implicit: group });
    this._applicationRef.attachView(viewRef);
    viewRef.detectChanges();
    let html = viewRef.rootNodes[0];
     let elementContainer = document.querySelector(".container-chat");
     if(elementContainer)
     {
      let length = elementContainer.children.length;
      if(length < 3) // add box chat
      {
        html.setAttribute('style',`
        position: fixed!important;
        bottom: 0px;
        right: ${(length*320 + 100)}px;
        margin-top: -500px;
        background-color: white;`)
        html.setAttribute('id',group.groupID)
        elementContainer.append(html);
      }
      else // tạo bong bóng chat
      {
        
      }
      
    }
  }
}
