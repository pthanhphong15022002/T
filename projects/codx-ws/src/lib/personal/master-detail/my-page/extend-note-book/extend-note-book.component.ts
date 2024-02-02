import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CacheService, CallFuncService, CodxService, DialogData, DialogRef, NotificationsService, SidebarModel, ViewModel, ViewType } from 'codx-core';
import { AddUpdateNoteBookComponent } from '../add-update-note-book/add-update-note-book.component';
import { CodxView2Component } from 'projects/codx-share/src/lib/components/codx-view2/codx-view2.component';

@Component({
  selector: 'lib-extend-note-book',
  templateUrl: './extend-note-book.component.html',
  styleUrls: ['./extend-note-book.component.scss']
})
export class ExtendNoteBookComponent implements OnInit{
  @ViewChild('codxview2') codxview2: CodxView2Component;

  dialog:any;
  user:any;
  urlDetailNoteBook:any;
  formModel:any;
  viewList: Array<ViewModel> = [];

  constructor(
    private callfc: CallFuncService,
    private auth : AuthStore,
    private codxService : CodxService,
    private cache: CacheService,
    private notification : NotificationsService,
    private api: ApiHttpService,
    private ref : ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    this.dialog = dialog;
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.viewList = [
      {
        type: ViewType.list,
        active: true,
      },
      {
        type: ViewType.grid,
        active: false,
      },
    ];
    this.getCache();
  }

  getCache()
  {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.urlDetailNoteBook = res?.url;
      }
    });

    this.cache.functionList('MWP0094').subscribe((res) => {
      if (res) {
        this.formModel =
        {
          entityName : res?.entityName,
          gridViewName : res?.gridViewName,
          formName : res?.formName,
          funcID:"MWP0094"
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
    // var option = new DialogModel();
    // option.IsFull = true;
    // this.callfc.openForm(DetailStorageComponent,"",null,null,"",recID,"",option);
  }

  addClick(e:any)
  {
    let option = new SidebarModel();
    option.Width = '550px';
    option.DataService = null;
    var dialog = this.callfc.openSide(
      AddUpdateNoteBookComponent,
      [null, 'add'],
      option
    );
    dialog.closed.subscribe((res) => {
      if (res.event){
        this.codxview2.addDataSource(res.event);
      }
    });
  }

  openDetailPage(recID:any) {
    this.codxService.navigate('', this.urlDetailNoteBook, {
      recID: recID,
    });
  }

  clickMFNoteBook(e:any,data:any)
  {
    switch(e?.functionID)
    {
      //Chỉnh sửa
      case "SYS03":
        {
          let option = new SidebarModel();
          var dialog = this.callfc.openSide(
            AddUpdateNoteBookComponent,
            [data, 'edit'],
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event) {
              res.event['modifiedOn'] = new Date();
              this.codxview2.updateDataSource(res.event);
            }
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
      //Chi tiết sổ tay
      case "MWP00941":
        {
          this.codxService.navigate('', this.urlDetailNoteBook, {
            recID: data?.recID,
          });
          break;
        }

    }
  }

}
