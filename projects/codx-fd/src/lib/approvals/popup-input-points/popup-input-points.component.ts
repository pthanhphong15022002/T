import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-input-points',
  templateUrl: './popup-input-points.component.html',
  styleUrls: ['./popup-input-points.component.scss'],
})
export class PopupInputPointsComponent implements OnInit {
  dialogData: any = null;
  dialogRef: DialogRef = null;
  headerText = 'Chọn điểm';

  coins: number = 0;
  kudos: number = 0;
  min: number | null = null;
  max: number | null = null;


  recID: any;
  activeCoins: string = '0';
  activeKudos: string = '0';
  cardType: string;

  constructor(
    private api: ApiHttpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogData = dialogData?.data;
    this.dialogRef = dialogRef;
  }
  ngOnInit(): void {
    this.setData();
  }

  setData() {
    if (this.dialogData) {
      ({
        recID: this.recID,
        activeCoins: this.activeCoins,
        activeKudos: this.activeKudos,
        cardType: this.cardType,
      } = this.dialogData);
    }
    if(this.cardType) {
      if(this.cardType == '3') {
        this.max = 0;
      } else {
        this.min = 0;
      }
    }
  }

  changeCoins(e) {
    this.coins = e?.data;
  }

  changeKudos(e) {
    this.kudos = e?.data
  }

  submit() {
    this.api
      .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'HandleKudosPolicyAsync', [
        this.recID,
        this.coins,
        this.kudos,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialogRef.close(res);
        }
      });
  }

  reset() {
    this.coins = 0;
    this.kudos = 0;
  }
}
