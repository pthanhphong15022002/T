import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CardType, Valuelist } from '../../models/model';

@Component({
  selector: 'lib-view-detail-cards',
  templateUrl: './view-detail-cards.component.html',
  styleUrls: ['./view-detail-cards.component.scss']
})
export class ViewDetailCardsComponent implements OnInit,OnChanges {

  @Input() itemSelected: any = null;
  @Input() cardType:string ="";
  isShowCard:boolean = true;
  ratingVll:string ="";
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.cardType.currentValue != changes.cardType.previousValue){
      this.handleVllRating(this.itemSelected.cardType);
    }
  }

  ngOnInit(): void {
    this.handleVllRating(this.itemSelected.cardType);
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
  }

}
