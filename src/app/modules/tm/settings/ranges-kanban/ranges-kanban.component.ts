import { InfoOpenForm, RangeLine, rangeLine } from './../../models/task.model';
import { BS_RangeLines, BS_Ranges } from './../../models/BS_Ranges.model';
import { Component, Input, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { AuthStore, CacheService, ApiHttpService, ViewsComponent, CodxFormDynamicComponent, CallFuncService, NotificationsService, CodxGridviewComponent } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { ButtonModel } from 'codx-core/lib/layout/toolbar/tool-model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RangeLineFormGroup } from '@modules/tm/models/task.model';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TmService } from '@modules/tm/tm.service';
import { Dialog } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-ranges-kanban',
  templateUrl: './ranges-kanban.component.html',
  styleUrls: ['./ranges-kanban.component.scss']
})
export class RangesKanbanComponent implements OnInit {
  @ViewChild("itemCreateBy", { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild("GiftIDCell", { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild("itemCreate", { static: true }) itemCreate: TemplateRef<any>;
  @ViewChild("itemListReadmore", { static: true }) itemListReadmore: TemplateRef<any>;
  @ViewChild('main') main: TemplateRef<any>;
  @ViewChild('sidebarRight') sidebarRight: TemplateRef<any>;
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('addLines') addLines: TemplateRef<any>;
  @ViewChild("add", { static: true }) add: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  @Input() data: [];

  itemRangeLine: FormGroup;
  addEditForm: FormGroup;
  lstRangeLine: RangeLine[];
  lstSaveRangeLine: any;

  @Input() ranges = new BS_Ranges();
  @Input() rangeLines = new RangeLine();

  columnsGrid = [];
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
  gridViewSetup: any;
  formName = "";
  gridViewName = "";
  functionID = "";
  entity = "";
  isAfterRender = false;
  searchType = "0";
  isAddMode = true;
  title = "";
  isAdd: boolean = true;
  index = null;
  isAddLine: boolean = true;

  constructor(private cache: CacheService, private fb: FormBuilder, private auth: AuthStore,
    private api: ApiHttpService, private dt: ChangeDetectorRef, private callfc: CallFuncService, private renderer: Renderer2,
    private modalService: NgbModal, private tmSv: TmService, private notiService: NotificationsService

  ) { }


  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [{
    id: '1',
    text: 'Thêm'
  }]

  ngOnInit(): void {
    this.initForm();
    this.initPopup();
    this.columnsGrid = [
      { field: 'noName', headerText: '', template: this.GiftIDCell, width: 30 },
      { field: 'rangeID', headerText: 'Mã', width: 100 },
      { field: 'rangeName', headerText: 'Mô tả', width: 200 },
      { field: 'note', headerText: 'Ghi chú', width: 180 },
      { field: 'rangeID', headerText: 'Khoảng thời gian', template: this.itemListReadmore, width: 140 },
      { field: 'createBy', headerText: 'Người tạo', template: this.itemCreateBy, width: 140 },
      { field: 'createOn', headerText: 'ngày tạo', template: this.itemCreate, width: 140 },

    ];
    this.cache.gridViewSetup('RangesKanban', 'grvRangesKanban').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    })
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'grid',
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,
        sideBarRightRef: this.sidebarRight,
        widthAsideRight: '900px'
      }
    },

    ];

  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      this.getAutonumber("TM00634", "BS_RangesKanban", "RangeID").subscribe(key => {
        this.ranges.rangeID = key;
      })
    })
  }

  initPopup() {
    this
      .getFormGroup("RangeLines", "grvRangeLines")
      .then((item) => {
        this.fb.group(RangeLineFormGroup);
        this.rangeLines.RecID = item.value.recID;
        this.rangeLines.RangeID = "";
        this.rangeLines.BreakName = null;
        this.rangeLines.BreakValue = null;
      });
  }


  openPopup2(itemdata, isAddLine, index){
    this.isAddLine = isAddLine;
    if(isAddLine==false){
      this.api.execSv<any>("BS", "BS", "RangesKanbanBusiness", "GetLinesByIdAsync", itemdata.recID).subscribe((res) => {
        if (res) {
          itemdata = res;
          this.rangeLines = itemdata;
          this.dt.detectChanges();
          this.showPanel();
        }
      })
    }
    this.modalService
      .open(this.add, { centered: true })
      .result.then(
        (result) => {
          if (isAddLine==false) {
            this.lstRangeLine[index].BreakName = this.rangeLines.BreakName;
            this.lstRangeLine[index].BreakValue = this.rangeLines.BreakValue;
            this.dt.detectChanges();
          }
        },
        (reason) => {
          console.log("reason", this.getDismissReason(reason));
        }
      );
  }


  openPopup(itemdata, isAddLine, index) {
    this.isAddLine = isAddLine;
    if (isAddLine) {
      this.initPopup();
    }
    this.modalService
      .open(this.add, { centered: true })
      .result.then(
        (result) => {
          if (isAddLine) {
            this.lstRangeLine.push(this.rangeLines);
            this.rangeLines = new RangeLine();
          }
        },
        (reason) => {
          console.log("reason", this.getDismissReason(reason));
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe(gv => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == "owner") {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == "createdOn") {
                model[element.fieldName].push(new Date());
              }
              else if (element.fieldName == "stop") {
                model[element.fieldName].push(false);
              }
              else if (element.fieldName == "orgUnitID") {
                model[element.fieldName].push(user['buid']);
              }
              else if (element.dataType == "Decimal" || element.dataType == "Int") {
                model[element.fieldName].push(0);
              }
              else if (element.dataType == "Bool" || element.dataType == "Boolean")
                model[element.fieldName].push(false);
              else if (element.fieldName == "createdBy") {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }
            }
          }
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api.execSv<any>("SYS", "ERM.Business.AD", "AutoNumbersBusiness",
      "GenAutoNumberAsync", [functionID, entityName, fieldName, null])
      .subscribe(item => {
        if (item)
          subject.next(item);
        else
          subject.next(null);
      });
    return subject.asObservable();
  }

  clickButton(evt: any, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
      this.lstRangeLine = [];
      this.title = 'Thêm khoảng thời gian';
      this.initForm();
    }
    this.showPanel();
    //  this.renderer.addClass(popup, 'drawer-on');
  }

  openForm(data, isAddMode) {
    if (isAddMode == false) {
      this.isAddMode = false;
      this.rangeLines = new RangeLine();
      this.ranges = new BS_Ranges();

      this.title = 'Chỉnh sửa khoảng thời gian công việc';
      this.api.execSv<any>("BS", "BS", "RangesKanbanBusiness", "GetRangesKanbanAndLinesByIdAsync", data.rangeID).subscribe((res) => {
        if (res) {
          data = res;
          this.ranges = data[0];
          this.lstRangeLine = data[1];
          if (this.lstRangeLine == null) {
            this.lstRangeLine = [];
          }
          this.dt.detectChanges();
          this.showPanel();
        }

      })
    }
    // this.renderer.addClass(popup, 'drawer-on');
  }


  showPanel() {
    this.viewBase.currentView.openSidebarRight();
  }

  Close() {
    this.lstRangeLine = [];

    // this.renderer.removeClass(popup, 'drawer-on');
    this.viewBase.currentView.closeSidebarRight();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }

  deleteRange(data) {
    var message = 'Bạn có chắc chắn muốn xóa khoảng thời gian này !';
    this.notiService
      .alert('Cảnh báo', message, { type: 'YesNo' })
      .subscribe((dialog: Dialog) => {
        var t = this;
        dialog.close = function (e) {
          return t.api.execSv("BS",
            "BS",
            "RangesKanbanBusiness",
            "DeleteRangesKanbanAsync", data.rangeID).subscribe((res) => {
              if (res) {
                data = res;
                //      t.notiService.notify(res[2].message);
                t.gridView.removeHandler(data, "rangeID");

              }
              t.data = t.gridView.data;
            })
        };
      });
  }

  OnSaveForm() {
    return this.api
      .execSv("BS", "BS", "RangesKanbanBusiness", "AddEditRangeAsync", [
        this.ranges,
        this.lstRangeLine,
        this.isAddMode,
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res[2];
          let item = this.data
          this.lstSaveRangeLine = [];
          if (this.lstRangeLine != null) {
            for (let item1 of this.lstRangeLine) {
              var rangeline = new rangeLine(
                item1.RecID,
                item1.RangeID,
                item1.BreakName,
                item1.BreakValue
              );
              this.lstSaveRangeLine.push(rangeline);
            }
          }
     //     item.push = this.lstSaveRangeLine;
          this.gridView.addHandler(item, this.isAddMode, "rangeID");
          this.Close();
        }
      });
  }


  deletePopup(index) {
    this.lstRangeLine.splice(index, 1);
  }

  valueValue(data) {
    this.rangeLines.BreakValue = data.data;
  }
  valueName(data) {
    this.rangeLines.BreakName = data.data;
  }

  hover(ctrl) {
    ctrl.click();
    // console.log(ctrl);
  }

  showControl(p, item){
    p.open();
  }
}
