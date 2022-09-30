import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Observable, Subject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Injector,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { LayoutService } from '@shared/services/layout.service';
import {
  ApiHttpService,
  NotificationsService,
  AuthStore,
  ImageViewerComponent,
  CodxListviewComponent,
  ViewsComponent,
  ButtonModel,
  ViewModel,
  ViewType,
  CacheService,
  UIComponent,
  SidebarModel,
  DialogRef,
} from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { AddGiftsComponent } from './add-gifts/add-gifts.component';

@Component({
  selector: 'app-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent extends UIComponent implements OnInit {
  @Input() functionObject;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('template') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  textsearch: string;
  pageNo: number;
  addEditForm: FormGroup;
  isAddMode = true;
  onHandForm: FormGroup;
  lstMoreFunction = [];
  searchType: string = '0';
  predicate = 'Category=@0';
  dataValue: string = '1';
  user;
  pageSize: number;
  reload = false;
  giftIDCurrentHover: string;
  funcID = '';
  views: Array<ViewModel> = [];
  showHeader: boolean = true;
  userPermission: any;
  dataItem: any;
  description: any;
  functionList: any;
  gridViewSetup: any;
  button?: ButtonModel;
  formModel: any;
  dialog!: DialogRef;

  popupFiled = 1;

  constructor(
    private injector: Injector,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private modalService: NgbModal,
    private changedr: ChangeDetectorRef,
    private auth: AuthStore,
    private dt: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.route.params.subscribe((param) => {
      if (param) this.funcID = param['funcID'];
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.formModel = {
          entityName: this.functionList.entityName,
          entityPermission: this.functionList.entityName,
          formName: this.functionList.formName,
          gridViewName: this.functionList.gridViewName,
          funcID: this.funcID,
        };
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.initForm();
    this.initHandForm();
    this.user = this.auth?.get();
    this.loadSettingMoreFunction();
    this.changedr.detectChanges();
  }

  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        active: true,
        model: {
          template: this.panelLeftRef,
        },
      },
    ];
    this.userPermission = this.viewbase.userPermission;
    this.changedr.detectChanges();
  }

  valueChange(event) {
    if (event) {
      var field = event.field;
      var dt = event.data;
      var obj = {};
      obj[field] = dt?.value ? dt.value : dt;
      this.addEditForm.patchValue(obj);
    }
  }

  openFormCreate(e, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.closeInfor();
      this.getGiftID();
    } else {
      this.isAddMode = false;
      this.addEditForm.patchValue(this.dataItem);
    }
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    var obj = {
      formType: 'edit',
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(AddGiftsComponent, obj, option);
        // this.dialog.closed.subscribe((e) => {
        //   if (e?.event == null)
        //     this.view.dataService.delete(
        //       [this.view.dataService.dataSelected],
        //       false
        //     );
        // });
      });
  }

  clickClosePopup() {
    this.closeInfor();
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }

  openInfor(): void {
    const doc = document.getElementById('update_infor');
    doc.classList.add('offcanvas-on');
  }
  closeInfor(): void {
    this.clearInfor();
  }

  clearInfor() {
    this.addEditForm.controls['giftName'].setValue('');
    this.addEditForm.controls['giftID'].setValue('');
    this.addEditForm.controls['groupID'].setValue('');
    this.addEditForm.controls['owner'].setValue('');
    this.addEditForm.controls['memo'].setValue('');
    this.addEditForm.controls['description'].setValue('');
    this.addEditForm.controls['price'].setValue(0);
    this.addEditForm.controls['onhand'].setValue(0);
    this.addEditForm.controls['reservedQty'].setValue(0);
    this.addEditForm.controls['availableQty'].setValue(0);
    this.changedr.detectChanges();
  }
  initForm() {
    const user = this.auth?.get();
    this.addEditForm = this.fb.group(
      {
        giftName: ['', Validators.compose([Validators.required])],
        giftID: ['', Validators.compose([Validators.required])],
        image: ['', Validators.compose([])],
        groupID: ['', Validators.compose([Validators.required])],
        description: ['', Validators.compose([])],
        memo: ['', Validators.compose([])],
        price: [0, Validators.compose([Validators.required])],
        onhand: [0, Validators.compose([Validators.required])],
        reservedQty: [0, Validators.compose([Validators.required])],
        availableQty: [0, Validators.compose([Validators.required])],
        owner: [user.userID, Validators.compose([Validators.required])],
        orgUnitID: [user['buid'], Validators.compose([])],
      },
      { updateOn: 'blur' }
    );
  }

  loadSettingMoreFunction() {
    this.loadMoreFunction('FED204211', 'Gifts', 'grvGifts').subscribe((res) => {
      if (res?.length > 0) {
        this.lstMoreFunction = res;
      }
    });
  }

  loadMoreFunction(functionID: string, formName: string, gridViewName: string) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetWithPermAsync',
      [functionID, formName, gridViewName]
    );
  }

  clickMoreFuntion(funtionID, item, templateForm) {
    switch (funtionID) {
      case 'FED204211':
        this.openFormChangeOnhand(templateForm, item);
        break;
      default:
        break;
    }
  }

  getGiftID() {
    this.getOneFieldAutonumber(this.funcID).subscribe((key) => {
      this.addEditForm.patchValue({ giftID: key });
    });
  }

  getOneFieldAutonumber(functionID): Observable<any> {
    var subject = new Subject<any>();
    this.api
      .call('AD', 'AutoNumbersBusiness', 'CreateAutoNumberByFunction', [
        functionID,
        null,
      ])
      .subscribe((item) => {
        if (item && item.msgBodyData.length > 0)
          subject.next(item.msgBodyData[0][1]);
      });
    return subject.asObservable();
  }

  openForm(data, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.initForm();
    } else {
      this.isAddMode = false;
      this.addEditForm.patchValue(data);
    }
    this.openInfor();
  }
  changeCombobox(data, field) {
    if (field === 'owner' && data[0]) {
      this.addEditForm.patchValue({ owner: data[0] });
      this.addEditForm.patchValue({ orgUnitID: data.data.BUID });
    }
    if (field === 'groupID' && data[0]) {
      this.addEditForm.patchValue({ groupID: data[0] });
    }
  }
  deleteGift(item) {
    this.notificationsService.alertCode('').subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == 'Y') {
            that.api
              .call('FD', 'GiftsBusiness', 'DeleteGiftAsync', [item.giftID])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0][0] == true) {
                    // that.listView.removeHandler(item, "giftID");
                    that.changedr.detectChanges();
                  } else {
                    that.notificationsService.notify(res.msgBodyData[0][1]);
                  }
                }
              });
          }
        }
      };
    });
  }

  PopoverEmpLeave(p: any) {
    p.close();
  }

  initHandForm() {
    this.onHandForm = this.fb.group(
      {
        giftID: ['', Validators.compose([Validators.required])],
        giftName: ['', Validators.compose([Validators.required])],
        memo: ['', Validators.compose([Validators.required])],
        onhand: ['', Validators.compose([Validators.required])],
        newOnhand: [0, Validators.compose([Validators.required])],
      },
      { updateOn: 'blur' }
    );
  }

  changeHand(e) {
    if (e) {
      this.onHandForm.controls['newOnhand'].setValue(e.data.value);
    }
  }

  openFormChangeOnhand(form, item) {
    this.onHandForm = this.fb.group(
      {
        giftID: [item.giftID],
        giftName: [item.giftName],
        memo: [item.memo],
        onhand: [item.onhand == null ? 0 : item.onhand],
        newOnhand: [0, Validators.compose([Validators.required])],
      },
      { updateOn: 'blur' }
    );
    this.modalService.open(form, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
    this.changedr.detectChanges();
  }
  changeEditor(data) {
    this.addEditForm.patchValue({ description: data.data });
  }
  onChangeOnHandOfGift() {
    if (this.onHandForm.invalid == true) {
      return 0;
    }
    return this.api
      .call('FD', 'GiftsBusiness', 'UpdateOnHandOfGiftsAsync', [
        this.onHandForm.controls['giftID'].value,
        this.onHandForm.controls['newOnhand'].value,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0][0] == true) {
            let data = res.msgBodyData[0][2];
            // this.listView.addHandler(data, false, "giftID");
            this.modalService.dismissAll();
          } else {
            this.notificationsService.notify(res.msgBodyData[0][1]);
          }
        }
      });
  }

  onSaveGift() {
    if (this.addEditForm.status == 'INVALID') {
      this.addEditForm.markAllAsTouched();
      this.notificationsService.notify('Vui lòng kiểm tra lại thông tin nhập');
      return 0;
    } else {
      return this.api
        .call('FD', 'GiftsBusiness', 'AddEditGiftAsync', [
          this.addEditForm.value,
          this.isAddMode,
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            if (res.msgBodyData[0][0] == true) {
              this.closeInfor();
              let data = res.msgBodyData[0][2];
              this.imageUpload
                .updateFileDirectReload(data.giftID)
                .subscribe((result) => {
                  if (result) {
                    this.initForm();
                    this.loadData.emit();

                    // this.listView.addHandler(data, this.isAddMode, "giftID");
                    this.changedr.detectChanges();
                  } else {
                    this.initForm();
                    // this.listView.addHandler(data, this.isAddMode, "giftID");
                    this.changedr.detectChanges();
                  }
                });
              this.clickClosePopup();
            } else {
              this.notificationsService.notify(res.msgBodyData[0][1]);
            }
          }
        });
    }
  }
  extendShow2(): void {
    const body = document.getElementById('update_infor');
    if (body.childNodes.length == 0) return;
    if (body.classList.contains('extend-show'))
      body.classList.remove('extend-show');
    else body.classList.add('extend-show');
  }

  showDescription(data) {
    this.description = data;
  }

  lstElastisSearch: any;
  // action(para: ActionArg): void {
  //   switch (para.type) {
  //     case ActionType.add:
  //       this.openForm(null, true);
  //       break;
  //     case ActionType.advFilter:
  //       this.listView.setSearchAdv(JSON.stringify(para.arg));
  //       break;
  //     case ActionType.quickSearch:
  //       this.searchType = para.searchType;
  //       if (para.searchType == "1") {
  //         this.listView.SearchText = para.arg;
  //         this.listView.onChangeSearch();
  //         break;
  //       } else if (para.searchType == "2") {
  //         if (para?.arg == "") {
  //           this.searchType = "0";
  //           this.predicate = "Category=@0";
  //           this.dataValue = "1";
  //         } else {
  //           this.lstElastisSearch = para.lstFTsearch;
  //         }
  //         this.dt.detectChanges();
  //       }
  //   }
  // }
  openTangqua() {}

  convertDateTime(date) {
    var datetime = new Date(date);
    return datetime;
  }

  clickMF(event: any, data: any) {}
}
