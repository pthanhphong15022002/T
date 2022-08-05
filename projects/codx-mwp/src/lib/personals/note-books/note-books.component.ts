import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  CodxService,
  ApiHttpService,
  ImageViewerComponent,
  CodxSearchBarComponent,
  CodxCardImgComponent,
  ButtonModel,
  UIComponent,
  SidebarModel,
  DialogRef,
  FormModel,
  CacheService,
  CodxListviewComponent,
  CRUDService,
  ScrollComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  Injector,
  AfterViewInit,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { LayoutModel } from '@shared/models/layout.model';
import { AddUpdateNoteBookComponent } from './add-update-note-book/add-update-note-book.component';
import { AddUpdateStorageComponent } from '../storage/add-update-storage/add-update-storage.component';
import { A, I } from '@angular/cdk/keycodes';
import { NoteBookServices } from '../../services/notebook.services';

@Component({
  selector: 'app-note-books',
  templateUrl: './note-books.component.html',
  styleUrls: ['./note-books.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoteBooksComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  predicate = 'CreatedBy=@0';
  dataValue = '';
  user: any;
  data: any;
  onUpdate = false;
  recID: any;
  dataSort: any = [];
  views = [];
  dialog!: DialogRef;
  urlDetailNoteBook = '';

  @ViewChild('lstCardNoteBooks') lstCardNoteBooks: CodxCardImgComponent;
  @ViewChild('lstNoteBook') lstNoteBook: AddUpdateNoteBookComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('listView') listView: CodxListviewComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private modalService: NgbModal,
    private noteBookService: NoteBookServices
  ) {
    super(inject);
    this.cache.functionList('MWP00941').subscribe((res) => {
      this.urlDetailNoteBook = res?.url;
    });

    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
  }

  onInit(): void {
    this.noteBookService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;

        if (type == 'edit') {
          (this.listView.dataService as CRUDService).update(data).subscribe();
        }
      }
    });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'MWP00941':
        this.openDetailPage(data);
    }
  }

  openDetailPage(item) {
    this.codxService.navigate('', this.urlDetailNoteBook, {
      recID: item.recID,
    });
  }

  openFormMoreFunc(data: any) {
    this.data = data;
    this.onUpdate = true;
  }

  delete(data: any) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NoteBooksBusiness',
        'DeleteNoteBookAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          (this.listView.dataService as CRUDService).remove(data).subscribe();
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteByObjectIDAsync',
              [res.recID, 'WP_NoteBooks', true]
            )
            .subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  edit(data: any) {
    if (data) {
      this.listView.dataService.dataSelected = data;
    }
    (this.listView.dataService as CRUDService)
      .edit(this.listView.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.listView?.dataService;
        option.FormModel = this.listView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [this.listView.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  openFormUpdateBackground(content, recID) {
    this.recID = recID;
    this.modalService.open(content, { centered: true });
  }

  onUpdateBackground(data) {
    if (data) {
      this.imageUpload
        .updateFileDirectReload(data?.recID)
        .subscribe((result) => {
          if (result) {
            this.loadData.emit();
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  formAddNoteBook() {
    (this.listView.dataService as CRUDService)
      .addNew()
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.listView?.dataService;
        option.FormModel = this.listView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddUpdateNoteBookComponent,
          [this.listView.dataService.data, 'add'],
          option
        );
      });
  }

  sortNoteBooks() {
    this.listView.dataService.data = this.listView.dataService.data.sort(
      function (a, b) {
        var dateA = new Date(a.createdOn).toLocaleDateString();
        var dateB = new Date(b.createdOn).toLocaleDateString();
        return dateA < dateB ? 1 : -1; // ? -1 : 1 for ascending/increasing order
      }
    );
    console.log("check data", this.listView.dataService.data)
    this.detectorRef.detectChanges();
  }

  onSearch(e) {
    this.listView.dataService.search(e).subscribe();
    this.detectorRef.detectChanges();
  }
}
