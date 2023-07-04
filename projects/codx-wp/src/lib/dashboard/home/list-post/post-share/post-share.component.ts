import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, CRUDService, CallFuncService, CodxService, DialogModel, FormModel } from 'codx-core';
import { PopupDetailComponent } from '../popup-detail/popup-detail.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wp-post-share',
  templateUrl: './post-share.component.html',
  styleUrls: ['./post-share.component.scss']
})
export class PostShareComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() refType:string = "";
  @Input() formModel:FormModel = null;

  loaded:boolean = false;
  data:any = null;

  constructor(
    private api: ApiHttpService,
    private codxService: CodxService,
    private callFC:CallFuncService,
    private dt: ChangeDetectorRef,
  ){

  }
  ngOnInit(): void {
    this.getData();
  }

  getData(){
    if(this.refType == "WP_Comments"){
      this.api.execSv("WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "GetPostByIDAsync",
      [this.objectID])
      .subscribe((res:any) => {
        this.loaded = true;
        this.data = res;
        this.dt.detectChanges();
      });
    }
    else if(this.refType == "WP_News"){
      this.api.execSv("WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "GetPostByIDAsync",
      [this.objectID])
      .subscribe((res:any) => {
        this.loaded = true;
        this.data = res;
        this.dt.detectChanges();
      });
    }
    else
    {
      this.api.execSv("FD",
      "ERM.Business.FD",
      "CardsBusiness",
      "GetCardFromWPAsync",
      [this.objectID])
      .subscribe((res:any) => {
        this.loaded = true;
        if(res.pattern){
          res.backgroundImg = environment.urlUpload + "/" + res.pattern.url;
        }
        this.data = res;
        this.dt.detectChanges();
      });
    }
  }
  // click view detail
  clickViewDetail(data){
    if(data){
      if(this.refType == "WP_News"){
        //cập nhật số lượng view
        this.api
        .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewAsync',
        [data.recID])
        .subscribe();
        // naviagte qua WP_News
        let url = `wp2/news/WPT02/${data.category}/${data.recID}`;
        this.codxService.navigate('',url);
      }
      else
      {
        let option = new DialogModel();
        option.FormModel = this.formModel;
        option.IsFull = true;
        option.zIndex = 999;
        this.callFC.openForm(
          PopupDetailComponent,
          '',
          0,
          0,
          '',
          data,
          '',
          option
        );
      }
    }
  }
}
