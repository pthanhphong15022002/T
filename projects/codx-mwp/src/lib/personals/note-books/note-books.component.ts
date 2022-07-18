import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, CodxService, ApiHttpService, ImageViewerComponent, CodxSearchBarComponent, CodxCardImgComponent, ButtonModel, UIComponent, SidebarModel, DialogRef, FormModel, CacheService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild, EventEmitter, Output, OnDestroy, Injector, AfterViewInit, Input } from '@angular/core';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { LayoutModel } from '@shared/models/layout.model';
import { AddUpdateNoteBookComponent } from './add-update-note-book/add-update-note-book.component';
import { AddUpdateStorageComponent } from '../storage/add-update-storage/add-update-storage.component';
import { A, I } from '@angular/cdk/keycodes';

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
  urlDetailNoteBook = '';

  @Input() formModel: FormModel;

  @ViewChild('lstCardNoteBooks') lstCardNoteBooks: CodxCardImgComponent;
  @ViewChild('lstNoteBook') lstNoteBook: AddUpdateNoteBookComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('inputSearch') inputSearch: CodxSearchBarComponent;
  @Output() loadData = new EventEmitter();

  constructor(private inject: Injector,
    private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    override codxService: CodxService,
    private modalService: NgbModal,
  ) {
    super(inject);
    this.route.params.subscribe(params => {
      this.funcID = params['funcID'];
    })

    this.cache.functionList('MWP00941').subscribe(res => {
      this.urlDetailNoteBook = res?.url;
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
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  openDetailPage(item) {
    this.codxService.navigate('', this.urlDetailNoteBook, {recID: item.recID})
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

  delete(data: any) {
    this.api
      .exec<any>('ERM.Business.WP', 'NoteBooksBusiness', 'DeleteNoteBookAsync', data.recID)
      .subscribe((res) => {
        if(res) {
          this.view.dataService.data = this.view.dataService.data.filter(x => x.recID != data.recID);
          this.changedt.detectChanges();
        }
      });
  }

  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddUpdateNoteBookComponent, [this.view.dataService.dataSelected, 'edit'], option);
      // this.dialog.closed.subscribe(x => {
      //   this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
      // });
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
        this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
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
    this.view.onSearch(e);
    this.changedt.detectChanges();
  }

}
