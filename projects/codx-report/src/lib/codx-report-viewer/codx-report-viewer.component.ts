import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ContextMenuComponent,
  Item,
  MenuEventArgs,
  MenuItemModel,
} from '@syncfusion/ej2-angular-navigations';
import { Browser } from '@syncfusion/ej2-base';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogRef,
  LangPipe,
  LayoutService,
  NotificationsService,
  SidebarModel,
} from 'codx-core';

@Component({
  selector: 'report-viewer',
  templateUrl: './codx-report-viewer.component.html',
  styleUrls: ['./codx-report-viewer.component.scss'],
})
export class CodxReportViewerComponent implements OnInit, AfterViewInit,OnChanges {
  @ViewChild('paramEle') paramEle: ElementRef<any>;
  @ViewChild('reportEle') reportEle: ElementRef<any>;
  @ViewChild('iframe', {static: false}) iframe: ElementRef;
  @ViewChild('contextmenu')
  public contextmenu: ContextMenuComponent;

  @Input() reportUUID: any;
  @Input() parameters: any = {};
  @Input() print: boolean = false;
  @Output() pinedItems = new EventEmitter<any>();
  lstParent: any;
  lstParamsNotGroup: any = [];
  lstPined: any[];
  objParam: any = {};
  moreFunc: any = [];
  missingLabel = '';
  param: any = {};
  user: any;
  menuItems: MenuItemModel[] = [
    {
      id: 'param',
      text: 'Tham số hiển thị',
      iconCss: 'icon-playlist_add text-muted',
    },
    {
      separator: true,
    },
  ];
  toolbarContainerCssClasses: string = '';
  maxPin: number = 5;
  dialog: DialogRef;
  private _user: any;
  urlSafe: any;
  src: any;
  private token: any;
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private cache: CacheService,
    private notification: NotificationsService,
    private layout: LayoutService,
    protected callfc: CallFuncService,
    private authStore: AuthStore,
    public sanitizer: DomSanitizer
  ) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    let predicate = '';
    if(this.token){
      if(changes['parameters']) this.parameters = changes['parameters'].currentValue;
      if(changes['reportUUID']) this.reportUUID = changes['reportUUID'].currentValue;
      if(this.parameters.predicate){
        predicate = this.parameters.predicate.split('&&').join(';');
      }
      this.src=`http://localhost:4203/r?token=${this._user.token}&reportID=${this.reportUUID}&predicates=${encodeURI(predicate)}&dataValue=${encodeURI(this.parameters.dataValue)}`;
      this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
      this.iframe && this.iframe.nativeElement.contentWindow.reload();
    }

  }



  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this._user = this.authStore.get();
    if(this._user) this.token = this._user.token;
    this.toolbarContainerCssClasses =
      this.layout.getStringCSSClasses('toolbarContainer');
    if (this.reportUUID && this.parameters) {
      let predicate = '';
      if(this.parameters.predicate){
        predicate = this.parameters.predicate.split('&&').join(';');
      }
      this.src=`http://localhost:4203/r?token=${this._user.token}&reportID=${this.reportUUID}&predicates=${encodeURI(predicate)}&dataValue=${encodeURI(this.parameters.dataValue)}`;
      this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
  }

  public printReport() {
    this.print = true;
    setTimeout(() => {
      this.print = false;
    }, 10000);
  }
}
