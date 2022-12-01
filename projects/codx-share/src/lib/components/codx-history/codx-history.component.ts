import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-history',
  templateUrl: './codx-history.component.html',
  styleUrls: ['./codx-history.component.css']
})
export class CodxHistoryComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() id:string = "";
  @Input() funcID:string = "";
  @Input() formModel:FormModel = null;
  listHistory:any = []; 
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthService,
    private dt:ChangeDetectorRef,
  ) 
  { 
    
  }

  ngOnInit(): void 
  {
    this.getDataAsync(this.objectID,this.id);
  }
  // get data logs
  getDataAsync(objectID:string,id:string){
    if(objectID || id)
    {
      this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "TrackLogsBusiness",
        "GetLogByIDAsync",
        [objectID,id]).
        subscribe((res:any[]) =>{
          if(res) 
          {
            this.listHistory = JSON.parse(JSON.stringify(res));
          }
      });
    }
  }

}
