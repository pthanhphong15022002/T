import { AfterViewInit, Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { UIDetailComponent, ViewsComponent } from 'codx-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ep-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.css']
})
export class PaymentDetailComponent extends UIDetailComponent implements AfterViewInit, OnChanges, OnDestroy {
  
  @Input() view:ViewsComponent;
  data:any;
  subcriptions = new Subscription();
  constructor
  (
    private injector:Injector,
  ) 
  {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.recID && !changes.recID.firstChange && changes.recID.currentValue != changes.recID.previousValue)
    {
      this.loadRequestDetail(changes.recID.currentValue);
    }
  }
  

  override onInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  loadRequestDetail(recID:string){
    let subcribeApi =  this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,this.view.funcID])
    .subscribe((res:any) => 
    {
      if(res)
      {
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
    this.subcriptions.add(subcribeApi);
  }
}
