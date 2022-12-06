import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-history',
  templateUrl: './codx-history.component.html',
  styleUrls: ['./codx-history.component.css']
})
export class CodxHistoryComponent implements OnInit,OnChanges {

  @Input() objectID:string = "";
  @Input() funcID:string = "";
  @Input() formModel:FormModel = null;
  pridicate:string = "";
  dataValue:string = "";
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
    this.getDataAsync(this.objectID);
  }

  // change objectID reload logs
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.objectID?.previousValue != changes?.objectID?.currentValue) {
      this.getDataAsync(this.objectID);
    }
  }
  // get data logs
  getDataAsync(objectID:string){
    if(objectID)
    {
      this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "TrackLogsBusiness",
        "GetLogByIDAsync",
        [objectID]).
        subscribe((res:any[]) =>{
          if(res) 
          {
            this.listHistory = JSON.parse(JSON.stringify(res));
          }
      });
    }
  }

}
