import { ApiHttpService, AuthStore, CodxCardCenterComponent, CodxService, ResourceModel, ViewsComponent, ViewType, FormModel, ButtonModel, SidebarModel, DialogRef, CallFuncService, UIComponent, CodxListviewComponent } from 'codx-core';
import { UpdateStorageComponent } from './update-storage/update-storage.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewContainerRef, TemplateRef, Input, Injector, AfterViewInit } from '@angular/core';
import { PersonalsComponent } from '../personals.component';
import { DetailStorageComponent } from './detail/detail-storage/detail-storage.component';
import { LayoutModel } from '@shared/models/layout.model';
import { AddUpdateStorageComponent } from './add-update-storage/add-update-storage.component';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent extends UIComponent implements OnInit, AfterViewInit {
  @Input() formModel: FormModel;
  user: any;
  dataValue = '';
  predicate = 'CreatedBy=@0';
  data: any;
  recID: any;
  toolbarButtonMarginClass = 'ms-1 ms-lg-3';
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px';
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px';
  toolbarButtonIconSizeClass = 'svg-icon-1';
  checkFormComment = false;
  dataSort: any = [];
  checkDetail = false;
  funcID = '';
  views = [];
  userPermission: any;
  modelResource: ResourceModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  listStorage = [];

  @ViewChild('lstCardStorage') lstCardStorage: CodxCardCenterComponent;
  @ViewChild('lstStorage') lstStorage: AddUpdateStorageComponent;
  @ViewChild('lstUpdateStorage') lstUpdateStorage: UpdateStorageComponent;
  @ViewChild('dataUpdateStorage') dataUpdateStorage: UpdateStorageComponent;
  @ViewChild('detail', { read: ViewContainerRef }) detail!: ViewContainerRef;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(private inject: Injector,
    private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private modalService: NgbModal,
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.route.params.subscribe(params => {
      this.funcID = params['funcID'];
    })
  }

  onInit(): void {
  }

  ngAfterViewInit() {
    this.listStorage = this.view.dataService.data;
  }

  testdate(dr) {
  }

  openFormMoreFunc(e) {
    if (e) {
      this.data = e;
      // this.storageDetail.data = e;
    }
  }

  formAddNoteBook() {
    // this.lstStorage.lstStorage = this.lstCardStorage;
    // this.dataSort = [];
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddUpdateStorageComponent, [this.view.dataService.data, 'add'], option);
      this.dialog.closed.subscribe(x => {
        if (x.event == null) this.view.dataService.remove(this.view.dataService.dataSelected).subscribe();
        else {
          this.view.dataService.update(x.event).subscribe();
          this.view.dataService.setDataSelected(x.event);
        }
      });
    });
  }

  formUpdateStorage(e) {
    this.dataSort = [];
    this.lstUpdateStorage.lstStorage = this.lstCardStorage;
    this.dataUpdateStorage.data = e;
  }

  openFormUpdateBackground(content, data) {
    this.dataSort = [];
    this.modalService.open(content, { centered: true });
  }

  onDelete(data) {
    this.api
      .exec<any>('ERM.Business.WP', 'StoragesBusiness', 'DeleteStorageAsync', data.recID)
      .subscribe((res) => {
        var dt = res;
        // this.lstCardStorage.removeHandler(dt, "recID");
        this.changedt.detectChanges();
      });
  }

  openStorageDetail(e) {
    this.dataSort = [];
    this.checkFormComment = true;
    this.changedt.detectChanges();

    var arr = [];
    for (let i = 0; i < e?.details.length; i++) {
      arr.push(e?.details[i].refID);
    }

    var a = this.detail.createComponent(DetailStorageComponent);
    a.instance.predicate = `(CreatedBy="${this.user?.userID}") and (@0.Contains(outerIt.RecID))`;
    a.instance.dataValue = `${arr}`;
  }

  onUpdateBackground(e) {

  }

  back() {
    this.checkFormComment = false;
  }

  sortStorage() {
    var item = '';
    // for (let i = this.lstCardStorage.data.length - 1; i >= 0; i--) {
    //   item = this.lstCardStorage.data[i];
    //   this.dataSort.push(item);
    // }

    // this.lstCardStorage.data = this.dataSort;
    this.changedt.detectChanges();
  }
}
