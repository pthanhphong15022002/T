import {
  AfterViewInit,
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
  constructor(
    private api: ApiHttpService,
    private signalRSV: SignalRService,
    private callFCSV: CallFuncService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private dt: ChangeDetectorRef
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
      let option = new DialogModel();
      this.callFCSV.openForm(ChatBoxComponent,"",0,0,"WP",group.groupID,"",option);
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
        300,
        500,
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


  addBoxChat(){
    //content
    // if (content instanceof TemplateRef) {
    //   var viewRef = content.createEmbeddedView({ $implicit: dialogRef });
    //   this._applicationRef.attachView(viewRef);
    //   viewRef.detectChanges();
    //   let contentDialog = viewRef.rootNodes;

    //   if (contentDialog.length > 1) {
    //     var contain = document.createElement('div');
    //     contain.classList.add('container-dialog');
    //     contentDialog.forEach((ele: any) => {
    //       contain.append(ele);
    //     });
    //     contentEle = contain;
    //   } else {
    //     contentEle = contentDialog[0] as HTMLElement;
    //   }

    //   if (contentEle instanceof HTMLElement) {
    //     if (contentEle.tagName == 'CODX-FORM') {
    //       var div$ = contentEle.children[0];
    //       headerEle = div$.children[0] as HTMLElement;
    //       contentEle = div$.children[1] as HTMLElement;
    //       footerEle = div$.children[2] as HTMLElement;
    //     }
    //   }
    // } else if (typeof content === 'string') {
    //   contentEle = content;
    // } else {
    //   //const contentCmptFactory =
    //   // this.componentFactoryResolver.resolveComponentFactory(content);
    //   let odt: DialogData = { data: data };

    //   const modalContentInjector = Injector.create({
    //     providers: [
    //       { provide: DialogData, useValue: odt },
    //       { provide: DialogRef, useValue: dialogRef },
    //     ],
    //   });
    //   //const componentRef = contentCmptFactory.create(modalContentInjector);
    //   let componentRef = viewContainerRef.createComponent(content, {
    //     injector: modalContentInjector,
    //   });
    //   componentRef.changeDetectorRef.detectChanges();
    //   let contentDialog = componentRef.location.nativeElement;
    //   contentEle = contentDialog;

    //   if (contentDialog.childElementCount > 0) {
    //     var ele: HTMLElement = contentDialog.children[0];
    //     if (ele.tagName == 'CODX-FORM') {
    //       var div$ = ele.children[0];
    //       headerEle = div$.children[0] as HTMLElement;
    //       contentEle = div$.children[1] as HTMLElement;
    //       footerEle = div$.children[2] as HTMLElement;
    //     }
    //   }
    // }
  }
}
