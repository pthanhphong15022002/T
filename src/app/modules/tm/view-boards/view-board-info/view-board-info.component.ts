import { I } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { CbxpopupComponent } from '@modules/tm/controls/cbxpopup/cbxpopup.component';
import { TM_Sprints } from '@modules/tm/models/TM_Sprints.model';
import { TmService } from '@modules/tm/tm.service';
import { CallFuncService, NotificationsService, ViewsComponent } from 'codx-core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-view-board-info',
  templateUrl: './view-board-info.component.html',
  styleUrls: ['./view-board-info.component.scss']
})
export class ViewBoardInfoComponent implements OnInit {
  @Input() taskBoard = new TM_Sprints ;
  title = "Task Board" ;
  readOnly = false ;
  listUser = [];
  dataAddNew = new BehaviorSubject<any>(null);
  isAddNew = this.dataAddNew.asObservable();
  updateData = new BehaviorSubject<any>(null);
  isUpdate = this.updateData.asObservable();



  @Input('viewBase') viewBase: ViewsComponent;
  constructor(private tmSv: TmService , private notiService : NotificationsService, private callfc: CallFuncService) { }

  ngOnInit(): void {
  }
  

  saveData(id){
    if(this.taskBoard.iterationName == null || this.taskBoard.iterationName.trim()=="") return this.notiService.notify("Tên Task Board không được để trống !")
    if(this.taskBoard.projectID == "" )  this.taskBoard.projectID = null ;
   this.taskBoard.resources = "PMNHI" //test
   if(id){
    this.addTaskBoard(this.taskBoard,false)
   }else  this.addTaskBoard(this.taskBoard,true);
  }

  addTaskBoard(taskBoard,isAdd :boolean){
    this.tmSv.addTaskBoard([taskBoard,isAdd]).subscribe(res=>{
      if(res){
        // this.notiService.notify("Thêm mới thành công !") ;
        this.dataAddNew.next(res)
        this.closeTaskBoard();
      }
      
    })
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
    this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', "obj");
  }
  valueChange(e :any){

  }
  changeVLL(e :any){
   this.taskBoard[e.field] = e.data ;
  }
  cbxChange(e :any){
   this.taskBoard.projectID = e[0]
  }
  changText(e:any){
      this.taskBoard.iterationName = e.data ;
  }
}
