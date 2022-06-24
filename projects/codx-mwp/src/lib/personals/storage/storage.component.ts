import { ApiHttpService, AuthStore, CodxCardCenterComponent, CodxService, ResourceModel, ViewsComponent, ViewType, FormModel } from 'codx-core';
import { UpdateStorageComponent } from './update-storage/update-storage.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddStorageComponent } from './add-storage/add-storage.component';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { PersonalsComponent } from '../personals.component';
import { DetailStorageComponent } from './detail/detail-storage/detail-storage.component';
import { LayoutModel } from '@shared/models/layout.model';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
@Input() formModel:FormModel;
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

  @ViewChild('lstCardStorage') lstCardStorage: CodxCardCenterComponent;
  @ViewChild('lstStorage') lstStorage: AddStorageComponent;
  @ViewChild('lstUpdateStorage') lstUpdateStorage: UpdateStorageComponent;
  @ViewChild('dataUpdateStorage') dataUpdateStorage: UpdateStorageComponent;
  @ViewChild('detail', { read: ViewContainerRef }) detail!: ViewContainerRef;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('cardTemp') cardTemp : TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
    private codxService: CodxService,
    private api: ApiHttpService,
    private modalService: NgbModal,
  ) {
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.route.params.subscribe(params => {
      this.funcID = params['funcID'];
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  testdate(dr){
    console.log(dr);
  }

  openFormMoreFunc(e) {
    if (e) {
      this.data = e;
      // this.storageDetail.data = e;
    }
  }

  formAddNoteBook() {
    this.lstStorage.lstStorage = this.lstCardStorage;
    this.dataSort = [];
    this.changedt.detectChanges();
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
