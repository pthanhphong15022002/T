import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { isBuffer } from 'util';
import { CardType, Valuelist } from '../../models/model';

@Component({
  selector: 'lib-view-detail-cards',
  templateUrl: './view-detail-cards.component.html',
  styleUrls: ['./view-detail-cards.component.scss']
})
export class ViewDetailCardsComponent implements OnInit,OnChanges {

  @Input() cardID: string = "";
  @Input() cardType:string ="";
  @Input() formModel:FormModel;
  @Input() ratingVLL:string = "";   
  data:any = null;
  isShowCard:boolean = true;
  constructor
  (
    private api:ApiHttpService,
    private route:ActivatedRoute,
    private cache:CacheService,
    private dt:ChangeDetectorRef
  ) 
  { 

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.cardID.currentValue != changes.cardID.previousValue){
      this.getDataCard();
    }
  }

  ngOnInit() {
    this.getDataCard();
  }

  getDataCard(){
    if(!this.cardID){
      this.data = null;
      this.dt.detectChanges();
      return;
    }
    this.api
      .execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardInforAsync", [this.cardID])
      .subscribe((res) => {
        if (res) {
          console.log(res);
          this.data = res;
          this.dt.detectChanges();
        } 
    });
  }
}
