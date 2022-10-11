import { CodxFdService } from 'projects/codx-fd/src/public-api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  TemplateRef,
  ContentChild,
  Injector,
  EventEmitter,
  Output,
} from '@angular/core';
import { Location } from '@angular/common';
import { LayoutService } from '@shared/services/layout.service';
import {
  ApiHttpService,
  ButtonModel,
  CodxGridviewComponent,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { LayoutModel } from '@shared/models/layout.model';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { AddDedicationRankComponent } from './add-dedication-rank/add-dedication-rank.component';
@Component({
  selector: 'app-dedication-rank',
  templateUrl: './dedication-rank.component.html',
  styleUrls: ['./dedication-rank.component.scss'],
})
export class DedicationRankComponent extends UIComponent implements OnInit {
  datafuntion = null;
  titlePage = '';
  funcID = '';
  dataItem: any;
  views: Array<ViewModel> = [];
  userPermission: any;
  showHeader: boolean = true;
  user: any;
  button: ButtonModel;
  headerText: any;
  dialog: DialogRef;

  @Input() functionObject;
  @ViewChild('itemCreateBy', { static: true }) itemCreateBy: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ColorRank', { static: true }) colorRank: TemplateRef<any>;
  @ViewChild('createdOn', { static: true }) createdOn: TemplateRef<any>;
  @ViewChild('imageItem', { static: true })
  imageItem: TemplateRef<ImageViewerComponent>;
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;
  @ViewChild('imageUploadReload') imageUploadReload: ImageViewerComponent;
  @ViewChild('subheader') subheader;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild(ImageViewerComponent) imageViewer: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private changedr: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    public location: Location,
    private route: ActivatedRoute,
    private fdSV: CodxFdService,
  ) {
    super(injector);
    this.route.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.api
          .call('ERM.Business.SYS', 'FunctionListBusiness', 'GetAsync', [
            '',
            params.funcID,
          ])
          .subscribe((res) => {
            //this.ngxLoader.stop();
            if (res && res.msgBodyData[0]) {
              var data = res.msgBodyData[0] as [];
              this.datafuntion = data;
              this.titlePage = data['customName'];
              this.changedr.detectChanges();
            }
          });
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit() {}

  onLoading(e) {
    if (this.view.formModel) {
      var formModel = this.view.formModel;
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            this.columnsGrid = [
              { field: 'breakName', headerText: res.BreakName.headerText },
              { field: 'breakValue', headerText: res.BreakValue.headerText },
              {
                field: 'color',
                headerText: res.Color.headerText,
                template: this.colorRank,
              },
              {
                field: 'image',
                headerText: res.Image.headerText,
                template: this.imageItem,
              },
              { field: 'note', headerText: res.Note.headerText },
              {
                field: 'createdName',
                headerText: res.CreatedBy.headerText,
                template: this.itemCreateBy,
              },
              {
                field: 'createOn',
                headerText: res.CreatedOn.headerText,
                template: this.createdOn,
              },
            ];
          }
        });
      this.views = [
        {
          type: ViewType.grid,
          sameData: true,
          active: false,
          model: {
            resources: this.columnsGrid,
          },
        },
      ];
      this.changedr.detectChanges();
    }
  }

  myModel = {
    template: null,
  };
  reload = false;

  columnsGrid = [];

  addEditForm: FormGroup;
  isAddMode = true;
  valueTrue = true;
  openForm(dataItem, isAddMode) {
    if (isAddMode == true) {
      this.isAddMode = true;
    } else {
      this.isAddMode = false;
      this.addEditForm.patchValue(dataItem);
      this.changedr.detectChanges();
    }
    document
      .getElementById('canvas_hangconghien')
      .classList.add('offcanvas-on');
  }

  closeHangconghien(): void {
    document
      .getElementById('canvas_hangconghien')
      .classList.remove('offcanvas-on');
    this.addEditForm.controls['recID'].setValue('');
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
    this.addEditForm.patchValue({ color: value.data });
  }

  deleteDedicationRank(item) {
    this.notificationsService.alertCode('').subscribe((x: Dialog) => {
      let that = this;
      x.close = function (e) {
        if (e) {
          var status = e?.event?.status;
          if (status == 'Y') {
            that.api
              .call('BS', 'RangeLinesBusiness', 'DeleteRangeLineAsync', [
                item.recID,
              ])
              .subscribe((res) => {
                if (res && res.msgBodyData[0]) {
                  if (res.msgBodyData[0] == true) {
                    that.changedr.detectChanges();
                  }
                }
              });
          }
        }
      };
    });
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
      .call('BS', 'RangeLinesBusiness', 'AddEditRangeLineAsync', [
        this.addEditForm.value,
        this.isAddMode,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          if (res.msgBodyData[0][0] == true) {
            this.closeHangconghien();
            let data = res.msgBodyData[0][2];
            console.log('check add', res);
            this.imageUpload
              .updateFileDirectReload(data.recID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                  this.changedr.detectChanges();
                } else {
                  this.changedr.detectChanges();
                }
              });
          }
        }
      });
  }

  PopoverEmpEnter(p: any, dataItem) {
    this.dataItem = dataItem;
    p.open();
  }

  add(e) {
    this.headerText = e?.text;
    var obj = {
      isModeAdd: true,
      headerText: this.headerText,
    };
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        AddDedicationRankComponent,
        obj,
        option
      );
      this.dialog.closed.subscribe((e: any) => {
        if (e?.event?.file) e.event.data.modifiedOn = new Date();
        this.view.dataService.update(e.event?.data).subscribe();
        this.changedr.detectChanges();
      });
    });
  }

  edit(data) {
    if (data) this.view.dataService.dataSelected = data;
    var obj = {
      isModeAdd: false,
      headerText: this.headerText,
    };
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          AddDedicationRankComponent,
          obj,
          option
        );
        this.dialog.closed.subscribe((e: any) => {
          if (e?.event?.data) e.event.data.modifiedOn = new Date();
          this.view.dataService.update(e.event?.data).subscribe();
          this.changedr.detectChanges();
        });
      });
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe((res: any) => {
        if(res) this.fdSV.deleteFile(res.recID, this.view.formModel.entityName)
      });
  }

  beforeDelete(op: any, data) {
    op.methodName = 'DeleteRangeLineAsync';
    op.data = data;
    return true;
  }

  clickMF(e, data) {
    this.headerText = e?.text;
    if (e) {
      switch (e.functionID) {
        case 'SYS03':
          this.edit(data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
      }
    }
  }
}
