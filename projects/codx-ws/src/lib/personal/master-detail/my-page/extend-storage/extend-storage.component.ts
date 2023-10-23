import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CacheService, CallFuncService, CodxService, DialogData, DialogModel, DialogRef, NotificationsService, SidebarModel } from 'codx-core';
import { DetailStorageComponent } from '../detail-storage/detail-storage.component';
import { AddUpdateStorageComponent } from '../add-update-storage/add-update-storage.component';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';

@Component({
  selector: 'lib-extend-storage',
  templateUrl: './extend-storage.component.html',
  styleUrls: ['./extend-storage.component.scss']
})
export class ExtendStorageComponent implements OnInit{
  @ViewChild('codxview2') codxview2: CodxView2Component;
  
  dialog:any;
  user:any;
  formModel:any;

  constructor(
    private callfc: CallFuncService,
    private auth : AuthStore,
    private codxService : CodxService,
    private notification : NotificationsService,
    private api : ApiHttpService,
    private cache : CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.formModel = 
        {
          entityName : res?.entityName,
          gridViewName : res?.gridViewName, 
          formName : res?.formName,
          funcID:"MWP00941"
        }
      }
    });
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
        this.codxview2.addDataSource(res.event);
      }
    });
  }

  clickMFStorage(e:any,data:any)
  {
    switch(e?.functionID)
    {
      //Chỉnh sửa
      case "SYS03":
        {
          var dialog = this.callfc.openSide(
            AddUpdateStorageComponent,
            {data:data,action:'edit',text: e?.text},
          );
          dialog.closed.subscribe((res) => {
            debugger
            if (res.event) this.codxview2.updateDataSource(res.event);
          });
          break;
        }
      //Xóa
      case "SYS02":
        {
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notification.alertCode('SYS030').subscribe((x) => {
            if (x.event.status == 'Y') {
              this.api.execSv("WP","WP","NoteBooksBusiness","DeleteNoteBookAsync",data?.recID).subscribe(item=>{
                if(item) this.codxview2.deleteDataSource(item);
              })
            }
          });
          break;
        }
    }
  }
}
