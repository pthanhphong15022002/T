import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogModel } from 'codx-core';

@Component({
  selector: 'codx-comment-temp',
  templateUrl: './codx-comment-temp.component.html',
  styleUrls: ['./codx-comment-temp.component.scss']
})
export class CodxCommentTempComponent implements OnInit {

  @Input() objectID:string = null;
  services:string = "BG";
  assamplyName:string = "ERM.Business.BG";
  className:string = "TrackLogsBusiness";
  entityName:string = "BG_TrackLogs"
  lstData:any[] = [];
  countData:number = 0;
  @ViewChild("tmpListItem") tmpListItem:TemplateRef<any>;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFC:CallFuncService
  ) { }

  ngOnInit(): void 
  {
    this.getDataAsync(this.objectID);
  }


  getDataAsync(pObjectID:string){
    console.log(pObjectID);
    if(pObjectID)
    {
      this.api.execSv(this.services,this.assamplyName,this.className,"GetCommentTrackLogByObjectIDAsync",[pObjectID])
      .subscribe((res:any[]) => {
        if(res)
        {
          this.lstData = res[0];
          this.countData = res[1];
        }
      });
    }
  }

  openPopup(){
    if(this.tmpListItem){
      let option = new DialogModel();
      this.callFC.openForm(this.tmpListItem,"",400,500,"",null,"",option);
    }
  }
}
