import { ChangeDetectorRef, Component, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { CM_Contracts } from '../../models/cm_model';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss']
})
export class ContractsDetailComponent implements OnInit,OnChanges{
  dialog: DialogRef;
  contract: CM_Contracts;
  listTypeContract;
  tabClicked;
  active = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];
  tabClick;
  listTab = [];
  listTabInformation = [
    {id:'customer', name:"Khách hàng"},
    {id:'information', name:"Thông tin hợp đồng"},
    {id:'purpose', name:"Mục đích thuê"},
    {id:'note', name:"Ghi chú"},
  ]
  listTabTask = [
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
  ]
  listTabComment = [
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
    {id:'', name:""},
  ]
  constructor(
    private contractService: ContractsService,
    private codxCmService: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.contract = dt?.data?.contract;
  }
  ngOnInit() {
    this.listTypeContract = this.contractService.listTypeContractTask;
    this.listTab = this.listTabInformation;
    this.tabClick = this.listTab[0]?.id;
  }
  ngOnChanges(changes: SimpleChanges) {
    
  }

  changeTab(e) {
    this.tabClicked = e;
  }
  close(){
    this.dialog.close();
  }

  onSectionChange(data: any, index: number = -1) {
    // if (index > -1 && this.isClick == false) {
    //   // let element = document.getElementById(this.active[index]);
    //   // element.blur();
    //   this.active[index] = data;
    //   this.changeDetectorRef.detectChanges();
    // }
  }

  navChange(evt: any, index: number = -1, btnClick) {
    this.tabClick = evt;
    let containerList = document.querySelectorAll('.pw-content')
    let lastDivList = document.querySelectorAll('.div_final')
    let lastDiv = lastDivList[index]
    let container = containerList[index]
    let containerHeight = (container as any).offsetHeight
    let contentHeight = 0;
    for(let i = 0; i< container.children.length; i++){
      contentHeight += (container.children[i] as any).offsetHeight
    }
    let element = document.getElementById(evt);
    let distanceToBottom = contentHeight - element.offsetTop;
    
    if(distanceToBottom < containerHeight){
      (lastDiv as any).style.width = '200px';
      (lastDiv as any).style.height = `${containerHeight - distanceToBottom + 250}px`;
    }
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.changeDetectorRef.detectChanges();
  }

}
