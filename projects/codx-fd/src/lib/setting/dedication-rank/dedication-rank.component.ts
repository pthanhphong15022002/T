import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, TemplateRef, ContentChild, Injector, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { LayoutService } from '@shared/services/layout.service';
import { ApiHttpService, ButtonModel, CodxGridviewComponent, ImageViewerComponent, NotificationsService, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
@Component({
  selector: 'app-dedication-rank',
  templateUrl: './dedication-rank.component.html',
  styleUrls: ['./dedication-rank.component.scss']
})
export class DedicationRankComponent extends UIComponent implements OnInit {

  datafuntion = null;
  titlePage = "";
  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ColorRank', { static: true }) colorRank: TemplateRef<any>;
  @ViewChild('imageItem', { static: true }) imageItem: TemplateRef<ImageViewerComponent>;
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;
  @ViewChild('imageUploadReload') imageUploadReload: ImageViewerComponent;
  @ViewChild("subheader") subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild(ImageViewerComponent) imageViewer: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(private injector: Injector,
    private fb: FormBuilder,
    private changedr: ChangeDetectorRef,
    private myElement: ElementRef,
    private layoutService: LayoutService,
    private at: ActivatedRoute,
    private notificationsService: NotificationsService,
    public location: Location,
    private mwpService: CodxMwpService,
    private route: ActivatedRoute,
  ) {
    super(injector);
    this.route.params.subscribe(params => {
      if(params) this.funcID = params['funcID'];
    })
  }
  button: Array<ButtonModel> = [{
    id: '1',
  }]

  onInit(): void {
    // this.mwpService.layoutcpn.next(new LayoutModel(true, '', false, true));
    this.changedr.detectChanges();

    this.initForm();
    this.columnsGrid = [
      //{ field: 'noName', nameColumn: '', template: this.GiftIDCell, width: 30 },
      { field: 'breakName', headerText: 'Tên hạng', width: 150 },
      { field: 'breakValue', headerText: 'Điểm tính hạng', width: 100 },
      { field: 'color', headerText: 'Màu đại diện', width: 100, template: this.colorRank },
      { field: 'image', headerText: 'Biểu tượng đại diện', template: this.imageItem, width: 125 },
      { field: 'note', headerText: 'Ghi chú', width: 100 },
      { field: 'createdName', headerText: 'Người tạo', width: 150, template: this.itemCreateBy },
      { field: 'createOn', headerText: 'Ngày tạo', width: 100 }

    ];
    this.at.queryParams.subscribe(params => {
      if (params && params.funcID) {
        this.api.call("ERM.Business.SYS", "FunctionListBusiness", "GetAsync", ["", params.funcID]).subscribe(res => {
          //this.ngxLoader.stop();
          if (res && res.msgBodyData[0]) {
            var data = res.msgBodyData[0] as [];
            this.datafuntion = data;
            this.titlePage = data["customName"];
            this.changedr.detectChanges();
          }
        })
      }
    })
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

  myModel = {
    template: null
  };
  reload = false;

  columnsGrid = [];

  openFormCreate(e, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.closeInfor();
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue({ breakName: `${this.dataItem.breakName} `, breakValue: this.dataItem.breakValue,
      note: this.dataItem.note, recID: this.dataItem.recID, color: this.dataItem.color});
    }
    // this.viewbase.currentView.openSidebarRight();
  }

  clickClosePopup() {
    this.closeInfor();
    // this.viewbase.currentView.closeSidebarRight();
  }

  closeInfor() {
    this.clearInfo();
  }

  clearInfo() {
    this.addEditForm.controls['recID'].setValue(null);
    this.addEditForm.controls['rangeID'].setValue('KUDOS');
    this.addEditForm.controls['breakName'].setValue('');
    this.addEditForm.controls['breakValue'].setValue('');
    this.addEditForm.controls['color'].setValue('');
    this.addEditForm.controls['image'].setValue('');
    this.addEditForm.controls['note'].setValue('');

    this.changedr.detectChanges();
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
  valueTrue = true;
  openForm(dataItem, isAddMode) {
    if (isAddMode == true) {
      this.initForm();
      this.isAddMode = true;
    }
    else {
      this.isAddMode = false;
      this.addEditForm.patchValue(dataItem);
      this.changedr.detectChanges();
    }
    document.getElementById('canvas_hangconghien').classList.add('offcanvas-on');
  }

  closeHangconghien(): void {
    document.getElementById('canvas_hangconghien').classList.remove('offcanvas-on');
    this.initForm();
    this.addEditForm.controls["recID"].setValue("");
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      var obj = {};
      obj[field] = dt?.value ? dt.value : dt;
      this.addEditForm.patchValue(obj);

    }
  }

  valueChangeColor(value, element) {
    this.addEditForm.patchValue({ color: value.data })
  }

  initForm() {
    this.addEditForm = this.fb.group({
      recID: [
        null,
        Validators.compose([
        ]),
      ],
      rangeID: [
        'KUDOS',
        Validators.compose([
          Validators.required,
        ]),
      ],
      breakName: [
        '',
        Validators.compose([
          Validators.required,

        ]),
      ],
      breakValue: [
        '',
        Validators.compose([
          Validators.required,
        ]),
      ],
      color: [
        '',
        Validators.compose([
        ]),
      ],
      image: [
        '',
        Validators.compose([
        ]),
      ],
      note: [
        '',
        Validators.compose([
        ]),
      ]
    }, { updateOn: 'blur' });

  }
  deleteDedicationRank(item) {
    this.notificationsService.alertCode("").subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == "Y") {
            that.api
              .call("BS", "RangeLinesBusiness", "DeleteRangeLineAsync", [
                item.recID
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0] == true) {
                    that.gridView.removeHandler(item, "recID");
                    that.changedr.detectChanges();
                  }
                }
              });
          }
        }
      }
    })
  }
  reloadChanged(e) {
    this.reload = e;
  }
  onSaveForm() {
    if (this.addEditForm.status == 'INVALID') {
      this.notificationsService.notify('Vui lòng kiểm tra thông tin nhập');
      return 0;
    }
    if (this.addEditForm.controls['recID'].value == null) {
      delete this.addEditForm.value.recID;
    }
    return this.api
      .call("BS", "RangeLinesBusiness", "AddEditRangeLineAsync", [
        this.addEditForm.value, this.isAddMode
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0][0] == true) {
            this.closeHangconghien();
            let data = res.msgBodyData[0][2];
            console.log("check add", res);
            this.imageUpload.updateFileDirectReload(data.recID).subscribe((result) => {
              if (result) {
                this.initForm();
                this.loadData.emit();
              
                this.gridView.addHandler(data, this.isAddMode, "recID");
                this.changedr.detectChanges();
              } else {
                this.initForm();
                this.gridView.addHandler(data, this.isAddMode, "recID");
                this.changedr.detectChanges();
              }
            });
            this.clickClosePopup();
          }
        }
      });
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }
}
