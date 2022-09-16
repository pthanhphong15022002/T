import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService, FormModel } from 'codx-core';
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
  data:any = null;
  isShowCard:boolean = true;
  ratingVll:string ="";
  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  ) 
  { 

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.cardID.currentValue != changes.cardID.previousValue){
      this.getDataCard();
    }
  }

  ngOnInit(): void {
    this.getDataCard();
  }

  handleVllRating(cardType: string): void {
    if (cardType == CardType.Thankyou) {
      this.ratingVll = Valuelist.RatingThankYou;
    }
    else if (cardType == CardType.CommentForChange) {
      this.ratingVll = Valuelist.RatingCommentForChange;
    }
    else{
      this.ratingVll = Valuelist.CardType;
    }
    this.dt.detectChanges();
  }


  getDataCard(){
    if(!this.cardID){
      this.data = null;
      this.dt.detectChanges();
      return;
    }
    this.api
      .execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardAsync", this.cardID)
      .subscribe((res) => {
        if (res) {
          this.isShowCard = true;
          this.data = res;
          this.handleVllRating(this.data.cardType);
          this.dt.detectChanges();
        } 
    });
  }
}
