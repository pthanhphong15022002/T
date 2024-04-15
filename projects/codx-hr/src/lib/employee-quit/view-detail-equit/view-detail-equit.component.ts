import {
  Component,
  Injector,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService, CodxService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { isObservable } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'lib-view-detail-equit',
  templateUrl: './view-detail-equit.component.html',
  styleUrls: ['./view-detail-equit.component.css'],
})
export class ViewDetailEquitComponent {
  @Input() formModel;
  @Input() fmContract;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any = null;
  @Input() grvSetup;
  @Output() clickMFunction = new EventEmitter();

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService,
    public codxService : CodxService
  ) {}

  tabControl: TabModel[] = [];
  formModelEmployee;
  currentContract;

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

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue != changes.itemDetail?.currentValue
    ) {
      this.getInforContract(changes.itemDetail.currentValue.emp.employeeID);
    }
  }

  //Calc ViolatedDays
  functionCalcViolatedDays() {
    var violatedDays = 0;
    if (this.itemDetail.createdOn && this.itemDetail.stoppedOn) {
      violatedDays =
        this.currentContract?.quitForetellDays -
        (moment(this.itemDetail.stoppedOn).diff(
          moment(this.itemDetail.createdOn),
          'days'
        ) +
          (moment(this.itemDetail.stoppedOn).format('yyyy-MM-dd') ==
          moment(this.itemDetail.createdOn).format('yyyy-MM-dd')
            ? 0
            : 1));

      if (!isNaN(violatedDays)) {
        this.currentContract = {
          ...this.currentContract,
          violatedDays: violatedDays >= 0 ? violatedDays : 0,
        };

        this.itemDetail = {
          ...this.itemDetail,
          currentContract: this.currentContract,
        };
      }
    } else {
      this.itemDetail.currentContract = null;
      this.currentContract = null;
    }
  }

  getInforContract(id) {
    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'EQuitBusiness_Old',
        'GetContractCurrentAsync',
        id
      )
      .subscribe((res: any) => {
        if (res) {
          this.currentContract = res;
          this.functionCalcViolatedDays();
        } else {
          this.itemDetail.currentContract = null;
          this.currentContract = null;
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
