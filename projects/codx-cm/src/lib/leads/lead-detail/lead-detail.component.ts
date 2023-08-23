import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CacheService,
  DataRequest,
  FormModel,
  ImageViewerComponent,
  ResourceModel,
} from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { CM_Deals } from '../../models/cm_model';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'codx-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss'],
})
export class LeadDetailComponent implements OnInit {
  @ViewChild('tabObj') tabObj: TabComponent;
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID: any; //
  @Input() gridViewSetup: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() action: any;
  @Input() applyProcess: any;

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('referencesDeal') referencesDeal: TemplateRef<any>;
  @ViewChild('comment') comment: TemplateRef<any>;

  viewTag: string = '';
  tabControl = [];
  listRoles = [];
  listSteps = [];
  listStepsProcess = [];

  tmpDeal: any;
  oCountFooter: any = {};
  contactPerson: any;
  gridViewSetupDeal: any;
  request: ResourceModel;
  formModelDeal: FormModel;

  isDataLoading = false;

  oldRecId: string = '';
  isHidden: boolean = true;

  isBool: boolean = false;
  hasRunOnce = false;
  treeTask = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private codxCmService: CodxCmService
  ) {
    this.isDataLoading = true;
    this.executeApiCalls();
  }

  ngOnInit(): void {
    this.tabControl = [
      {
        name: 'History',
        textDefault: 'Lịch sử',
        isActive: true,
        template: null,
      },
      {
        name: 'Attachment',
        textDefault: 'Đính kèm',
        isActive: false,
        template: null,
      },
      {
        name: 'AssignTo',
        textDefault: 'Giao việc',
        isActive: false,
        template: null,
      },
      {
        name: 'Approve',
        textDefault: 'Ký duyệt',
        isActive: false,
        template: null,
      },
      {
        name: 'Deal',
        textDefault: 'Liên kết',
        isActive: false,
        template: this.referencesDeal,
        icon: 'icon-i-link',
      },
    ];
  }

  ngAfterViewInit(): void {}
  ngAfterViewChecked() {
    if (!this.hasRunOnce) {
      this.resetTab(this.dataSelected.applyProcess);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        this.dataSelected = this.dataSelected;
        var index = this.tabControl.findIndex((x) => x.name === 'Deal');
        if (index != -1) {
          this.tabControl.splice(index, 1);
        }
        let references = {
          name: 'Deal',
          textDefault: 'Liên kết',
          isActive: false,
          template: this.referencesDeal,
          icon: 'icon-i-link',
        };

        if (
          this.oldRecId !== changes['dataSelected'].currentValue?.recID &&
          this.oldRecId
        ) {
          this.hasRunOnce = true;
          this.resetTab(this.dataSelected.applyProcess);
          this.promiseAllLoad();
        }
        !this.hasRunOnce && this.promiseAllLoad();
        this.oldRecId = changes['dataSelected'].currentValue.recID;
        this.tabControl.push(references);
      } else {
        this.tmpDeal = null;
      }
      this.getTags(this.dataSelected);
    }
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMF.emit({
      e: e,
      data: data,
    });
  }

  changeFooter(e) {}
  resetTab(data) {
    if (this.tabObj) {
      this.isBool = data;
      if (this.isBool) {
        (this.tabObj as TabComponent).hideTab(1, true);
        (this.tabObj as TabComponent).hideTab(2, false);
      } else {
        (this.tabObj as TabComponent).hideTab(1, false);
        (this.tabObj as TabComponent).hideTab(2, true);
      }
    }
  }

  async promiseAllLoad() {
    this.isDataLoading = true;
    this.getTree();
    this.dataSelected.applyProcess && (await this.getListInstanceStep());
    this.dataSelected.dealID && (await this.getTmpDeal());
  }
  async executeApiCalls() {
    await this.getValueListRole();
    await this.getGridViewSetupDeal();
  }

  async getGridViewSetupDeal() {
    this.formModelDeal = await this.codxCmService.getFormModel('CM0201');
    this.gridViewSetupDeal = await firstValueFrom(
      this.cache.gridViewSetup(
        this.formModelDeal?.formName,
        this.formModelDeal?.gridViewName
      )
    );
  }

  async getValueListRole() {
    this.cache.valueList('CRM040').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }
  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
      '5',
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listSteps = res;
        this.isDataLoading = false;
        this.checkCompletedInstance(this.dataSelected?.status);
      } else {
        this.listSteps = null;
      }
    });
  }
  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2') {
      this.deleteListReason(this.listSteps);
    }
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  checkHaveField(listStep: any) {
    var isCheck = false;
    for (let item of listStep) {
      if (item?.fields?.length > 0 && item?.fields) {
        isCheck = true;
        return isCheck;
      }
    }
    return isCheck;
  }

  async getTmpDeal() {
    this.codxCmService
      .getOneTmpDeal([this.dataSelected.dealID])
      .subscribe((res) => {
        if (res) {
          this.tmpDeal = res[0];
        }
      });
  }

  getIcon($event) {
    if ($event == '1') {
      return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
    } else if ($event == '5') {
      return this.listRoles.filter((x) => x.value == '5')[0]?.icon ?? null;
    } else if ($event == '3') {
      return this.listRoles.filter((x) => x.value == '3')[0]?.icon ?? null;
    }
    return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
  }
  getTags(data) {
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = this.dataSelected?.tags;
    }, 100);
  }
  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
  }
  continueStep(event) {
    let isTaskEnd = event?.isTaskEnd;
    let step = event?.step;

    let transferControl = this.dataSelected.steps.transferControl;
    if (transferControl == '0') return;
  }
  saveAssignTask(e) {}
  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }

  reloadListStep(listSteps: any) {
    this.isDataLoading = true;
    this.listSteps = listSteps;
    this.isDataLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  //load giao việc
  getTree() {
    let seesionID = this.dataSelected.applyProcess
      ? this.dataSelected.refID
      : this.dataSelected.recID;
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
}
