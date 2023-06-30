import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';

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
  showmore: boolean = false;
  showSM: boolean = false;
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: '',
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: '',
      template: null,
    },
    {
      name: 'Comment',
      textDefault: 'Bình luận',
      isActive: false,
      icon: '',
      template: null,
    },
  ];
  objectID: string;

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

    this.api.execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardInforAsync", [this.cardID]).subscribe((res: any) => {
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
        this.api.execSv<any>('WP', 'WP', 'CommentsBusiness', 'GetPostByCardIDAsync', [res.recID]).subscribe((postRes) => {
        if (postRes) {
          if (postRes.attachments > 0) {
            this.objectID = postRes.recID;
          }
        }
      });
        this.dt.detectChanges();
      }
      const textElement = document.getElementById('situation');
      const lineHeight = parseInt(getComputedStyle(textElement).lineHeight);
      const height = textElement.clientHeight;
      const lineCount = Math.round(height / lineHeight);
      if(lineCount && lineCount > 3){
        this.showSM = true;
        this.showmore = true;
      } else {
        this.showmore = false;
        this.showSM = false;
      }
    });
  }

  showMore(){
    this.showmore = false;
    this.showSM = false;
  }
}
