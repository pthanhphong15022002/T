import { Component, OnInit, Optional } from '@angular/core';
import { AuthStore, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-pop-add-projectgroup',
  templateUrl: './pop-add-projectgroup.component.html',
  styleUrls: ['./pop-add-projectgroup.component.css']
})
export class PopAddProjectgroupComponent implements OnInit {

  title = 'Thêm nhóm dự án';
  dialog: any;
  user: any;
  functionID: string;
  constructor(
    private authStore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData,
  ) { 
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
  }

}
