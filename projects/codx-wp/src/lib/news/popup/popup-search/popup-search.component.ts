import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, CodxService, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';

@Component({
  selector: 'lib-popup-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss']
})
export class PopupSearchComponent implements OnInit {

  funcID:string = "";
  services:string = "WP";
  entityName:string = "WP_News";
  gridViewSetup:any = null;
  formModel:FormModel = null;
  dialogRef:DialogRef = null;
  @ViewChild("view") view : CodxFullTextSearch;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private codxService:CodxService,
    @Optional() dd?: DialogData,
    @Optional() dialog?:DialogRef
  ) 
  {
    this.funcID = dd.data;
    this.dialogRef = dialog;

  }

  ngOnInit(): void {
    this.getGridViewSetup();
  }

  onSelected(event:any){
    console.log(event)
  }

  getGridViewSetup(){
      this.cache.gridViewSetup(this.dialogRef.formModel.formName, this.dialogRef.formModel.gridViewName)
      .subscribe((grd) => {
        this.gridViewSetup = grd;
      });
  }

  clickViewDetail(data:any){
    this.api
    .execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'UpdateViewNewsAsync',
      data.recID
    )
    .subscribe((res:any) => {
      if(res){
        this.dialogRef.close();
        this.codxService.navigate('','/wp/news/'+this.funcID + '/' + data.category +'/' + data.recID);
      }
    });
  }

  clickClosePopup(){
    this.dialogRef.close();
  }

}
