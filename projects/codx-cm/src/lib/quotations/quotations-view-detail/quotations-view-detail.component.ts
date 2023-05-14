import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, FormModel } from 'codx-core';

@Component({
  selector: 'lib-quotations-view-detail',
  templateUrl: './quotations-view-detail.component.html',
  styleUrls: ['./quotations-view-detail.component.css'],
})
export class QuotationsViewDetailComponent implements OnChanges {
  @Input() itemSelected: any;
  @Input() formModel: FormModel;
  @Input() vllStatus = 'CRM012';
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
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
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
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
    {
      name: 'Contract',
      textDefault: 'Hợp đồng',
      isActive: false,
      template: null,
    },
  ];

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  gridHeight: number = 250;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  dataSource = [];
  crrContactID: any;

  constructor(private api: ApiHttpService, protected sanitizer: DomSanitizer) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemSelected']) {
    }
    if (this.itemSelected.contactID != this.crrContactID) {
      this.crrContactID = this.itemSelected.contactID;
      this.loadDetailContactByID(this.crrContactID);
    }
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
