import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { AddContractsComponent } from '../add-contracts/add-contracts.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrls: ['./list-contracts.component.scss']
})
export class ListContractsComponent implements OnInit, OnChanges {
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @Input() projectID: any;
  @Input() frmModelInstancesTask: FormModel;
  listContract = [];
  dateFomat = 'dd/MM/yyyy';

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) {
    
  }

  async ngOnChanges(changes: SimpleChanges) {
    if(changes.projectID){
      this.getContracts(this.projectID); 
    }
  }

  ngOnInit(): void {
    this.cache.functionList('DPT040102').subscribe((res) => {
      if (res) {
        let formModel = new FormModel();
        formModel.formName = res?.formName;
        formModel.gridViewName = res?.gridViewName;
        formModel.entityName = res?.entityName;
        formModel.funcID = 'DPT040102';
        this.frmModelInstancesTask = formModel;
        console.log(this.frmModelInstancesTask);
      }
    });
   
  }


  changeDataMFTask(event){

  }

  clickMF(event, contract){
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deleteContract(contract);
        break;
      case 'SYS03': // edit
        this.editContract(contract);
        break;
      case 'SYS04': // copy
        this.copyContract(contract);
        break;
    }
  }

  getContracts(data){
    this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractsAsync',
      data
    ).subscribe((e) => {
        this.listContract = e || [];
    })
  }

  async addContract(){
    let contractOutput = await this.openPopupContract(this.projectID, "add");
    if(contractOutput?.event?.contract){
      this.listContract.push(contractOutput?.event?.contract);
    }
  }

  async editContract(contract){
    let dataEdit = JSON.parse(JSON.stringify(contract));
    let dataOutput = await this.openPopupContract(this.projectID,"edit",dataEdit);
    let contractOutput = dataOutput?.event?.contract;
    if(contractOutput){
      let index = this.listContract.findIndex(x => x.recID == contractOutput?.recID);
      if(index >= 0){
        this.listContract.splice(index, 1, contractOutput);
      }
    }
  }

  async copyContract(contract){
    let dataCopy = JSON.parse(JSON.stringify(contract));
    let contractOutput = await this.openPopupContract(this.projectID,"copy",dataCopy);
    if(contractOutput?.event?.contract){
      this.listContract.push(contractOutput?.event?.contract);
    }
  }

  deleteContract(contract){
    if(contract?.recID){
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.api.exec<any>(
            'CM',
            'ContractsBusiness',
            'DeleteContactAsync',
            contract?.recID
          ).subscribe(res => {
            if(res){
              let index = this.listContract.findIndex(x => x.recID==contract.recID);
              if(index >= 0){
                this.listContract.splice(index, 1);
              }
            }
          });
        }
      })
    }
  }

  async openPopupContract(projectID,action, contract?){
    let data = {
      projectID,
      action,
      contract: contract || null,
    }
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    let popupContract = this.callFunc.openForm(
      AddContractsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    // Util.getViewPort().width,
    // Util.getViewPort().height,
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
  }

}
