import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { change } from '@syncfusion/ej2-grids';
import { ApiHttpService, FormModel } from 'codx-core';

@Component({
  selector: 'fd-detail-gift',
  templateUrl: './view-detail-gift.component.html',
  styleUrls: ['./view-detail-gift.component.scss']
})
export class ViewDetailGiftComponent implements OnInit,OnChanges {

  @Input() objectID:string = "";
  @Input() formModel:FormModel;
  service:string = "FD";
  assemblyName:string = "ERM.Business.FD";
  className:string = "GiftTransBusiness"
  data:any = null;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  ) { }
  

  ngOnInit(): void {
    if(this.objectID){
      this.getDataInfor(this.objectID);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['objectID'] && (changes['objectID'].currentValue !=  changes['objectID'].previousValue)){
      this.getDataInfor(this.objectID);
    }
  }
  getDataInfor(objectID:string){
    if(!objectID) return;
    this.api.execSv(this.service,this.assemblyName,this.className,"GetGiftTranInforAsync",objectID)
    .subscribe((res:any) => {
      if(res){
        this.data = res;
        this.dt.detectChanges();
      }
    })
  }
  clickUpdateGiftTran(){
    let status = "2";
    this.api.execSv
    ( this.service,
      this.assemblyName,
      this.className,
      "UpdateStatusAsync",
      [this.data.recID,status]).subscribe((res:any) =>
      {
        if(res){
          this.data.status == status;
          this.dt.detectChanges();
        }
      });
  }
}
