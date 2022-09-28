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
import { PopupParametersComponent } from '../popup-parameters/popup-parameters.component';

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
  public addDisabled  (args: MenuEventArgs) {
    if (args.item.text === 'Link') {
        args.element.classList.add('e-disabled');
    }
}

  openParamDialog(){
    this.dialog = this.callfc.openForm(
      PopupParametersComponent,"Tham số hiển thị",400,600,"",
      [this.lstParamsNotGroup, this.maxPin],""
    );
  this.dialog.closed.subscribe(res=> {
    res.event && this.loadParams();
    })
  }
  onCreated(): void {
    if (Browser.isDevice) {
        this.contextmenu.animationSettings.effect = 'ZoomIn';
    } else {
        this.contextmenu.animationSettings.effect = 'SlideDown';
    }
}
private loadParams(){
  this.objParam = this.param = {};
  this.api.exec<any>(
    "SYS",
    "ReportParametersBusiness",
    "GetReportParamAsync",
    this.reportUUID
  ).subscribe(res=>{
    if(res.parameters && res.parameters.length > 0){
      for(let i =0;i< res.parameters.length;i++){
        if(!res.parameters[i].dependences){
          res.parameters[i].isEnable = true;
        }
      }
    }
      this.lstParamsNotGroup = res.parameters;
      this.lstPined = res.parameters.filter(x=> x.isPin == true);
      if(res.maxPin){
        this.maxPin = parseInt(JSON.parse(res.maxPin.dataValue)['MaxPin']);
      }
  });
}

}
