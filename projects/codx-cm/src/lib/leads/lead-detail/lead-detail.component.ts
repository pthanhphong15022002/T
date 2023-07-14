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

@Component({
  selector: 'codx-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss'],
})
export class LeadDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID: any; //
  @Input() gridViewSetup: any;
  @Input() dataObj?: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail')
  tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations') quotations: TemplateRef<any>;
  @ViewChild('contract') contract: TemplateRef<any>;

  @ViewChild('referencesDeal') referencesDeal: TemplateRef<any>;
  @ViewChild('comment') comment: TemplateRef<any>;

  treeTask = [];

  nameDetail = '';
  tabClicked = '';

  tabDetail = [];
  tabControl = [];
  contactPerson: any;
  listRoles = [];
  listSteps = [];
  tmpDeal: any;
  gridViewSetupDeal:any;
  request: ResourceModel;
  formModelDeal: FormModel;
  isBlock:boolean;
  viewTag: string = '';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private codxCmService: CodxCmService
  ) {
    this.listTab(this.funcID);
    this.cache.valueList('CRM040').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
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
        this.tabControl.push(references);
        this.promiseAll();
      }else {
        this.tmpDeal = null;
      }
      this.afterLoad();
      this.getTags(this.dataSelected);
    }
  }

  listTab(funcID) {
    this.tabDetail = [
      {
        name: 'Information',
        textDefault: 'Thông tin chung',
        icon: 'icon-info',
        isActive: true,
      },
      {
        name: 'Task',
        textDefault: 'Công việc',
        icon: 'icon-more',
        isActive: false,
      },
      {
        name: 'Comment',
        textDefault: 'Thảo luận',
        icon: 'icon-i-chat-right',
        isActive: false,
      },
    ];
  }

  changeTab(e) {
    this.tabClicked = e;
    this.nameDetail = e;
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

  async afterLoad() {}
  async promiseAll() {
    this.formModelDeal = await this.codxCmService.getFormModel('CM0201');
    this.gridViewSetupDeal = await firstValueFrom(
      this.cache.gridViewSetup(
        this.formModelDeal?.formName,
        this.formModelDeal?.gridViewName
      )
    );
    await this.getTmpDeal();
    await this.getListInstanceStep();
  }
  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listSteps = res;
        this.checkCompletedInstance(this.dataSelected?.status);
        this.pushTabFields((this.checkHaveField(this.listSteps)));
      }
      else {
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
  checkHaveField(listStep: any){
    var isCheck = false;
    for(let item of listStep) {
        if(item?.fields?.length > 0 && item?.fields) {
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

  pushTabFields(isCheck) {
    var index = this.tabDetail.findIndex(x=>x.name == 'Field');
    if (isCheck) {
      if(index == -1) {
        var objField = {
          name: 'Field',
          textDefault: 'Thông tin mở rộng',
          icon: 'icon-add_to_photos',
          isActive: false,
        };
        this.tabDetail.splice(1, 0, objField);
        this.tabDetail = JSON.parse(JSON.stringify(this.tabDetail));
      }
    }
    else {
      index != -1 && this.tabDetail.splice(index, 1);
      this.tabDetail = JSON.parse(JSON.stringify(this.tabDetail));
    }
  }
  getIcon($event){
    if($event == '1') {
      return this.listRoles.filter(x=>x.value == '1')[0]?.icon ?? null;
    }
    else if($event == '5') {
      return this.listRoles.filter(x=>x.value == '5')[0]?.icon ?? null;
    }
    else if($event == '3') {
      return this.listRoles.filter(x=>x.value == '3')[0]?.icon ?? null;
    }
    return this.listRoles.filter(x=>x.value == '1')[0]?.icon ?? null;

  }
  getTags(data){
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = this.dataSelected?.tags
    }, 100);
  }
}
