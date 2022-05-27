import { Component, Input, OnInit } from '@angular/core';
import { ViewsComponent } from 'codx-core';

@Component({
  selector: 'app-view-board-info',
  templateUrl: './view-board-info.component.html',
  styleUrls: ['./view-board-info.component.scss']
})
export class ViewBoardInfoComponent implements OnInit {
  // taskBoard = new 
  title = "Task Board" ;
  readOnly = true ;




  @Input('viewBase') viewBase: ViewsComponent;
  constructor() { }

  ngOnInit(): void {
  }
  

  saveData(id){
    //save taskBodad
  }
  
  closeTaskBoard(){
    //lam gif ddos
    this.viewBase.currentView.closeSidebarRight();
  }

  showPanel() {
    this.viewBase.currentView.openSidebarRight();
  }
  closePanel() {
    this.viewBase.currentView.closeSidebarRight();
  }
  openDialog() {
    // let obj = {
    //   formName: 'demo',
    //   control: '1',
    //   value: '5',
    //   text: 'demo nè',
    // };
    // this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', obj);
  }
  valueChange(e :any){

  }
  changeVLL(e :any){

  }
  cbxChange(e :any){

  }
}
