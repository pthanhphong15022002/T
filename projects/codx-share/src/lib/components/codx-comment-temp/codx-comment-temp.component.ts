import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
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
    if(pObjectID)
    {
      this.api.execSv(this.services,this.assamplyName,this.className,"GetTotalCommentsAsync",[pObjectID])
      .subscribe((res:number) => {
        if(res)
        {
          this.countData = res;
        }
      });
    }
  }

  openPopup(){
    if(this.tmpListItem){
      let option = new DialogModel();
      let popup =  this.callFC.openForm(this.tmpListItem,"",400,500,"",null,"",option);
      popup.closed.subscribe((res:any) => {
        if(res)
        {
          this.getDataAsync(this.objectID);
        }
      });
    }
  }
}
