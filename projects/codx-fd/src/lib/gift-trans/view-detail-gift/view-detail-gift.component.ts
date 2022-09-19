import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { change } from '@syncfusion/ej2-grids';
import { ApiHttpService, FormModel } from 'codx-core';

@Component({
  selector: 'fd-detail-gift',
  templateUrl: './view-detail-gift.component.html',
  styleUrls: ['./view-detail-gift.component.scss']
})
export class ViewDetailGiftComponent implements OnInit,OnChanges {

  @Input() giftID:string = "";
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
    this.getDataInfor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.giftID && (changes.giftID.currentValue !=  changes.giftID.previousValue)){
      this.getDataInfor();
    }
  }
  getDataInfor(){
    this.api.execSv(this.service,this.assemblyName,this.className,"GetGiftTranInforAsync",this.giftID)
    .subscribe((res:any) => {
      if(res){
        this.data = res;
        this.dt.detectChanges();
      }
    })
  }
}
