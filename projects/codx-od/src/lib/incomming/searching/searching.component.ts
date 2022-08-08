import { Component, OnInit,  OnDestroy, AfterViewInit } from '@angular/core';
import { CacheService } from 'codx-core';
import { CodxOdService } from '../../codx-od.service';
import { convertHtmlAgency, extractContent, getIdUser } from '../../function/default.function';
@Component({
  selector: 'app-od-searching',
  templateUrl: './searching.component.html',
})

export class SearchingComponent implements OnInit ,  OnDestroy , AfterViewInit {
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  funcID = "ODT31";
  formModel : any = {};
  constructor(  
    private cache: CacheService,
    private hideToolbar : CodxOdService
  ){
  }
  ngAfterViewInit(): void {
    //this.hideToolbar.SetLayout.next(false);
    
  }
  ngOnDestroy(): void {
    this.hideToolbar.SetLayout.next(true);
  }

  ngOnInit(): void {
    //
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
}
