import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, ApiHttpService } from 'codx-core';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css']
})
export class PopRolesComponent implements OnInit {

  choose1: tmpformChooseRole[] = [];
  choose = new tmpformChooseRole();
  data: any;
  dialog1: any;
  title = 'Phân quyền người dùng';
  count: number = 0;
  lstFunc = [];
  lstEmp = [];
  constructor(
    private api: ApiHttpService,
    private changeDec: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog1?: DialogRef,
  ) {
    this.dialog1 = dialog1;
    this.data = dt?.data;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api.call('ERM.Business.AD', 'UsersBusiness', 'GetListAppByUserRolesAsync', this.choose1).subscribe((res) => {
      if (res && res.msgBodyData[0]) {
        this.lstFunc = res.msgBodyData[0];
        for (var i = 0; i < this.lstFunc.length; i++) {
          this.lstFunc[i].roleName = this.lstFunc[i].roleNames;
          if (this.lstFunc[i].recIDofRole == '00000000-0000-0000-0000-000000000000') {
            this.lstFunc[i].recIDofRole = null;
          }
        }
        console.log(this.lstFunc);
        this.changeDec.detectChanges();
      }
    })
  }

  onChange(event) {
    console.log(event);
    if (event.target.checked === false) {
      this.choose.recIDofRole = null;
      this.count = this.count - 1;
      if (this.count < 0) {
        this.count = 0;
      }
    }
    if (event.target.checked === true) {
      this.count = this.count + 1;

    }
  }

  onCbx(event){
    if (event.data) {
      this.choose.recIDofRole = event.data[0];
    }
  }

  onSave(){
    var list = []
    for(var i=0; i < this.lstFunc.length; i++){
      if(this.lstFunc[i].recIDofRole){
        list.push(this.lstFunc[i]);
      }
    }
  }
}
