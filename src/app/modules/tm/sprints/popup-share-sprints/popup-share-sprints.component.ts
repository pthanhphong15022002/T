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
  listIdUser = [];
  userID = '';
  constructor(private api : ApiHttpService, private callfc: CallFuncService,private changeDetectorRef: ChangeDetectorRef,@Optional() dt?: DialogData, @Optional() dialog?: Dialog) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.listUserDetailOld = this.data;
    for (var i = 0; i < this.data.length; i++) {
      this.listIdUser.push(this.data.userID);
    }
  }
  ngOnInit(): void {
  
  }


  onDeleteUser(userID) {
    var listUserDetail = [];
    var listIdUser = [];
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].userID != userID) {
        listUserDetail.push(this.data[i]);
        listIdUser.push(this.data[i])
      }
    }
    this.data = listUserDetail;
    this.listIdUser = listIdUser;
  }
  saveData(){
    this.api.execSv<any>("TM", "TM", "SprintsBusiness", "DeleteSprintsByIDAsync", [])
    this.dialog.hide();
  }

  openDialog() {
    // const t = this
    // let obj = {
    //   formName: 'demo',
    //   control: '1',
    //   value: '5',
    //   text: 'demo nè',
    // };
    this.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', 'obj');
  }
  showControl(p, userID) {
    this.userID = userID;
    p.open();
  }
}
