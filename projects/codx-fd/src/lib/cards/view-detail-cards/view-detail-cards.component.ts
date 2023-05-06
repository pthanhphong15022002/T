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
export class ViewDetailCardsComponent implements OnInit, OnChanges {
  @Input() cardID: string = "";
  @Input() cardType: string = "";
  @Input() formModel: FormModel;
  @Input() ratingVLL: string = "";

  isShowCard: boolean = true;

  data: any = null;
  behavior: any[] = [];

  constructor(private api: ApiHttpService, private route: ActivatedRoute, private cache: CacheService, private dt: ChangeDetectorRef) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cardID.currentValue != changes.cardID.previousValue) {
      this.getDataCard();
    }
  }

  ngOnInit() {
    this.getDataCard();
  }

  getDataCard() {
    if (!this.cardID) {
      this.data = null;
      this.dt.detectChanges();
      return;
    }

    this.api.execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardInforAsync", [this.cardID]).subscribe((res) => {
      if (res) {
        console.log(res);
        this.data = res;
        this.behavior = [];
        if (this.data.behaviorName) {
          if (this.data.behaviorName.includes(';')) {
            let lstB = this.data.behaviorName.split(';');
            for (let i = 0; i < lstB.length; i++) {
              const element = lstB[i];
              this.behavior.push(element);
            }
          } else {
            this.behavior.push(this.data.behaviorName);
          }
        }
        this.dt.detectChanges();
      }
    });
  }
}
