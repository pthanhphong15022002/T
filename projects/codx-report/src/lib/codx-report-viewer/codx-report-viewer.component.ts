import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ContextMenuComponent, Item, MenuEventArgs, MenuItemModel } from '@syncfusion/ej2-angular-navigations';
import { Browser } from '@syncfusion/ej2-base';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogRef, LangPipe, LayoutService, NotificationsService, SidebarModel } from 'codx-core';
import { PopupParametersComponent } from '../popup-parameters/popup-parameters.component';

@Component({
  selector: 'report-viewer',
  templateUrl: './codx-report-viewer.component.html',
  styleUrls: ['./codx-report-viewer.component.scss'],
})
export class CodxReportViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('paramEle') paramEle: ElementRef<any>;
  @ViewChild('reportEle') reportEle: ElementRef<any>;
  @ViewChild('contextmenu')
  public contextmenu: ContextMenuComponent;

  @Input() reportUUID: any ;
  @Input() parameters: any = {};
  @Input() print: boolean = false;
  @Output() pinedItems = new  EventEmitter<any>();
  lstParent: any;
  lstParamsNotGroup: any = [];
  lstPined: any [];
  collapses: any = [];
  objParam: any = {};
  moreFunc: any =  [];
  missingLabel = '';
  param: any = {

  };
  user: any;
  menuItems: MenuItemModel[] = [
    {
        id: "param",
        text: 'Tham số hiển thị',
        iconCss: 'icon-playlist_add text-muted'
    },
    {
      separator: true
    },
  ];
  public isCollapsed = false;
  toolbarContainerCssClasses: string = '';
  maxPin: number = 5;
  dialog: DialogRef;
  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private cache: CacheService,
    private notification: NotificationsService,
    private layout: LayoutService,
    protected callfc: CallFuncService
  ) {
    var pipe = new LangPipe(this.cache);
    pipe.transform('Thiếu', 'lblMissing', 'Sys').subscribe(
      res => {
        this.missingLabel = res;
      }
    );
    this.moreFunc = [
      {
        id: 'btnEdit',
        icon: 'icon-list-chechbox',
        text: 'Sửa',
      },
      {
        id: 'btnDelete',
        icon: 'icon-list-chechbox',
        text: 'Xóa',
      },
    ];
  }
  public addDisabled  (args: MenuEventArgs) {
    if (args.item.text === 'Link') {
        args.element.classList.add('e-disabled');
    }
}



  menuSelect(evt: any){
    switch(evt.item.properties.id){
      case 'param':
        this.openParamDialog();
        break;
    };

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

  // Event triggers once the context menu rendering is completed.
  onCreated(): void {
      if (Browser.isDevice) {
          this.contextmenu.animationSettings.effect = 'ZoomIn';
      } else {
          this.contextmenu.animationSettings.effect = 'SlideDown';
      }
  }

  click(evt: any){
    console.log(evt);

  }

  public collapse(evt?: any){
    if(this.paramEle && this.paramEle.nativeElement.classList.contains("d-none")){
      this.paramEle.nativeElement.classList.remove("d-none");
      if(this.reportEle && this.reportEle.nativeElement.classList.contains("col-12")){
        this.reportEle.nativeElement.classList.remove("col-12");
        this.reportEle.nativeElement.classList.add("col-9");
      }
      this.isCollapsed = false;
    }
    else{
      if(this.paramEle){
        this.paramEle.nativeElement.classList.add("d-none");
        if(this.reportEle && this.reportEle.nativeElement.classList.contains("col-9")){
          this.reportEle.nativeElement.classList.remove("col-9");
          this.reportEle.nativeElement.classList.add("col-12");
        }
        this.isCollapsed = true;
      }
    }

  }

  ngAfterViewInit(): void {
    if (this.reportEle) {
      let height = this.reportEle.nativeElement.offsetHeight;
      if (this.paramEle) {
        this.paramEle.nativeElement.style.height = height + 'px';
      }
    }

  }

  ngOnInit(): void {
    this.toolbarContainerCssClasses = this.layout.getStringCSSClasses('toolbarContainer');
    this.loadParams();

  }

  public changeValueDate(evt: any, dependenceChange?:any) {
    if(dependenceChange){
      console.log('dependenceChange',evt);
    }
    else{
      console.log(evt);

    }
  }

  public valueChange(evt: any, dependenceChange?:any, type?:any) {
    if(dependenceChange){
      if(type && (type == 'switch' || type == 'checkbox')){
        this.objParam[evt.field] = evt.data;
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.dependences == evt.field);
            if(field){
               field.isEnable = evt.data;
               field = {...field};
            }
           }
        }
      }
      else{
        this.objParam[evt.field] = evt.data;
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.dependences == evt.field);
            if(field){
               field.isEnable = true;
               field = {...field};
            }
           }
        }
      }
      this.dt.detectChanges();
    }
    else{
      if(this.checkDependence(evt.field)){
        this.objParam[evt.field] = evt.data;

      }
      else{
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.controlName == evt.field);
            if(field && field.defaultValue){
               field.defaultValue = undefined;
            }
           }
        }
      }
    }
  }

  public  printReport(){
    this.print = true;
    setTimeout(()=>{this.print = false}, 10000)
  }

  collapseChange(evt: any, eleID?: string) {
    let idx = this.lstParent.findIndex(x=> x == eleID);
    let ele = document.getElementById(eleID);
    if(ele){
      this.collapses[idx] = !this.collapses[idx];
      if (!this.collapses[idx]) {
        ele.classList.add('border-bottom-primary');
      } else {
        if (
          ele.classList.contains(
            'border-bottom-primary'
          )
        ) {
          ele.classList.remove('border-bottom-primary');
        }
      }
    }

  }

  restoreDefault(){
    this.loadParams();
  }

  apply(){
    this.lstParamsNotGroup.forEach((item:any)=>{
      if(item.dependences){
        if(!this.objParam[item.dependences]){
          delete this.objParam[item.controlName]
        }
      }
    })
    this.param = undefined;
    this.param = {...this.objParam};

  }


  private groupBy(arr: any, key: any){
    return arr.reduce(function (r, a) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  private checkDependence(controlName: any){
    if(this.lstParamsNotGroup && this.lstParamsNotGroup.length > 0){
      let pr = this.lstParamsNotGroup.find(x=> x.controlName == controlName);
      if(pr && pr.dependences){
        if(!this.objParam[pr.dependences]){
          let depenObj = this.lstParamsNotGroup.find(p=>p.controlName == pr.dependences);
          depenObj && this.notification.notify(this.missingLabel +" "+ depenObj.labelName);
          return false;
        }
        return true
      }
      else {
        return true;
      }
    }
    return false;
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
        this.parameters = this.groupBy(res.parameters,'parentName');
        this.lstParent = Object.keys(this.parameters);
        this.lstParent.forEach(element => {
           this.collapses.push({[element]: false});});
        this.lstPined = res.parameters.filter(x=> x.isPin == true);
        this.pinedItems.emit(this.lstPined);
        if(res.maxPin){
          this.maxPin = parseInt(JSON.parse(res.maxPin.dataValue)['MaxPin']);
        }
    });
}
}
