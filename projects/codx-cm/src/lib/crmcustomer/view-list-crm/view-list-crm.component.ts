import { Component, Input, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
  }


  clickMF(e, data){

  }
}
