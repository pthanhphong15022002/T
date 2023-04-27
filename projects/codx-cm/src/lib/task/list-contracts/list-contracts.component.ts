import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CacheService, CallFuncService, DialogModel, UIComponent, Util } from 'codx-core';
import { AddContractsComponent } from '../add-contracts/add-contracts.component';

@Component({
  selector: 'list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrls: ['./list-contracts.component.scss']
})
export class ListContractsComponent implements OnInit {
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  popup
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
  ) {
    
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  addContract(){
    // this.dataSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.popup = this.callFunc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
    // this.popup.closed.subscribe((e) => {});
  }
}
