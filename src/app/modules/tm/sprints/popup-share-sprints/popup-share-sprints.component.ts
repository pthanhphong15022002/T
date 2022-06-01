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
  listUserDetail = [];
  constructor(private api : ApiHttpService, private callfc: CallFuncService,private changeDetectorRef: ChangeDetectorRef,@Optional() dt?: DialogData, @Optional() dialog?: Dialog) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    if(this.data.resources){
     this.getListUser(this.data.resources) ;
    }
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
        console.log(this.listUserDetail)
      });
      this.changeDetectorRef.detectChanges();
  }
  onDeleteUser(userID) {
    var listUserDetail = [];
    for (var i = 0; i < this.listUserDetail.length; i++) {
      if (this.listUserDetail[i].userID != userID) {
        listUserDetail.push(this.listUserDetail[i]);
      }
    }
    this.listUserDetail = listUserDetail;
    var resources = '';
    if (listUserDetail.length > 0) {
      listUserDetail.forEach((user) => {
        resources += user.userID + ';';
      });
      resources = resources.slice(0, -1);
      this.data.resources = resources;
    } else this.data.resources = '';
  }
  saveData(){

  }

  openDialog() {
    const t = this
    // let obj = {
    //   formName: 'demo',
    //   control: '1',
    //   value: '5',
    //   text: 'demo nè',
    // };
    t.callfc.openForm(CbxpopupComponent, 'Add User', 0, 0, '', 'obj');
  }
}
