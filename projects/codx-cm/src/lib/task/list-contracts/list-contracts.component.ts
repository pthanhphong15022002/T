import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrls: ['./list-contracts.component.scss']
})
export class ListContractsComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  addContract(){
    // this.dataSelected = data;
    // let option = new DialogModel();
    // option.IsFull = true;
    // option.zIndex = 999;
    // this.viewType = 'p';
    // this.popup = this.callFunc.openForm(
    //   this.popDetail,
    //   '',
    //   Util.getViewPort().width,
    //   Util.getViewPort().height,
    //   '',
    //   null,
    //   '',
    //   option
    // );
    // this.popup.closed.subscribe((e) => {});
  }
}
