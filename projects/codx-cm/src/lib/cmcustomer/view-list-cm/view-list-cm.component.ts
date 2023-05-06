import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'codx-view-list-cm',
  templateUrl: './view-list-cm.component.html',
  styleUrls: ['./view-list-cm.component.css']
})
export class ViewListCmComponent implements OnInit {
  @Input() dataSelected: any
  @Input() formModel: any;
  @Input() vllPriority = '';
  @Input() funcID = 'CM0101';
  @Input() entityName: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();

  listContacts = [];
  contactPerson: any;
  constructor(
    private cmSv: CodxCmService,
  ) { }

  ngOnInit(): void {
    this.getListContactByObjectID(this.dataSelected.recID);
  }



  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
  }

  changeDataMF(e, data){
    this.changeMoreMF.emit({e: e, data: data});
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

  getNameCrm(data){
    if(this.funcID == "CM0101"){
      return data.customerName;
    }else if(this.funcID == "CM0102"){
      return data.contactName;
    }else if(this.funcID == "CM0103"){
      return data.partnerName;
    }else{
      return data.opponentName;
    }
  }
}
