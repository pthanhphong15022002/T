import { Observable, Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, TemplateRef, ContentChild, Injector } from '@angular/core';
import { LayoutService } from '@shared/services/layout.service';
import { ApiHttpService, AuthStore, ButtonModel, CodxGridviewComponent, ImageViewerComponent, NotificationsService, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-proposedfield',
  templateUrl: './proposedfield.component.html',
  styleUrls: ['./proposedfield.component.scss']
})
export class ProposedfieldComponent implements OnInit {

  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  userName = '';
  isOpen = false;
  predicate = '';
  dataValue = '';
  entityName = 'BS_Industries';
  ownDomain = '';
  ownName = '';
  ownPosition = '';
  industryIdUpdate = '';
  checkAddEdit = true;
  isAddMode = true;

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true }) itemOwner: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('note', { static: true }) note: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild("subheader") subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild("gridView") gridView: CodxGridviewComponent;

  myModel = {
    template: null
  };
  constructor(
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private changedr: ChangeDetectorRef,
    private layoutService: LayoutService,
    private authStore: AuthStore,
    private mwpService: CodxMwpService,
    private route: ActivatedRoute,
  ) {
    this.user = this.authStore.get();
    this.route.params.subscribe(params => {
      if(params) this.funcID = params['funcID'];
    })
  }
  button: Array<ButtonModel> = [{
    id: '1',
  }]
  reload = false;
  columnsGrid = [];
  @ViewChild(ImageViewerComponent) imageViewer: ImageViewerComponent;
  ngOnInit(): void {
    this.initForm();
    this.columnsGrid = [
      { field: 'industryID', headerText: 'Mã lĩnh vực', width: 100 },
      { field: 'industryName', headerText: 'Tên lĩnh vực', width: 200 },
      { field: 'owners', headerText: 'Người sở hữu', template: this.itemOwner, width: 200 },
      { field: 'note', headerText: 'Ghi chú', template: this.note, width: 150 },
      { field: 'createName', headerText: 'Người tạo', template: this.itemCreateBy, width: 200 },
      { field: 'createdOn', headerText: 'Ngày tạo', template: this.createdOn, width: 100 }
    ];
    // this.mwpService.layoutcpn.next(new LayoutModel(true, '', false, true));
    this.changedr.detectChanges();
  }

  ngAfterViewInit() {
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

  openFormCreate(e, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.closeInfor();
      this.getPropsedFieldID();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(this.dataItem);
    }
    // this.viewbase.currentView.openSidebarRight();
  }

  closeInfor() {
    this.clearInfo();
  }

  clickClosePopup() {
    this.closeInfor();
    // this.viewbase.currentView.closeSidebarRight();
  }

  clearInfo() {
    this.addEditForm.controls['industryID'].setValue('');
    this.addEditForm.controls['industryName'].setValue('');
    this.addEditForm.controls['note'].setValue('');
    this.addEditForm.controls['owner'].setValue('');

    this.changedr.detectChanges();
  }

  getPropsedFieldID() {
    this.getOneFieldAutonumber(this.funcID)
      .subscribe((key) => {
        this.addEditForm.patchValue({ industryID: key });
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
  valueTrue = true;
  ownInfo = null;

  closeHanhviungxu(): void {
    document.getElementById('#canvas_hanhviungxu').classList.remove('offcanvas-on');
    this.initForm();
  }
  reloadChanged(e) {
    this.reload = e;
    this.changedr.detectChanges();
  }
  changeOwnerByCombobox(employeeID) {
    this.api
      .call(
        "ERM.Business.HR",
        "EmployeesBusiness",
        "GetListEmployeesByUserIDAsync",
        [JSON.stringify([employeeID])]
      )
      .subscribe((res) => {
        this.ownInfo = res.msgBodyData[0][0];
        this.reload = true;
        this.changedr.detectChanges();
      });
  }
  changeCombobox(e) {
    // this.cbx.valueChange.subscribe((value) => {
    //   if (value.fieldSelect === "owner") {
    //     if (value.value !== this.addEditForm.value.owner) {
    //       this.changeOwnerByCombobox(value.value);
    //       this.addEditForm.patchValue({ owner: value.value })
    //     }
    //   }
    // });
    if (e) {
      this.addEditForm.patchValue({ owner: e[0] })
    }
  }
  async openForm(dataItem, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.initForm();
      this.reload = true;
      this.ownInfo = { domainUser: null };
      this.changedr.detectChanges();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(dataItem);
      this.changeOwnerByCombobox(dataItem.owner);
      this.changedr.detectChanges();
    }
    document.getElementById('#canvas_hanhviungxu').classList.add('offcanvas-on');
  }
  initForm() {
    this.addEditForm = this.fb.group({
      industryID: [
        '',
        Validators.compose([
          Validators.required,

        ]),
      ],
      industryName: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ],
      note: [
        '',
        Validators.compose([
        ]),
      ],
      owner: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ]
    }, { updateOn: 'blur' });
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
  deleteProposedField(item) {
    this.notificationsService.alertCode("").subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == "Y") {
            that.api
              .call("BS", "IndustriesBusiness", "DeleteIndustryAsync", [
                item.industryID
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0][0] == true) {
                    that.gridView.removeHandler(item, "industryID");
                    that.changedr.detectChanges();
                  }
                }
              });
          }
        }
      }
    })
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }

  onSaveForm() {
    var gridModel = {predicate: this.predicate, dataValue: this.dataValue, entityName: this.entityName}
    if (this.addEditForm.invalid == true) {
      this.notificationsService.notify("Vui lòng kiểm tra lại thông tin nhập");
      return 0;
    } else {
      return this.api
        .call("BS", "IndustriesBusiness", "AddEditIndustryAsync", [
          this.addEditForm.value, this.isAddMode, gridModel
        ])
        .subscribe((res) => {
          if (res && res.msgBodyData[0]) {
            if (res.msgBodyData[0][0] == true) {
              this.clickClosePopup();
              this.initForm();
              let data = res.msgBodyData[0][3][0];
              this.ownDomain = res.msgBodyData[0][3][0]?.ownDomain;
              this.ownName = res.msgBodyData[0][3][0]?.ownName;
              this.ownPosition = res.msgBodyData[0][3][0]?.ownPosition;
              this.userName = this.user?.userName;
              if(this.isAddMode == false) {
                this.checkAddEdit = false;
                this.industryIdUpdate = data?.industryID;
                this.changedr.detectChanges();
              }
              this.gridView.addHandler(data, this.isAddMode, "industryID");  
              console.log('check gridView', this.gridView);
              this.changedr.detectChanges();
            }
            else {
              this.notificationsService.notify(res.msgBodyData[0][1]);
            }
          }
        });
    }
  }
}
