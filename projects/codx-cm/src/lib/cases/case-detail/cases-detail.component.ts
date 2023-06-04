import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService, FormModel } from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/cm_model';
import { TabCaseDetailComponent } from './tab-case-detail/tab-case-detail.component';

@Component({
  selector: 'codx-cases-detail',
  templateUrl: './cases-detail.component.html',
  styleUrls: ['./cases-detail.component.scss']
})
export class CasesDetailComponent  implements OnInit {

  @Input() dataSelected: any;
  @Input() formModel: FormModel;
  @Input() funcID: string; //True - Khách hàng; False - Liên hệ
  @Output() clickMoreFunc = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabCaseDetailComponent') tabCaseDetailComponent: TabCaseDetailComponent;


  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
  ];

  treeTask = [];

  nameDetail = '';
  tabClicked = '';

  caseId: string = '';


  vllPriority = 'TM005';


  contactPerson = new CM_Contacts();

  tabDetail = [
  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService
  ) {
    this.listTab();
    console.log('test formModel'+ this.formModel);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
      if (changes['dataSelected'].currentValue != null && changes['dataSelected'].currentValue?.recID) {
        if (changes['dataSelected'].currentValue?.recID == this.caseId) return;
        this.caseId = changes['dataSelected'].currentValue?.recID;
        this.getContactByObjectID(changes['dataSelected'].currentValue?.customerID);
      }
    }

  }

  getContactByObjectID(customerID) {
    this.codxCmService.getContactByObjectID(customerID).subscribe((res) => {
      if (res) {
        this.contactPerson = res;
      }
    });
  }


  listTab(){
      this.tabDetail = [
        { name: 'Information', textDefault: 'Chi tiết sự cố', icon: 'icon-info', isActive: true },
        { name: 'Task', textDefault: 'Quy trình', icon: 'icon-shopping_bag', isActive: false },
        { name: 'Field', textDefault: 'Thông tin mở rộng', icon: 'icon-contact_phone', isActive: false },

      ]
  }

  changeTab(e){
    this.tabClicked = e;
  }

  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
  }

  changeFooter(e){
    console.log(e);

  }
}


