import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, Injector, HostBinding, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CacheService, CodxService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
import { CodxOdService } from '../../codx-od.service';
import { convertHtmlAgency, extractContent, getIdUser } from '../../function/default.function';
import { LayoutModel } from 'codx-core/lib/models/layout.model';
@Component({
  selector: 'app-od-searching',
  templateUrl: './searching.component.html',
})

export class SearchingComponent extends UIComponent implements OnDestroy, AfterViewInit {
  @ViewChild("viewFullText") viewFullText: CodxFullTextSearch;
  @ViewChild('template') template: TemplateRef<any>;
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  service = "OD"
  entityName = "OD_Dispatches"
  formModel: any = {};
  layoutModel: LayoutModel
  views: Array<ViewModel> | any = [];
  // @HostBinding('style') get myStyle(): SafeStyle {
  //   return this.sanitizer.bypassSecurityTrustStyle('margin-top: -30px; padding: 12px;');
  // }
  constructor(
    inject: Injector,
    // private cache: CacheService,
    private sanitizer:DomSanitizer,
    private hideToolbar: CodxOdService
  ) {
    super(inject);
    this.funcID = "ODT6";
   
  }
  ngAfterViewInit(): void {
    this.hideToolbar.SetLayout.next(false);
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.template,
        },
      }
    ];
    //this.setLayoutToolBar();
  }
  ngOnDestroy(): void {
    this.hideToolbar.SetLayout.next(true);
    //this.getLayoutToolBar()

  }

  setLayoutToolBar()
  {
    var elements = document.getElementsByClassName('toolbar-fixed');
    while(elements.length > 0){
      elements[0].classList.remove('toolbar-fixed');
    }
  }

  getLayoutToolBar()
  {
    var elements = document.getElementsByClassName('aside-enabled');
    while(elements.length > 0){
      elements[0].classList.add('toolbar-fixed');
    }
  }

  onInit(): void {
    this.getGridViewSetup();
  }

  getGridViewSetup() {
    this.cache.functionList(this.funcID).subscribe((fuc) => {
      this.formModel.entityName = fuc?.entityName;
      this.formModel.formName = fuc?.formName;
      this.formModel.funcID = fuc?.functionID;
      this.formModel.gridViewName = fuc?.gridViewName;
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetup = grd;
        });
    });
  }
  onSelected(e: any ) {
    var functionID = e?.unbounds?.functionID;
    if(!functionID) return;
    
    this.codxService.navigate("","/"+"od/dispatches/"+functionID+"?predicate=RecID=@0&dataValue=" + e?.recID);
  }
}
