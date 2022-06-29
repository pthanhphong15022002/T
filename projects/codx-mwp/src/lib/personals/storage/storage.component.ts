import { ApiHttpService, AuthStore, CodxCardCenterComponent, CodxService, ResourceModel, ViewsComponent, ViewType, FormModel, ButtonModel, SidebarModel, DialogRef, CallFuncService, UIComponent, CodxListviewComponent } from 'codx-core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewContainerRef, TemplateRef, Input, Injector, AfterViewInit } from '@angular/core';
import { PersonalsComponent } from '../personals.component';
import { LayoutModel } from '@shared/models/layout.model';
import { AddUpdateStorageComponent } from './add-update-storage/add-update-storage.component';
import { DetailStorageComponent } from './detail-storage/detail-storage.component';
import { sort } from '@syncfusion/ej2-angular-charts';

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
  checkFormComment = false;
  dataSort: any = [];
  checkDetail = false;
  funcID = '';
  views = [];
  modelResource: ResourceModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  listStorage = [];

  @ViewChild('lstCardStorage') lstCardStorage: CodxCardCenterComponent;
  @ViewChild('lstStorage') lstStorage: AddUpdateStorageComponent;
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
    this.formModel = this.view.formModel
  }

  testdate(dr) {
  }

  openFormMoreFunc(e) {
    if (e) {
      this.data = e;
      // this.storageDetail.data = e;
    }
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

  formAddNoteBook() {
    this.dataSort = [];
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.view.dataService.data.pop();
      this.dialog = this.callfc.openSide(AddUpdateStorageComponent, [this.view.dataService.data, 'add'], option);
      this.dialog.closed.subscribe(x => {
        if (x.event == null) this.view.dataService.remove(this.view.dataService.dataSelected).subscribe();
        else {
          this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
        }
      });
    });
  }

  edit(data: any) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.dataSort = [];
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddUpdateStorageComponent, [this.view.dataService.dataSelected, 'edit'], option);
      this.dialog.closed.subscribe(x => {
        this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
      });
    });
  }

  formUpdateStorage(e) {
    this.dataSort = [];
  }

  openFormUpdateBackground(content, data) {
    this.dataSort = [];
    this.modalService.open(content, { centered: true });
  }

  delete(data) {
    this.api
      .exec<any>('ERM.Business.WP', 'StoragesBusiness', 'DeleteStorageAsync', data.recID)
      .subscribe((res) => {
        if (res) {
          this.view.dataService.data = this.view.dataService.data.filter(x => x.recID != data.recID);
          this.changedt.detectChanges();
        }
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
    this.view.dataService.data = this.view.dataService.data.sort(function (a, b) {
      var dateA = new Date(a.createdOn).toLocaleDateString();
      var dateB = new Date(b.createdOn).toLocaleDateString();
      return dateA < dateB ? 1 : -1; // ? -1 : 1 for ascending/increasing order
    });
    this.changedt.detectChanges();
  }
}
