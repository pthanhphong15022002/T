import { AfterViewInit, Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UIDetailComponent, FormModel } from 'codx-core';

@Component({
  selector: 'ep-payment-requests-view-detai',
  templateUrl: './payment-requests-view-detai.component.html',
  styleUrls: ['./payment-requests-view-detai.component.css']
})
export class PaymentRequestsViewDetaiComponent extends UIDetailComponent implements OnChanges, AfterViewInit {

  @Input() formModel:FormModel;
  @Input() data:any;
  constructor
  (
    injector:Injector
  ) 
  {
    super(injector);
  }

  override onInit(): void {
    this.loadDataInfo(this.recID,this.funcID);
  }

  ngAfterViewInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.recID && !changes.recID?.firstChange && changes.recID?.currentValue != changes.recID?.previousValue)
    {
      this.loadDataInfo(this.recID,this.funcID);
    }
  }

  loadDataInfo(recID:string,funcID:string){
    this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,funcID])
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  changeDataMF(event:any){

  }
}
