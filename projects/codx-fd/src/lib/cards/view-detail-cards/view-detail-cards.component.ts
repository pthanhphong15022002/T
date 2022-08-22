import { Component, Input, OnInit } from '@angular/core';
import { CardType, Valuelist } from '../../models/model';

@Component({
  selector: 'lib-view-detail-cards',
  templateUrl: './view-detail-cards.component.html',
  styleUrls: ['./view-detail-cards.component.scss']
})
export class ViewDetailCardsComponent implements OnInit {

  @Input() itemSelected: any = null;
  isShowCard:boolean = true;
  ratingVll:string ="";
  constructor() { }

  ngOnInit(): void {
  }

  handleVllRating(cardType: string): void {
    if (cardType == CardType.Thankyou) {
      this.ratingVll = Valuelist.RatingThankYou;
      return;
    }
    if (cardType == CardType.CommentForChange) {
      this.ratingVll = Valuelist.RatingCommentForChange;
      return;
    }
  }

}
