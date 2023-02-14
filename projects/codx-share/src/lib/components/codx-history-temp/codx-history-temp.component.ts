import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogModel } from 'codx-core';

@Component({
  selector: 'codx-history-temp',
  templateUrl: './codx-history-temp.component.html',
  styleUrls: ['./codx-history-temp.component.css']
})
export class CodxHistoryTempComponent implements OnInit {

  @Input() objectID: string = null;
  @Input() zIndex: number = 0; // Thảo truyền z index
  @Input() openViewPopup = true ;// Thảo truyền ko cho click
  lstData: any[] = [];
  dVll: any = {};
  

  countData: number = 0;
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService
  ) {}

  ngOnInit(): void {
    this.getDataAsync(this.objectID);
  }

  getDataAsync(pObjectID: string) {
    //đang test còn để comnet sau lộc thêm hàm get his
    if (pObjectID) {
      this.api
        .execSv(
          "BG",
          "ERM.Business.BG",
          "CommentLogsBusiness",
          'GetTotalCommentsAsync',
          [pObjectID]
        )
        .subscribe((res: number) => {
          if (res) {
            this.countData = res;
          }
        });
    }
  }

  openPopup() {
    if (this.tmpListItem) {
      let option = new DialogModel();
      if (this.zIndex > 0) option.zIndex = this.zIndex;
      let popup = this.callFC.openForm(
        this.tmpListItem,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res) {
          this.getDataAsync(this.objectID);
        }
      });
    }
  }
}
