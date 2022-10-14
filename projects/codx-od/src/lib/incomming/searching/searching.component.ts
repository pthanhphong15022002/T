import { Component, OnInit,  OnDestroy, AfterViewInit, ViewChild, Injector } from '@angular/core';
import { CacheService, UIComponent } from 'codx-core';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
import { CodxOdService } from '../../codx-od.service';
import { convertHtmlAgency, extractContent, getIdUser } from '../../function/default.function';
@Component({
  selector: 'app-od-searching',
  templateUrl: './searching.component.html',
})

export class SearchingComponent extends UIComponent implements  OnDestroy , AfterViewInit {

  @ViewChild("view") views : CodxFullTextSearch;
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  funcID = "ODT31";
  service = "OD"
  entityName = "OD_Dispatches"
  formModel : any = {};
  constructor( 
    inject: Injector, 
    // private cache: CacheService,
    private hideToolbar : CodxOdService
  ){
    super(inject);
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

  getGridViewSetup(){
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
  onSelected(e:any)
  {
    alert(JSON.stringify(e));
  }

  testSearch()
  {
    this.views!.filter = {"AgencyName" : ["Bảo"]};
    this.views.searchText();
  }
}
