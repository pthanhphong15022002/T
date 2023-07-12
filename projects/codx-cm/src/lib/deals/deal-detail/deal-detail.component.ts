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
  @Output() listInstanceStep = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail')
  tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations') quotations: TemplateRef<any>;
  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;


  tabControl = [
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
      name: 'References',
      textDefault: 'Liên kết',
      isActive: false,
      template: null,
    },
  ];

  formModelCustomer: FormModel;

  treeTask = [];

  nameDetail = '';
  tabClicked = '';
  contactPerson: any;

  tabDetail = [];
  listContract: CM_Contracts[];
  mergedList: any[] = [];
  viewTag: string = '';
  modifiedOn: any;
  isUpdateTab:boolean = false;
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
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSelected) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
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
       text: 'Lịch sử hoạt động',
       icon: 'icon-sticky_note_2',
     },

   ];
 }
  async executeApiCalls() {
    try {
      this.formModelCustomer = await this.codxCmService.getFormModel('CM0101');
    } catch (error) {}
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
        this.listInstanceStep.emit({ listStep: this.listSteps });
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
}
