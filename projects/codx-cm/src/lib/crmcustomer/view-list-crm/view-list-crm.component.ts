import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'codx-view-list-crm',
  templateUrl: './view-list-crm.component.html',
  styleUrls: ['./view-list-crm.component.css']
})
export class ViewListCrmComponent implements OnInit {
  @Input() dataSelected: any
  @Input() formModel: any;
  @Input() vllPriority = '';
  @Input() funcID = 'CM0101';
  @Input() entityName: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }


  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
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
