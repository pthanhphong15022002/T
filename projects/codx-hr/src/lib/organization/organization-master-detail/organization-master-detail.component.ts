import { Component, Input, OnInit } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'lib-organization-master-detail',
  templateUrl: './organization-master-detail.component.html',
  styleUrls: ['./organization-master-detail.component.css']
})
export class OrganizationMasterDetailComponent implements OnInit {

  @Input() orgUnitID:string = "";
  @Input() formModel:FormModel = null;
  constructor() { }

  ngOnInit(): void {
  }

}
