import {
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'cm-view-history-customer',
  templateUrl: './view-history-customer.component.html',
  styleUrls: ['./view-history-customer.component.css'],
})
export class ViewHistoryCustomerComponent {
  @Input() customerID: any;
  @Input() isRole = true;

  listHistory = [];
  loaded: boolean;
  id: any;
  formModelDeal: FormModel;
  formModelContract: FormModel;
  formModelQuotation: FormModel;
  currentRecID: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  lstStep = [];
  gridViewSetupDeal: any;
  gridViewSetupContract: any;
  gridViewSetupQuotation: any;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    if (changes['customerID']) {
      if (
        changes['customerID']?.currentValue != null &&
        changes['customerID']?.currentValue?.trim() != ''
      ) {
        if (this.isRole) {
          if (changes['customerID']?.currentValue == this.id) return;
          this.id = changes['customerID']?.currentValue;
          this.getListHistoryToDCQ();
        }else{
          this.id = changes['customerID']?.currentValue;
        }
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  async ngOnInit() {
    this.formModelDeal = await this.cmSv.getFormModel('CM0201');
    this.formModelContract = await this.cmSv.getFormModel('CM0204');
    this.formModelQuotation = await this.cmSv.getFormModel('CM0202');
    this.gridViewSetupDeal = await firstValueFrom(this.cache.gridViewSetup(this.formModelDeal?.formName, this.formModelDeal?.gridViewName));
    this.gridViewSetupContract = await firstValueFrom(this.cache.gridViewSetup(this.formModelContract?.formName, this.formModelContract?.gridViewName));
    this.gridViewSetupQuotation = await firstValueFrom(this.cache.gridViewSetup(this.formModelQuotation?.formName, this.formModelQuotation?.gridViewName));

    this.getColorReason();
  }

  async getListHistoryToDCQ() {
    this.loaded = false;

    this.listHistory = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'GetListHistoryToDCQAsync',
        [this.customerID]
      )
    );
    var lstRef = this.listHistory.map((x) => x.refID);
    var lstSteps = this.listHistory.map((x) => x.stepID);
    if (lstRef != null && lstRef.length > 0)
      this.getStepsByListID(lstSteps, lstRef);
    this.loaded = true;

    this.changeDetectorRef.detectChanges();
  }

  changeContacts(item) {
    this.currentRecID = item.recID;
    this.changeDetectorRef.detectChanges();
  }

  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  selectionChange(parent) {
    if (!parent.isItem) {
      parent.data.items = parent.data.items;
    }
  }

  async getColorReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.colorReasonSuccess = item;
          } else if (item.value === 'F') {
            this.colorReasonFail = item;
          }
        }
      }
    });
  }

  getStepsByListID(lstStepID, lstIns) {
    this.cmSv.getStepsByListID(lstStepID, lstIns).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstStep = res;
      }
    });
  }

  getStep(stepID) {
    if (this.lstStep != null && this.lstStep.length > 0) {
      var step = this.lstStep.find((x) => x.stepID == stepID);
      return step;
    } else {
      return null;
    }
  }
}
