import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { CbxpopupComponent } from '@modules/tm/controls/cbxpopup/cbxpopup.component';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CallFuncService, DialogData } from 'codx-core';
import { count } from 'console';

@Component({
  selector: 'app-popup-share-sprints',
  templateUrl: './popup-share-sprints.component.html',
  styleUrls: ['./popup-share-sprints.component.scss']
})
export class PopupShareSprintsComponent implements OnInit {
  data: any;
  dialog: any;
  searchField = "";
  listUserDetailOld = [];
  listIdUserOld = [];
  listIdUser = [];
  userID = '';
  listUserDetail = [] ;
  taskBoard :any
  constructor(private api : ApiHttpService, private callfc: CallFuncService,private changeDetectorRef: ChangeDetectorRef,@Optional() dt?: DialogData, @Optional() dialog?: Dialog) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.taskBoard = this.data.boardAction;
    this.listUserDetailOld = this.data.listUserDetail;
    this.listUserDetail = this.listUserDetailOld 
    for (var i = 0; i < this.listUserDetail.length; i++) {
      this.listIdUser.push(this.listUserDetail[i].userID);
    }
    this.listIdUserOld = this.listIdUser ;
  }
  ngOnInit(): void {
  
  }


  onDeleteUser(userID) {
    var listUserDetail = [];
    var listIdUser = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
        listIdUser.push(this.listUserDetail[i].userID)
      }
    }
    this.listUserDetail = listUserDetail;
    this.listIdUser = listIdUser;
    this.changeDetectorRef.detectChanges();
  }
  saveData(){
    var strIdUser ="";
    if(this.listIdUser.length > 0){
      strIdUser = this.listIdUser[0];
      for(var i=1; i<this.listIdUser.length ;i++){
        strIdUser+=";"+this.listIdUser[i];
      }
    }
    var strIdUser ='ADMIN;PMNHI;VVQUANG;NVHAO;NTLOI'; //danh sach add de share demo sau phai xoa
    this.api.execSv("TM","TM","SprintsBusiness","AddShareOfSprintsAsync",[this.taskBoard.iterationID,strIdUser]).subscribe(res=>{
      if(res){
        this.dialog.hide(res);
      }else{
        this.dialog.hide(false);
      }
    })
    
  }

  openDialog() {
   
    this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', this.listIdUser).subscribe((dt: any) => {
        var that = this;
        dt.close = function (e) {
          return that.addUser(e, that);
        };
    });;
  }
  showControl(p, userID) {
    this.userID = userID;
    p.open();
  }

  addUser(e,t:PopupShareSprintsComponent ){
   var resultListUser = 'ADMIN;PMNHI;VVQUANG;NVHAO;NTLOI' ; //danh sach add de shre
   t.getListUser(resultListUser);
   t.changeDetectorRef.detectChanges() ;
  }

  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListUserDetailAsync',
        listUser
      )
      .subscribe((res) => {
        this.listUserDetail = res;
      });
  }
}
