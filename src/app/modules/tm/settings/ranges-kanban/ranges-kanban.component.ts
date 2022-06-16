import { InfoOpenForm } from './../../models/task.model';
import { BS_Ranges } from './../../models/BS_Ranges.model';
import { Component, Input, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { AuthStore, CacheService, ApiHttpService, ViewsComponent, CodxFormDynamicComponent, CallFuncService, ButtonModel, ViewModel, ViewType } from 'codx-core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RangeLineFormGroup } from '@modules/tm/models/task.model';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild("add", { static: true }) add;

  @Input() data: [];

  itemRangeLine: FormGroup;
  addEditForm: FormGroup;
  lstRangeLine: any;

  @Input() ranges = new BS_Ranges();;
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
    private modalService: NgbModal,
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
      type: ViewType.grid,
      sameData: false,
      active: true,
      // model: {
      //   panelLeftRef: this.main,
      //   sideBarRightRef: this.sidebarRight,
      //   widthAsideRight: '900px'
      // }
    },

    ];

  }

  initForm() {
    this.getFormGroup(this.formName, this.gridViewName).then((item) => {
      this.isAfterRender = true;
      this.getAutonumber("TM00634", "BS_RangesKanban", "RangeID").subscribe(key => {
        this.ranges.RangeID = key;
      })
    })
  }

  initPopup() {
    this
      .getFormGroup("RangeLines", "grvRangeLines")
      .then((item) => {
        this.itemRangeLine = this.fb.group(RangeLineFormGroup);
        this.itemRangeLine.patchValue({
          RecID: item.value.recID,
          RangeID: "",
          BreakName: null,
          BreakValue: null,
        });
      });
  }
  openRangeLine(): void {
    const t = this;
    var obj = {
      gridViewName: 'grvRangeLines',
      formName: 'RangeLines',
      functionID: 'TM00634',
      entityName: 'BS_RangeLines',
      // model: this.model,
      // text: this.text,
      // oldTitle: this.oldTitle,
      // id: this.id,
      // isEdit: this.isEdit,
      // name: this.name,
      // fiedName: this.fiedName,
      // formName: this.formName,
      // gridViewName: this.gridViewName,
    };
    this.callfc.openForm(CodxFormDynamicComponent, 'Dynamic', 0, 0, '', obj);
  }
  openPopup(itemdata, isAdd, index) {
    this.isAdd = isAdd;
    if (isAdd) {
      this.initPopup();
    } else {
      this.itemRangeLine = this.fb.group(RangeLineFormGroup);
      this.itemRangeLine.patchValue(itemdata);
      this.index = index;
    }

    this.modalService
      .open(this.add, { centered: true, size: "sm" })
      .result.then(
        (result) => {
          if (isAdd) {
            this.lstRangeLine.push(result.value);
          } else {
            this.lstRangeLine[index].BreakName = result.value.BreakName;
            this.lstRangeLine[index].BreakValue = result.value.BreakValue;
            this.dt.detectChanges();
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

              // if (element.isRequire) {
              //   model[element.fieldName].push(Validators.compose([
              //     Validators.required,
              //   ]));
              // }
              // else {
              //   model[element.fieldName].push(Validators.compose([
              //   ]));
              // }
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

    //  this.openTask()
    if (isAddMode == true) {
      this.isAddMode = true;
      this.title = 'Thêm khoảng thời gian';
      this.initForm();
    }
    this.showPanel();
    //  this.renderer.addClass(popup, 'drawer-on');
  }

  clickAddLine(evt: any, isAddLine, pop: TemplateRef<any>) {

    //  this.openTask()
    if (isAddLine == true) {
      this.isAddLine = true;
      this.title = 'Thêm chi tiết khoảng thời gian';
      this.initPopup();
    }
    //    this.showPanel();
    this.renderer.addClass(pop, 'drawer-on');
  }

  showPanel() {
    //  //this.viewBase.currentView.openSidebarRight();
  }

  Close() {
    // this.renderer.removeClass(popup, 'drawer-on');
    //  this.viewBase.currentView.closeSidebarRight();
  }

  readMore(dataItem) {
    dataItem.disableReadmore = !dataItem.disableReadmore;
    this.dt.detectChanges();
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
}
