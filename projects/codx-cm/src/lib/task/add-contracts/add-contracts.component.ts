import { Component, OnInit } from '@angular/core';
import { CM_Contacts } from '../../models/cm_model';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss']
})
export class AddContractsComponent implements OnInit{
  contracts: CM_Contacts;
  
  ngOnInit() {

  }

}
