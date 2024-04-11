import { AfterViewInit, Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { UIDetailComponent, ViewsComponent } from 'codx-core';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ep-advance-detail',
  templateUrl: './advance-detail.component.html',
  styleUrls: ['./advance-detail.component.css']
})
export class AdvanceDetailComponent extends UIDetailComponent implements AfterViewInit,OnChanges,OnDestroy {

  @Input() view:ViewsComponent;
  @Input() data:any;

  runMode:string = "";
  releaseCategory:string = "";
  subcriptions = new Subscription();
  constructor
  (
    private injector:Injector,
  ) 
  {
    super(injector);
  }
  

  override onInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.recID && !changes.recID.firstChange && changes.recID.currentValue != changes.recID.previousValue)
    {
      this.loadRequestDetail(changes.recID.currentValue);
    }
  }
  
  ngAfterViewInit(): void {
    if(this.view)
    {
      let subcribeApi = this.api.execSv(
        'ES',
        'ERM.Business.ES',
        'CategoriesBusiness',
        'GetCategoryByEntityNameAsync',
        [this.view.entityName])
        .subscribe((res:any) => 
        {
          this.releaseCategory = res;
        });
      this.subcriptions.add(subcribeApi);
    }
  }
  
  ngOnDestroy(): void {
    this.subcriptions.unsubscribe();
  }

  loadRequestDetail(recID:string){
    this.api.execSv("EP","EP","RequestsBusiness","GetRequestDetailAsync",[recID,this.view.funcID])
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.detectorRef.detectChanges();
      }
    });
  }
}
