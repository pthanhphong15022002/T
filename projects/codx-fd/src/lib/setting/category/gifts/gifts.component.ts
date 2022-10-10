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
  DialogModel,
} from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { AddGiftsComponent } from './add-gifts/add-gifts.component';
import { AddWarehouseComponent } from './add-warehouse/add-warehouse.component';
import { CodxFdService } from '../../../codx-fd.service';

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
  dialog!: DialogRef;
  viewType = ViewType;
  headerText = '';

  popupFiled = 1;

  constructor(
    private injector: Injector,
    private modalService: NgbModal,
    private changedr: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private auth: AuthStore,
    private route: ActivatedRoute,
    private fdSV: CodxFdService
  ) {
    super(injector);
    this.route.params.subscribe((param) => {
      if (param) this.funcID = param['funcID'];
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList = res;
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
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

  giftID: any;
  add(e: any) {
    this.headerText = e?.text;
    var obj = {
      formType: 'add',
      headerText: this.headerText,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(AddGiftsComponent, obj, option);
      this.dialog.closed.subscribe((e) => {
        if (e?.event?.data) {
          this.view.dataService.add(e.event?.data, 0).subscribe();
          this.changedr.detectChanges();
        }
        if (e?.event?.file) {
          e.event.data.modifiedOn = new Date();
          this.view.dataService.update(e.event?.data).subscribe();
          this.changedr.detectChanges();
        }
      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    var obj = {
      formType: 'edit',
      headerText: this.headerText,
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(AddGiftsComponent, obj, option);
        this.dialog.closed.subscribe((e: any) => {
          if (e?.event?.data) e.event.data.modifiedOn = new Date();
          this.view.dataService.update(e.event?.data).subscribe();
          this.changedr.detectChanges();
        });
      });
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
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

  PopoverEmpLeave(p: any) {
    p.close();
  }

  changeHand(e) {
    if (e) {
      this.onHandForm.controls['newOnhand'].setValue(e.data.value);
    }
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

  convertDateTime(date) {
    var datetime = new Date(date);
    return datetime;
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe((res: any) => {
        if (res)
          this.fdSV
            .deleteFile(res.giftID, this.functionList.entityName)
            .subscribe();
      });
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteGiftAsync';
    op.data = data?.giftID;
    return true;
  }

  openFormWarehouse(data) {
    var obj = {
      data: data,
    };
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new DialogModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        this.dialog = this.callfc.openForm(
          AddWarehouseComponent,
          '',
          600,
          400,
          '',
          obj,
          '',
          option
        );
        this.dialog.closed.subscribe((e: any) => {
          if (e?.event) {
            this.view.dataService.update(e.event).subscribe();
            this.changedr.detectChanges();
          }
        });
      });
  }

  clickMF(e: any, data: any) {
    this.headerText = e?.text;
    if (e) {
      switch (e.functionID) {
        case 'SYS02':
          this.delete(data);
          break;
        case 'SYS03':
          this.edit(data);
          break;
        case 'FED204211':
          this.openFormWarehouse(data);
          break;
      }
    }
  }
}
