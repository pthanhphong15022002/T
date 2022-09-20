import { Observable, Subject } from 'rxjs';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, TemplateRef, ContentChild, Injector, EventEmitter, Output } from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, ButtonModel, CodxGridviewComponent, ImageViewerComponent, NotificationsService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';

@Component({
  selector: 'app-giftgroup',
  templateUrl: './giftgroup.component.html',
  styleUrls: ['./giftgroup.component.scss']
})
export class GiftgroupComponent implements OnInit {

  funcID = 'FDS0121';
  views: Array<ViewModel> = [];
  dataItem: any;
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo: TemplateRef<any>;
  @ViewChild("subheader") subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  myModel = {
    template: null
  };
  constructor(
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private mwpService: CodxMwpService,
    private authStore: AuthStore,
    injector: Injector,
  ) {
    this.user = this.authStore.get();
  }
  button: Array<ButtonModel> = [{
    id: '1',
  }]
  columnsGrid = [];
  ngOnInit(): void {
    this.initForm();
    this.columnsGrid = [
      // { field: 'noName', nameColumn: '', template: this.GiftIDCell, width: 40 },
      { field: 'giftID', headerText: 'Mã đơn', width: 50 },
      { field: 'giftName', headerText: 'Tên nhóm quà tặng', width: 150 },
      { field: 'memo', headerText: 'Mô tả', template: this.memo, width: 150 },
      { field: 'createBy', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.createdOn, width: 100 }
    ];
    // this.mwpService.layoutcpn.next(new LayoutModel(true, '', false, true));
    this.changedr.detectChanges();
  }
  ngAfterViewInit() {
    //this.layoutService.tableview = this.tableView;
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      }
    ];
    this.userPermission = this.viewbase.userPermission;
    this.changedr.detectChanges();

    // this.mwpService.layoutChange.subscribe(res => {
    //   if (res) {
    //     if (res.isChange)
    //       this.showHeader = res.asideDisplay;
    //     else
    //       this.showHeader = true;
    //   }
    // })
  }
  headerStyle = {
    textAlign: 'center',
    backgroundColor: '#F1F2F3',
    fontWeight: 'bold',
    border: 'none'
  }
  columnStyle = {
    border: 'none',
    fontSize: '13px !important',
    fontWeight: 400,
    lineHeight: 1.4
  }

  addEditForm: FormGroup;
  isAddMode = true;

  closeNhomqua(): void {
    document.getElementById('canvas_nhomqua').classList.remove('offcanvas-on');
    this.initForm();
  }
  openForm(dataItem, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.initForm();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(dataItem);
    }
    document.getElementById('canvas_nhomqua').classList.add('offcanvas-on')
  }
  initForm() {
    this.addEditForm = this.fb.group({
      giftName: [
        '',
        Validators.compose([
          Validators.required,

        ]),
      ],
      stop: [
        false,
        Validators.compose([
        ]),
      ],
      giftID: [
        '',
        Validators.compose([
          Validators.required,

        ]),
      ],
      memo: [
        '',
        Validators.compose([
        ]),
      ]
    }, { updateOn: 'change' });
  }
  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field === "stop")
        this.addEditForm.patchValue({ stop: dt.checked })
      else {
        var obj = {};
        obj[field] = dt?.value ? dt.value : dt;
        this.addEditForm.patchValue(obj);
      }
    }
  }
  deleteGift(item) {
    this.notificationsService.alertCode("").subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == "Y") {
            that.api
              .call("FD", "GiftsBusiness", "DeleteGiftGroupAsync", [
                item.giftID
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0][0] == true) {
                    that.gridView.removeHandler(item, "giftID");
                  }
                  else {
                    that.notificationsService.notify(res.msgBodyData[0][1]);
                  }
                }
              });
          }
        }
      }
    })
  }

  close(e) {
    console.log(e);
  }
  onSaveForm() {
    if (this.addEditForm.status == "INVALID") {
      this.notificationsService.notify("Vui lòng kiểm tra lại thông tin nhập");
      return 0;
    }
    return this.api
      .call("FD", "GiftsBusiness", "AddEditGiftGroupAsync", [
        this.addEditForm.value, this.isAddMode
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0][0] == true) {
            this.closeNhomqua();
            this.clickClosePopup();
            this.initForm();
            let data = res.msgBodyData[0][2];
            this.userName = this.user?.userName;
            this.gridView.addHandler(data, this.isAddMode, "giftID");
            this.changedr.detectChanges();
            // this.gridView.loadData();
          }
          else {
            this.notificationsService.notify(res.msgBodyData[0][1]);
          }
        }
      });
  }

  closeInfor() {
    this.clearInfor();
  }

  clearInfor() {
    this.addEditForm.controls['giftName'].setValue('');
    this.addEditForm.controls['giftID'].setValue('');
    this.addEditForm.controls['memo'].setValue('');
    this.addEditForm.controls['stop'].setValue(false);
    this.changedr.detectChanges();
  }

  getGiftGroupID() {
    this.getOneFieldAutonumber(this.funcID)
      .subscribe((key) => {
        this.addEditForm.patchValue({ giftID: key });
      });
  }

  getOneFieldAutonumber(functionID): Observable<any> {
    var subject = new Subject<any>();
    this.api.call("AD", "AutoNumbersBusiness",
      "CreateAutoNumberByFunction", [functionID, null])
      .subscribe(item => {
        if (item && item.msgBodyData.length > 0)
          subject.next(item.msgBodyData[0][1]);
      });
    return subject.asObservable();
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }

  PopoverEmpLeave(p: any) {
    p.close();
  }

  openFormCreate(e, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.closeInfor();
      this.getGiftGroupID();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(this.dataItem);
    }
    // this.viewbase.currentView.openSidebarRight();
  }

  clickClosePopup() {
    this.closeInfor();
    // this.viewbase.currentView.closeSidebarRight();
  }
}
