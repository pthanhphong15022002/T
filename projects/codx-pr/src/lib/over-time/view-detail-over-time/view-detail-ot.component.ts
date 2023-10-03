import {
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import { UIComponent, ViewsComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-view-detail-ot',
  templateUrl: './view-detail-ot.component.html',
  styleUrls: ['./view-detail-ot.component.css'],
})
export class ViewDetailOtComponent {
  tabControl: TabModel[] = [];

  constructor(private df: ChangeDetectorRef) {}

  @Input() recID;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() grvSetup;
  @Input() hideMF = false;
  @Input() hideFooter = false;

  ngOnInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];

    console.log(this.recID);

    // this.hrService.getFormModel('HRT03a1').then((res) => {
    //   if (res) {
    //     this.formModelEmployee = res;
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  // changeDataMF(e: any, data: any) {
  //   this.hrService.handleShowHideMF(e, data, this.formModel);

  //   var funcList = this.codxODService.loadFunctionList(
  //     this.view.formModel.funcID
  //   );
  //   if (isObservable(funcList)) {
  //     funcList.subscribe((fc) => {
  //       this.changeDataMFBefore(e, data, fc);
  //     });
  //   } else this.changeDataMFBefore(e, data, funcList);
  // }

  // changeDataMFBefore(e: any, data: any, fc: any) {
  //   if (fc.runMode == '1') {
  //     this.shareService.changeMFApproval(e, data?.unbounds);
  //   }
  // }

  // clickMF(evt: any, data: any = null) {
  //   this.clickMFunction.emit({ event: evt, data: data });
  // }
}
