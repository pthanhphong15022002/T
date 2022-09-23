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
  }



  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.reportUUID = urlParams.get('reportID')!;
    let predicate = urlParams.get('predicates');
    let dataValue = urlParams.get('dataValues');
    let printReport = urlParams.get('print');
    if(printReport && printReport =='true'){
      this.printReport();
    }
    let param = {};
    if(predicate != "undefined" && predicate !=undefined){
     if(dataValue !="undefined" && dataValue!= undefined){
       const _predicate = predicate.split(';').join("&&");
       param = { predicate: _predicate, dataValue: dataValue};
     }
    }
    this.param = param;
    this.parameters = [param];
  }

  public printReport() {
    this.print = true;
    setTimeout(() => {
      this.print = false;
    }, 10000);
  }
}
