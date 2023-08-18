import { Component, Injector, OnInit } from '@angular/core';
import { CacheService, CodxService, LayoutBaseComponent, LayoutService, PageTitleService } from 'codx-core';

@Component({
  selector: 'codx-ws-header',
  templateUrl: './codx-ws-header.component.html',
  styleUrls: ['./codx-ws-header.component.css']
})
export class CodxWsHeaderComponent extends LayoutBaseComponent{
  override onAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  title$:any;
  asideTheme:any;
  logo$:any;

  override onInit(): void {
    this.title$ = this.pageTitle.title.asObservable();
    this.asideTheme = this.layout.getProp('aside.theme') as string;
    this.logo$ = this.layout.logo.asObservable();

    this.getFuncList();
  }
 
  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    override codxService: CodxService,
  ) {
    super(inject);
    this.module = 'WS';
  }

  getFuncList()
  {
    this.codxService.getFuncs("WS").subscribe(item=>{
      debugger
    })
   
  }

}
