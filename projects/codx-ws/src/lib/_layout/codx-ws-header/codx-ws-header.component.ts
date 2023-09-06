import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { AuthStore, CacheService, CodxService, LayoutBaseComponent, LayoutService, PageTitleService } from 'codx-core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'codx-ws-header',
  templateUrl: './codx-ws-header.component.html',
  styleUrls: ['./codx-ws-header.component.css']
})
export class CodxWsHeaderComponent extends LayoutBaseComponent{
  override onAfterViewInit(): void {
    
  }

  title$:any;
  asideTheme:any;
  logo$:any;
  funcList:any;
  selectedIndex = 0;
  funcID:any;
  userInfo:any;
  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    override codxService: CodxService,
    private codxWsService: CodxWsService,
    private authStore: AuthStore,
  ) {
    super(inject);
    this.module = 'WS';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
    this.userInfo = this.authStore.get();
  }

  override onInit(): void {
    this.title$ = this.pageTitle.title.asObservable();
    this.asideTheme = this.layout.getProp('aside.theme') as string;
    this.logo$ = this.layout.logo.asObservable();

    this.getFuncChange();
    this.getModuleByUserID();
  }
 
  
  
  getFuncChange()
  {
    this.codxWsService.funcChange.subscribe(item=>{
      if(item) this.getFuncList(item);
    })
  }

  getFuncList(funcID:any)
  {
    var fucList = this.codxWsService.loadFuncList(this.module) as any;

    if(isObservable(fucList))
    {
      fucList.subscribe((item : any)=>{
        if(item) {
          this.funcList = item.filter(x=>x.parentID == this.module && (x.functionType == "T" || x.functionType == "D" || x.functionType == "R" ));
          this.selectedIndex = this.funcList.findIndex(x=>x.functionID == funcID);
        }
      })
    }
    else {
      this.funcList = fucList.filter(x=>x.parentID == this.module && (x.functionType == "T" || x.functionType == "D" || x.functionType == "R" ));
      this.selectedIndex = this.funcList.findIndex(x=>x.functionID == funcID);
    }
  }

  getModuleByUserID()
  {
    var module = this.codxWsService.loadModuleByUserID(this.userInfo?.userID) as any;
    if(isObservable(module))
    {
      module.subscribe((item:any)=>{
        debugger
        if(item) var listModule = item.map(function(x){return x.module;});
      })
    }
    else
    {
      debugger
      var listModule = module.map(function(x){return x.module;});
    }
  }
  getDashboardOrReport()
  {

  }

  selectedChange(i:any , item:any)
  {
    this.selectedIndex = i;
    if(item.functionType == "D" || item.functionType == "R") return;
    this.codxService.navigate("","/"+item.url);
  }
}
