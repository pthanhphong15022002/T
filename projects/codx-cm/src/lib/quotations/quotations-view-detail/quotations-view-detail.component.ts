import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, FormModel } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts } from '../../models/cm_model';

@Component({
  selector: 'lib-quotations-view-detail',
  templateUrl: './quotations-view-detail.component.html',
  styleUrls: ['./quotations-view-detail.component.css'],
})
export class QuotationsViewDetailComponent implements OnChanges, OnInit {
  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('connectiveTab') connectiveTab: TemplateRef<any>;
  @Input() itemSelected: any;
  @Input() hideMF: any = false;
  @Input() formModel: FormModel;
  @Input() vllStatus = 'CRM012';
  @Input() vllApprove: string = 'DP043';
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() eventChangeMF = new EventEmitter<any>();
  contact: any;

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
      name: 'Approve',
      textDefault: 'Ký duyệt',
      isActive: false,
      template: null,
    },
    // {
    //   name: 'References',
    //   textDefault: 'Liên kết',
    //   isActive: false,
    //   template: null,
    // },
    // // { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
    // {
    //   name: 'Contract',
    //   textDefault: 'Hợp đồng',
    //   isActive: false,
    //   template: null,
    // },
  ];

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  gridHeight: number = 250;
  editSettings: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  dataSource = [];
  crrContactID: any;
  loadedRef: boolean = false;
  dataRef: any;

  constructor(
    private api: ApiHttpService,
    private codxCM: CodxCmService,
    protected sanitizer: DomSanitizer,
    private changeDef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.itemSelected) return;
    this.loadedRef = false;

    if (this.itemSelected?.contactID != this.crrContactID) {
      this.crrContactID = this.itemSelected.contactID;
      this.loadDetailContactByID(this.crrContactID);
    }
    this.codxCM
      .getQuotationsLinesByTransID(this.itemSelected.recID)
      .subscribe((res) => {
        if (res) {
          this.dataSource = res;
        }
      });
    if (this.itemSelected.refID) {
      this.codxCM
        .getOneObject(this.itemSelected.refID, 'QuotationsBusiness')
        .subscribe((ref) => {
          this.dataRef = ref;
          this.loadedRef = true;
          this.changeDef.detectChanges();
        });
    } else {
      this.loadedRef = true;
      this.dataRef = null;
    }
    this.loadTabs();
  }

  ngAfterViewInit(): void {}

  loadTabs() {
    let references = {
      name: 'Connective',
      textDefault: 'Liên kết',
      isActive: false,
      icon: 'icon-i-link',
      template: this.connectiveTab,
    };
    let idx = this.tabControl.findIndex((x) => x.name == 'Connective');
    if (idx != -1) this.tabControl.splice(idx, 1);
    this.tabControl.push(references);

    let contract = {
      name: 'Contract',
      textDefault: 'Hợp đồng',
      isActive: false,
      icon: 'icon-sticky_note_2',
      template: this.contract,
    };
    let idx2 = this.tabControl.findIndex((x) => x.name == 'Contract');
    if (idx2 != -1) this.tabControl.splice(idx2, 1);
    this.tabControl.push(contract);
  }

  loadDetailContactByID(contactID) {
    this.api
      .exec<any>('CM', 'ContactsBusiness', 'GetContactByRecIDAsync', contactID)
      .subscribe((res) => {
        this.contact = res;
      });
  }

  changeDataMF(e, data) {
    this.eventChangeMF.emit({ e: e, data: data });
  }

  clickMF(e, data) {
    this.clickMoreFunction.emit({ e: e, data: data });
  }
}
