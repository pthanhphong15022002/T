import { Component, Optional, ViewChild } from '@angular/core';
import { AuthStore, CallFuncService, CodxService, DialogData, DialogModel, DialogRef, SidebarModel } from 'codx-core';
import { DetailStorageComponent } from '../detail-storage/detail-storage.component';
import { AddUpdateStorageComponent } from '../add-update-storage/add-update-storage.component';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';

@Component({
  selector: 'lib-extend-storage',
  templateUrl: './extend-storage.component.html',
  styleUrls: ['./extend-storage.component.scss']
})
export class ExtendStorageComponent {
  @ViewChild('codxview2') codxview2: CodxView2Component;
  
  dialog:any;
  user:any;
  
  constructor(
    private callfc: CallFuncService,
    private auth : AuthStore,
    private codxService : CodxService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.user = this.auth.get();
  }

  close()
  {
    this.codxService.navigate("","/ws/personal/WS006");
  }

  detailStorage(recID:any)
  {
    var option = new DialogModel();
    option.IsFull = true;
    this.callfc.openForm(DetailStorageComponent,"",null,null,"",recID,"",option);
  }

  addClick(e:any)
  {
    let option = new SidebarModel();
    option.Width = '550px';
    var dialog = this.callfc.openSide(
      AddUpdateStorageComponent,
      {data:{},action:'add',text: 'Thêm'},
      option
    );
    dialog.closed.subscribe((res) => {
      if (res.event){
        this.codxview2.updateDataSource(res.event);
      }
    });
  }
}
