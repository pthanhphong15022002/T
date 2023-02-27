import { PopupTitleComponent } from './popup-title/popup-title.component';
import {
  DialogData,
  AuthStore,
  ApiHttpService,
  DialogRef,
  UIComponent,
  NotificationsService,
  CodxFormComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  Injector,
  ViewChild,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-save-note',
  templateUrl: './save-note.component.html',
  styleUrls: ['./save-note.component.scss'],
})
export class SaveNoteComponent extends UIComponent implements OnInit {
  user: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  data = new Notes();
  header = "";
  dialog: any;
  mssgNoData:string = "";
  views:Array<ViewModel> = [];
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild("itemTemplate") content:TemplateRef<any>;

  constructor(
    private injector: Injector,
    private authStore: AuthStore,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef
  ) 
  {
    debugger
    super(injector);
    this.dialog = dt;
    this.data = data?.data?.itemUpdate;
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.header = data.data?.headerText;
  }

  onInit(): void {
    this.cache.message("SYS010").subscribe((mssg:any) => {
      if(mssg){
        this.mssgNoData = mssg.defaultName;
      }
    });
  }

  ngAfterViewInit() {
    this.views = [{
      type:ViewType.card,
      sameData:true,
      model:{
        template:this.content
      }
    }]
  }

  // getData() {
  //   this.api.exec('ERM.Business.Core', 'DataBusiness', 'LoadDataAsync', this.dialog.formModel).subscribe(res => {
  //
  //   })
  // }

  onEditNote(itemNoteBook) {
    var obj = {
      itemNoteUpdate: this.data,
      itemNoteBookUpdate: itemNoteBook,
      dialogRef: this.dialog,
    };
    this.callfc
      .openForm(PopupTitleComponent, '', 400, 100, '', obj)
      .closed.subscribe((res) => this.dialog.close(res));
  }
}
