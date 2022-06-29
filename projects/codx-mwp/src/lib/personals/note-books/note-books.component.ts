import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateNoteBookComponent } from './update-note-book/update-note-book.component';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, CodxService, ApiHttpService, ImageViewerComponent, CodxSearchBarComponent, CodxCardImgComponent, ButtonModel, UIComponent, SidebarModel, DialogRef, FormModel } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild, EventEmitter, Output, OnDestroy, Injector, AfterViewInit, Input } from '@angular/core';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { LayoutModel } from '@shared/models/layout.model';
import { AddUpdateNoteBookComponent } from './add-update-note-book/add-update-note-book.component';
import { AddUpdateStorageComponent } from '../storage/add-update-storage/add-update-storage.component';

@Component({
  selector: 'app-note-books',
  templateUrl: './note-books.component.html',
  styleUrls: ['./note-books.component.scss']
})
export class NoteBooksComponent extends UIComponent implements OnInit, AfterViewInit {

  predicate = "CreatedBy=@0";
  dataValue = "";
  user: any;
  funcID = "";
  data: any;
  onUpdate = false;
  recID: any;
  dataSort: any = [];
  views = [];
  moreFuncs: Array<ButtonModel> = [];
  dialog!: DialogRef;
  
  @Input() formModel: FormModel;

  @ViewChild('lstCardNoteBooks') lstCardNoteBooks: CodxCardImgComponent;
  @ViewChild('lstNoteBook') lstNoteBook: AddUpdateNoteBookComponent;
  @ViewChild('lstNoteBookUpdate') lstNoteBookUpdate: UpdateNoteBookComponent;
  @ViewChild('appEdit') appEdit: UpdateNoteBookComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('inputSearch') inputSearch: CodxSearchBarComponent;
  @Output() loadData = new EventEmitter();

  constructor(private inject: Injector,
    private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private modalService: NgbModal,
  ) {
    super(inject);
    this.route.params.subscribe(params => {
      this.funcID = params['funcID'];
    })

    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
  }

  onInit(): void {
    this.moreFuncs = [
      {
        id: 'edit',
        icon: 'icon-list-checkbox',
        text: 'Sửa',
      },
      {
        id: 'btnMF2',
        icon: 'icon-list-checkbox',
        text: 'more 2',
      },
    ];
  }

  ngAfterViewInit() {
    this.formModel = this.view.formModel;
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'edit':
        // this.edit(data);
        break;
      case 'delete':
        // this.delete(data);
        break;
    }
  }

  openDetailPage(recID) {
    this.codxService.navigate('', `mwp/noteDetails/${this.funcID}`, { recID: recID });
  }

  openFormMoreFunc(data: any) {
    this.data = data;
    this.onUpdate = true;
  }

  closePopover(p: any) {
    this.hidePopOver(p);
  }

  hidePopOver(popover: any) {
    setTimeout(() => {
      if (!isNullOrUndefined(popover)) {
        popover.close();
      }
    }, 5000);
  }

  onDelete(data: any) {
    this.api
      .exec<any>('ERM.Business.WP', 'NoteBooksBusiness', 'DeleteNoteBookAsync', data.recID)
      .subscribe((res) => {
        var dt = res;
        // this.lstCardNoteBooks.removeHandler(dt, "recID");
        this.changedt.detectChanges();
      });
  }

  formUpdateNoteBook(data: any) {
    this.appEdit.data = data;
    this.lstNoteBookUpdate.lstNoteBook = this.lstCardNoteBooks;
    this.changedt.detectChanges();
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
            this.changedt.detectChanges();
          }
        });
    }
  }

  formAddNoteBook() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.data.pop();
      this.dialog = this.callfc.openSide(AddUpdateNoteBookComponent, [this.view.dataService.data, 'add'], option);
      this.dialog.closed.subscribe(x => {
        if (x.event == null) this.view.dataService.remove(this.view.dataService.dataSelected).subscribe();
        else {
          this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
        }
      });
    });
  }

  sortNoteBooks() {
    this.view.dataService.data = this.view.dataService.data.sort(function (a, b) {
      var dateA = new Date(a.createdOn).toLocaleDateString();
      var dateB = new Date(b.createdOn).toLocaleDateString();
      return dateA < dateB ? 1 : -1; // ? -1 : 1 for ascending/increasing order
    });
    this.changedt.detectChanges();
  }

  onSearch(e) {
    // this.lstCardNoteBooks.onSearch(e);
    this.changedt.detectChanges();
  }

}
