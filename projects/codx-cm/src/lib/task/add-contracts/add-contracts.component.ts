import { Component, OnInit, Optional } from '@angular/core';
import { CM_Contacts, CM_Contracts } from '../../models/cm_model';
import { AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss']
})
export class AddContractsComponent implements OnInit{
  contracts: CM_Contracts;
  contractsInput: CM_Contracts;
  dialog!: DialogRef;
  isLoadDate: any;
  action = 'add';
  projectID: string;
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.projectID = dt?.data?.projectID;
    this.action = dt?.data?.action;
    this.contractsInput = dt?.data?.contract;
  }
  ngOnInit() {
    this.setData(this.contractsInput);
  }

  setData(data){
    if(this.action == 'add'){
      this.contracts = new CM_Contracts();
      this.contracts.recID = Util.uid();
      this.contracts.projectID = this.projectID;
    }
    if(this.action == 'edit'){
      this.contracts = data;
    }
    if(this.action == 'copy'){
      this.contracts = data;
      this.contracts.recID = Util.uid();
      delete this.contracts['id'];
    }
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
    
    // if(this.isLoadDate){
    //   this.isLoadDate = !this.isLoadDate;
    //   return;
    // }
    // const startDate =  new Date(this.contracts['startDate']);
    // const endDate = new Date(this.contracts['endDate']);
   
    // if (endDate && startDate > endDate){
    //   this.isLoadDate = !this.isLoadDate;
    //   this.notiService.notifyCode('DP019');
    //   return;
    // } 
    // if (new Date(startDate.toLocaleString()).getTime() < new Date(this.startDateParent.toLocaleString()).getTime()) {
    // }

    this.isLoadDate = !this.isLoadDate;
  }
  handleSaveContract(){
    switch (this.action){
      case 'add':
      case 'copy':
        this.addContracts();
        break;
      case 'edit':
        this.editContract();
        break;
    }
  }

  addContracts(){
    this.cmService.addContracts(this.contracts).subscribe( res => {
      if(res){
        this.dialog.close({ contract: res, action: this.action });
      }
    })
  }

  editContract(){
    this.cmService.editContracts(this.contracts).subscribe( res => {
      if(res){
        this.dialog.close({ contract: res, action: this.action });
      }
    })
  }
}
