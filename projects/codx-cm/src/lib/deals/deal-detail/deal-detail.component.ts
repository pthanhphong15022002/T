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
  ApiHttpService,
  CRUDService,
  CacheService,
  FormModel,
} from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts } from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'codx-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  @Input() listSteps: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() funcID = 'CM0201'; //
  @Input() checkMoreReason = true;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail')
  tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('referencesDeal') referencesDeal: TemplateRef<any>;

  formModelCustomer: FormModel;
  formModelQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
  };
  formModelContract: FormModel = {
    formName: 'CMContracts',
    gridViewName: 'grvCMContracts',
    entityName: 'CM_Contracts',
  };
  formModelLead: FormModel = {
    formName: 'CMLeads',
    gridViewName: 'grvCMLeads',
    entityName: 'CM_Leads',
  };



  nameDetail = '';
  tabClicked = '';
  contactPerson: any;
  viewTag: string = '';
  modifiedOn: any;
  isUpdateTab:boolean = false;
  treeTask = [];
  grvSetupQuotation: any[] = [];
  grvSetupLead: any[] = [];
  grvSetupContract: any[] = [];
  tabControl:any[] = [];
  tabDetail = [];
  listContract: CM_Contracts[];
  mergedList: any[] = [];
  vllStatusQuotation: any;
  vllStatusContract: any;
  vllStatusLead: any;
  viewSettings: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private api: ApiHttpService,
    private cache: CacheService
  ) {
    this.executeApiCalls();

  }

  ngOnInit(): void {
     this.listTab();
     this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
      {
        name: 'Comment',
        textDefault: 'Thảo luận',
        isActive: false,
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
    if (changes.dataSelected) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {

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

        this.getTags(this.dataSelected);
        this.dataSelected = this.dataSelected;
        if (!this.modifiedOn) {
          this.modifiedOn = changes['dataSelected'].currentValue?.modifiedOn;
          this.promiseAllAsync();
        }
        if ( changes['dataSelected'].currentValue?.modifiedOn !== this.modifiedOn ) {
          this.promiseAllAsync();
          this.modifiedOn = changes['dataSelected'].currentValue?.modifiedOn;
        }
      }
    }
  }

  async promiseAllAsync() {
    try {
      await this.getTree(); //ve cay giao viec
      await this.getListInstanceStep();
      await this.getContactByDeaID(this.dataSelected.recID)
      await this.getHistoryByDeaID();

    } catch (error) {}
  }

  listTab() {
    this.tabDetail = [
     {
       name: 'Information',
       text: 'Thông tin chung',
       icon: 'icon-info',
     },
     {
       name: 'Contact',
       text: 'Liên hệ',
       icon: 'icon-contact_phone',
     },
     {
       name: 'Opponent',
       text: 'Đối thủ',
       icon: 'icon-people_alt',
     },
     {
       name: 'Task',
       text: 'Công việc',
       icon: 'icon-more',
     },
     {
       name: 'History',
       text: 'Lịch sử cập nhật',
       icon: 'icon-sticky_note_2',
     },

   ];
 }
  async executeApiCalls() {
    try {
      this.formModelCustomer = await this.codxCmService.getFormModel('CM0101');
      await this.getGridViewQuotation();
      await this.getGridViewContract();
      await this.getGridViewLead();
    } catch (error) {}
  }
  async getGridViewQuotation() {
    this.grvSetupQuotation = await firstValueFrom(
      this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
    );
    this.vllStatusQuotation = this.grvSetupQuotation['Status'].referedValue;
  }
  async getGridViewContract() {
    this.grvSetupContract = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
  }
  async getGridViewLead() {
    this.grvSetupLead = await firstValueFrom(
      this.cache.gridViewSetup('CMLeads', 'grvCMLeads')
    );
    this.vllStatusLead = this.grvSetupLead['Status'].referedValue;
    this.settingViewValue();
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
      e:  e,
      data: data,
    });
  }

  changeFooter(e) {}

  async getHistoryByDeaID() {
    if (this.dataSelected?.recID) {
      var data = [this.dataSelected?.recID];
      this.codxCmService.getDataTabHistoryDealAsync(data).subscribe((res) => {
        if (res) {
          this.mergedList = res[0];
        }
      });
    }
  }
  async getContactByDeaID(recID) {
    this.codxCmService.getContactByObjectID(recID).subscribe((res) => {
      if (res) {
        this.contactPerson = res;
      } else {
        this.contactPerson = null;
      }

    });
  }
  //load giao việc
  async getTree() {
    let seesionID = this.dataSelected.refID;
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  saveAssign(e) {
    if (e) this.getTree();
  }

  getContactPerson($event) {
    if ($event) {
      this.contactPerson = $event?.isDefault ? $event : null;
      this.changeDetectorRef.detectChanges();
    }
  }

  getTags(data) {
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = this.dataSelected?.tags;
    }, 100);
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
      } else {
        this.listSteps = null;
      }
      this.isUpdateTab = this.checkHaveField(this.listSteps);
      this.pushTabFields((this.checkHaveField(this.listSteps)));
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
  pushTabFields(isCheck) {
    var index = this.tabDetail.findIndex(x=>x.name == 'Field');
    if (isCheck) {
      if(index == -1) {
        var objField = {
            name: 'Field',
            text: 'Thông tin mở rộng',
            icon: 'icon-add_to_photos',
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

  settingViewValue() {
    this.viewSettings = {
      '1': {
        icon: 'icon-monetization_on',
        headerText: 'Báo giá',
        deadValue: this.grvSetupQuotation['TotalAmt']?.headerText,
        formModel: this.formModelQuotations,
        status: this.vllStatusQuotation,
        gridViewSetup: this.grvSetupQuotation,
        name: this.grvSetupQuotation['QuotationName']?.headerText

      },
      '2': {
        icon: 'icon-sticky_note_2',
        headerText: 'Hợp đồng',
        deadValue:  this.grvSetupContract['ContractAmt']?.headerText,
        formModel: this.formModelContract,
        status: this.vllStatusContract,
        gridViewSetup: this.grvSetupContract,
        name: this.grvSetupContract['ContractName']?.headerText
      },
      '3': {
        icon: 'icon-monetization_on',
        headerText: 'Tiềm năng',
        deadValue:  this.grvSetupLead['DealValue']?.headerText,
        formModel: this.formModelLead,
        status: this.vllStatusLead,
        gridViewSetup: this.grvSetupLead,
        name: this.grvSetupLead['LeadName']?.headerText
      },
    };
  }

  getSettingValue(type: string, fieldName: string): any {
    const obj = this.viewSettings[type];
    if (obj) {
      switch (fieldName) {
        case 'icon':
          return obj.icon + ' icon-22 me-2 text-gray-700';
        case 'name':
          return obj.name;
        case 'headerText':
          return obj.headerText;
        case 'deadValue':
          return obj.deadValue;
        case 'formModel':
          return obj.formModel;
        case 'status':
          return obj.status;
        case 'gridViewSetup':
          return obj.gridViewSetup;
        case 'createOn':
          return obj.gridViewSetup['CreatedOn']?.headerText;
      }
    }
    return '';
  }
}
