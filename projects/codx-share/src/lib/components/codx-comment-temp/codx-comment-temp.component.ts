import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, CallFuncService, DialogModel, FormModel } from 'codx-core';
import { CodxTabsComponent } from '../codx-tabs/codx-tabs.component';

@Component({
  selector: 'codx-comment-temp',
  templateUrl: './codx-comment-temp.component.html',
  styleUrls: ['./codx-comment-temp.component.scss'],
})
export class CodxCommentTempComponent implements OnInit {
  @Input() objectID: string = null;
  @Input() viewType = '0'; // Thảo customview
  @Input() zIndex: number = 0; // Thảo truyền z index
  @Input() openViewPopup = true ;// Thảo truyền ko cho click
  @Input() isComment = true ;// thuận truyền vào để không cho bình luận chỉ xem.
  @Input() formModel: FormModel = null;
  lstData: any[] = [];
  dVll: any = {};

  totalComment: number = 0;
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService
  ) {}

  ngOnInit(): void {
    this.GetTotalComment(this.objectID);
  }

  GetTotalComment(pObjectID: string) {
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
            this.totalComment = res;
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
        if (res){
          this.totalComment = res.event;
          let ele = document.getElementsByTagName("codx-tabs");
          if(ele)
          {
            let codxTabs = window.ng.getComponent(ele[0]) as CodxTabsComponent;
            if(codxTabs)
            {
              codxTabs.changeCountFooter(this.totalComment,"comment");
            }
          }
          this.dt.detectChanges();
        }
      });
    }
  }
}

declare var window: any;
