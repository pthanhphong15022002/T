import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, Injector, HostBinding } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CacheService, UIComponent } from 'codx-core';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
import { CodxOdService } from '../../codx-od.service';
import { convertHtmlAgency, extractContent, getIdUser } from '../../function/default.function';
@Component({
  selector: 'app-od-searching',
  templateUrl: './searching.component.html',
})

export class SearchingComponent extends UIComponent implements OnDestroy, AfterViewInit {

  @ViewChild("view") views: CodxFullTextSearch;
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  service = "OD"
  entityName = "OD_Dispatches"
  formModel: any = {};
  @HostBinding('style') get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('margin-top: -30px; padding: 12px;');
  }
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
  }
  ngOnDestroy(): void {
    this.hideToolbar.SetLayout.next(true);
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
  onSelected(e: any) {
    // alert(JSON.stringify(e));
  }
}
