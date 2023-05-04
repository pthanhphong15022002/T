import { Component, OnInit } from '@angular/core';
import { CM_Contacts } from '../../models/cm_model';
import { AuthStore, CacheService, CallFuncService, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss']
})
export class AddContractsComponent implements OnInit{
  contracts: CM_Contacts;
  isLoadDate: any;
  action = 'add';
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
  ) {
    this.setData('');
  }
  ngOnInit() {

  }

  setData(data){
    if(this.action == 'add'){
      this.contracts = new CM_Contacts();
      this.contracts.recID = Util.uid();
    }
    if(this.action == 'edit'){
      this.contracts = data;
    }
    if(this.action == 'copy'){
      this.contracts = data;
      this.contracts.recID = Util.uid();
    }
  }

  save(){
    console.log(this.contracts);
    
  }

  valueChangeText(event) {
    try {
      this.contracts[event?.field] = event?.data;
    } catch (error) {
      console.log(error);
       
    }
  }

  valueChangeCombobox(event) {
    this.contracts[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.contracts[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
    
    if(this.isLoadDate){
      this.isLoadDate = !this.isLoadDate;
      return;
    }
    const startDate =  new Date(this.contracts['startDate']);
    const endDate = new Date(this.contracts['endDate']);
   
    if (endDate && startDate > endDate){
      this.isLoadDate = !this.isLoadDate;
      this.notiService.notifyCode('DP019');
      return;
    } 
    // if (new Date(startDate.toLocaleString()).getTime() < new Date(this.startDateParent.toLocaleString()).getTime()) {
    // }

    this.isLoadDate = !this.isLoadDate;
  }
}
