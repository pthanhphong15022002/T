import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CallFuncService, DialogModel, DialogRef, Util } from 'codx-core';

@Component({
  selector: 'codx-view-list-cm',
  templateUrl: './view-list-cm.component.html',
  styleUrls: ['./view-list-cm.component.css'],
})
export class ViewListCmComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() vllPriority = '';
  @Input() funcID = 'CM0101';
  @Input() entityName: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();
  @ViewChild('popDetail') popDetail: TemplateRef<any>;

  dialogDetail: DialogRef;

  listContacts = [];
  countDeal = 0;
  contactPerson: any;
  constructor(private cmSv: CodxCmService, private callFunc: CallFuncService) {}

  ngOnInit(): void {
    if (this.funcID == 'CM0101' || this.funcID == 'CM0103')
      this.getListContactByObjectID(this.dataSelected.recID);
    if (this.funcID == 'CM0101') {
      this.countDealsByCustomerID(this.dataSelected.recID);
    }
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }

  clickMoreFuncDetail(e) {
    this.clickMF(e.e, e.data);
  }

  changeDataDetailMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listContacts = res;
        this.contactPerson = this.listContacts.find((x) =>
          x.contactType.split(';').some((x) => x == '1')
        );
      }
    });
  }

  countDealsByCustomerID(customerID) {
    this.cmSv.countDealsByCustomerID(customerID).subscribe((res) => {
      if (res > 0) {
        this.countDeal = res;
      } else {
        this.countDeal = 0;
      }
    });
  }

  getNameCrm(data) {
    if (this.funcID == 'CM0101') {
      return data.customerName;
    } else if (this.funcID == 'CM0102') {
      return data.contactName;
    } else if (this.funcID == 'CM0103') {
      return data.partnerName;
    } else {
      return data.opponentName;
    }
  }

  dbClick(data) {
    this.dataSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.dialogDetail = this.callFunc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
    this.dialogDetail.closed.subscribe();
  }
}
