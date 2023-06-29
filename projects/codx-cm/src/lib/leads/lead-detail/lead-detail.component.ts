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
  tmpDeal: any;
  gridViewSetupDeal:any;
  request: ResourceModel;
  formModelDeal: FormModel;
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
      this.dataSelected = this.dataSelected;
      if (this.dataSelected.dealID) {
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
      //    console.log('log grid lead: ', this.gridViewSetup?.Status?.referedValue);
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
  }
  // async getColorReason() {
  //   this.cache.valueList('DP036').subscribe((res) => {
  //     if (res.datas) {
  //       for (let item of res.datas) {
  //         if (item.value === 'S') {
  //           this.colorReasonSuccess = item;
  //         } else if (item.value === 'F') {
  //           this.colorReasonFail = item;
  //         }
  //       }
  //     }
  //   });
  // }

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
    if (isCheck) {
      var objField = {
        name: 'Field',
        textDefault: 'Thông tin mở rộng',
        icon: 'icon-add_to_photos',
        isActive: false,
      };
      this.tabDetail.splice(1, 0, objField);
    }
  }

  getStep(stepID) {
    // if (this.lstStep != null && this.lstStep.length > 0) {
    //   var step = this.lstStep.find((x) => x.stepID == stepID);
    //   return step;
    // } else {
    //   return null;
    // }
  }
}
