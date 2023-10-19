import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CacheService, CallFuncService, CodxService, DialogData, DialogRef, SidebarModel } from 'codx-core';
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
  constructor(
    private callfc: CallFuncService,
    private auth : AuthStore,
    private codxService : CodxService,
    private cache: CacheService,
    private ref : ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.getCache();
  }

  getCache()
  {
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.urlDetailNoteBook = res?.url;
        this.formModel = 
        {
          entityName : res?.entityName,
          gridViewName : res?.gridViewName, 
          formName : res?.formName,
          funcID: 'MWP00941'
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
        this.codxview2.updateDataSource(res.event);
      }
    });
  }

  openDetailPage(recID:any) {
    this.codxService.navigate('', this.urlDetailNoteBook, {
      recID: recID,
    });
  }
}
