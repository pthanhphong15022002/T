import {
  Component,
  Injector,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ApiHttpService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from '../../codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-detail-equit',
  templateUrl: './view-detail-equit.component.html',
  styleUrls: ['./view-detail-equit.component.css'],
})
export class ViewDetailEquitComponent {
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() grvSetup;
  @Output() clickMFunction = new EventEmitter();

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService
  ) {}

  tabControl: TabModel[] = [];
  formModelEmployee;

  ngOnInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];

    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });
  }

  clickMF(evt: any, data: any = null) {
    this.clickMFunction.emit({ event: evt, data: data });
  }

  changeDataMF(e: any, data: any) {
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(e, data, fc);
      });
    } else this.changeDataMFBefore(e, data, funcList);
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.shareService.changeMFApproval(e, data?.unbounds);
    } else {
      this.hrService.handleShowHideMF(e, data, this.formModel);
    }
  }
}
