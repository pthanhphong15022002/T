import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, Util } from 'codx-core';
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'lib-popup-approval',
  templateUrl: './popup-approval.component.html',
  styleUrls: ['./popup-approval.component.scss'],
})
export class PopupApprovalComponent implements OnInit {
  dialogData: any = null;
  dialogRef: DialogRef = null;
  headerText = 'Xét duyệt';

  coins: number = 0;
  kudos: number = 0;
  comment: string = '';
  min: number | null = null;
  max: number | null = null;

  recID: any;
  activeCoins: string = '0';
  activeKudos: string = '0';
  cardType: string;

  constructor(
    private api: ApiHttpService,
    private fdService: CodxFdService,
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
    if (this.cardType) {
      if (this.cardType == '3') {
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
    this.kudos = e?.data;
  }

  changeComment(e) {
    this.comment = e?.data;
    console.log(this.comment);
  }

  submit() {
    if (this.activeCoins == '1' || this.activeKudos == '1') {
      this.api
        .execSv<any>(
          'FD',
          'FD',
          'KudosTransBusiness',
          'HandleKudosPolicyAsync',
          [this.recID, this.coins, this.kudos]
        )
        .subscribe((res) => {
          if (res) {
            this.dialogRef.close(res);
          }
        });
    }

    if (this.comment) {
      this.fdService.addComment(this.recID, this.comment).subscribe((res) => {
        if (res) {
          this.dialogRef.close(res);
        }
      });
    }

    if (!this.comment && this.activeCoins == '0' && this.activeKudos == '0') {
      this.dialogRef.close(true);
    }
  }

  reset() {
    this.coins = 0;
    this.kudos = 0;
  }
}
