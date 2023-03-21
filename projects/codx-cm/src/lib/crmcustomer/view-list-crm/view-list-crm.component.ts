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
  @Output() clickMoreFunc = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }


  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
  }
}
