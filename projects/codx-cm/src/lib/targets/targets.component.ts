import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  DataRequest,
  DialogModel,
  FormModel,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddTargetComponent } from './popup-add-target/popup-add-target.component';
import { DecimalPipe } from '@angular/common';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.scss'],
  providers: [DecimalPipe],
})
export class TargetsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() showButtonAdd = true;
  @Input() queryParams: any;
  //schedule view
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>;
  @ViewChild('resourceTootip') resourceTootip!: TemplateRef<any>;
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;

  lstDataTree = [];
  dataObj: any;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;
  scheduleHeader?: ResourceModel;
  schedules?: ResourceModel;
  //#region tree request
  requestTree = new DataRequest();
  serviceTree: string = 'CM';
  assemblyNameTree: string = 'ERM.Business.CM';
  entityNameTree: string = 'CM_TargetsLines';
  classNameTree: string = 'TargetsLinesBusiness';
  methodTree: string = 'GetListTreeTargetLineAsync';
  loadedTree: boolean;
  fmTargetLines: FormModel;
  //#endregion
  scheduleModel: any;
  scheduleHeaderModel: any;
  //#region Exec
  funcID = '';
  service: string = 'CM';
  assemblyName: string = 'ERM.Business.CM';
  entityName: string = 'CM_Targets';
  className: string = 'TargetsBusiness';
  method: string = 'GetListTargetAsync';
  idField: string = 'recID';
  //#endregion
  titleAction = '';
  dataSelected: any;
  readonly btnAdd: string = 'btnAdd';
  //calendar - tháng - quý - năm
  date: any = new Date();
  ops = ['m', 'q', 'y'];
  year: number;
  heightWin: any;
  widthWin: any;
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private cmSv: CodxCmService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
  }

  onInit(): void {
    this.showButtonAdd = true;
    this.button = {
      id: this.btnAdd,
    };
    if (this.queryParams == null) {
      this.queryParams = this.router.snapshot.queryParams;
    }
    this.getSchedule();
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
      {
        sameData: false,
        type: ViewType.schedule,
        active: false,
        request2: this.scheduleHeader,
        request: this.schedules,
        toolbarTemplate: this.footerButton,
        showSearchBar: false,
        showFilter: false,
        model: {
          eventModel: this.scheduleModel,
          resourceModel: this.scheduleHeaderModel, //resource
          template: this.cardTemplate,
          template4: this.resourceHeader,
          template5: this.resourceTootip, //tooltip
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          //template7: this.footerButton,//footer
          // statusColorRef: 'EP022',
        },
      },
    ];
    this.view.dataService.methodSave = 'AddTargetAndTargetLineAsync';
    this.view.dataService.methodDelete = 'DeletedTargetLineAsync';
    this.view.dataService.methodUpdate = 'UpdateTargetAndTargetLineAsync';

    this.detectorRef.checkNoChanges();
  }

  //#region setting schedule
  getSchedule() {
    //lấy list target để vẽ schedule
    this.schedules = new ResourceModel();
    this.schedules.assemblyName = 'CM';
    this.schedules.className = 'TargetsLinesBusiness';
    this.schedules.service = 'CM';
    this.schedules.method = 'GetListTargetLineAsync';
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.schedules.predicate = this.queryParams?.predicate;
      this.schedules.dataValue = this.queryParams?.dataValue;
    }
    this.schedules.idField = 'recID';
    //lấy list user vẽ header schedule
    this.scheduleHeader = new ResourceModel();
    this.scheduleHeader.assemblyName = 'CM';
    this.scheduleHeader.className = 'TargetsLinesBusiness';
    this.scheduleHeader.service = 'CM';
    this.scheduleHeader.method = 'GetListUserAsync';
    this.scheduleModel = {
      id: 'recID',
      subject: { name: 'target' },
      startTime: { name: 'startDate' },
      endTime: { name: 'endDate' },
      resourceId: { name: 'salespersonID' },
      status: 'status',
    };

    this.scheduleHeaderModel = {
      Name: 'Owners',
      Field: 'salespersonID',
      IdField: 'salespersonID',
      TextField: 'userName',
      Title: 'Owners',
    };
  }
  //#endregion setting schedule

  //#region load tree
  loadTreeData(year) {
    this.loadedTree = false;
    var resource = new DataRequest();
    resource.predicates = 'Period=@0';
    resource.dataValues = year;
    resource.funcID = 'CM0601';
    resource.pageLoading = false;
    this.requestTree = resource;
    this.fetch().subscribe((item) => {
      this.lstDataTree = item;

      this.loadedTree = true;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTree,
        this.assemblyNameTree,
        this.classNameTree,
        this.methodTree,
        this.requestTree
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  selectionChange(parent) {
    if (parent.isItem) {
      parent.data.items = parent?.data?.items;
    }
  }
  //#endregion

  //#region change Calendar ejs
  changeCalendar(data: any) {
    var year = parseInt(data?.fromDate?.getFullYear());
    this.year = year;
    this.loadTreeData(year?.toString());
  }
  //#endregion
  //#region event codx-view
  viewChanged(e) {
    console.log(e);
    var formModel = new FormModel();
    formModel.formName = 'CMTargetsLines';
    formModel.gridViewName = 'grvCMTargetsLines';
    formModel.entityName = 'CM_TargetsLines';
    this.fmTargetLines = formModel;
    this.detectorRef.detectChanges();
  }
  onLoading(e) {}
  searchChanged(e) {}
  selectedChange(e) {}
  //#endregion

  //#region more
  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        this.add();
        break;
    }
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    if (e.functionID) {
      switch (e.functionID) {
        case 'SYS02':
          this.deleteTargetLine(data);
          break;
        case 'SYS03':
          this.edit(data);
          break;
      }
    }
  }

  changeDataMF(e, data, type = 'schedule') {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = true;
            break;
          case 'SYS02':
            if (type == 'tree') res.disabled = true;

            break;
        }
      });
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data, e.type);
  }
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.cache
        .gridViewSetup('CMTargets', 'grvCMTargets')
        .subscribe(async (grid) => {
          let dialogModel = new DialogModel();
          dialogModel.DataService = this.view.dataService;
          dialogModel.FormModel = this.view?.formModel;
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          var obj = {
            action: 'add',
            title: this.titleAction,
            gridViewSetupTarget: grid,
          };
          var dialog = this.callfc.openForm(
            PopupAddTargetComponent,
            '',
            this.widthWin,
            this.heightWin,
            '',
            obj,
            '',
            dialogModel
          );
          dialog.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e != null && e?.event != null) {
              if (e?.event[0] != null && e?.event[0][1] != null) {
                var data = e?.event[0][1];
                var index = this.lstDataTree.findIndex(
                  (x) => x.businessLineID == data?.businessLineID
                );
                if (index != -1) {
                  this.lstDataTree[index] = data;
                  // this.lstDataTree.splice(index, 1);
                } else {
                  this.lstDataTree.push(Object.assign({}, data));
                }
              }
              this.detectorRef.detectChanges();
            }
          });
        });
    });
  }

  edit(data) {
    this.cache
      .gridViewSetup('CMTargets', 'grvCMTargets')
      .subscribe(async (grid) => {
        this.cmSv
          .getTargetAndLinesAsync(data?.businessLineID)
          .subscribe((tar) => {
            var lstOwners = tar[2];
            var lstTargetLines = tar[1];
            this.view.dataService.dataSelected = tar[0];

            this.view.dataService
              .edit(this.view.dataService.dataSelected)
              .subscribe((res) => {
                let dialogModel = new DialogModel();
                dialogModel.DataService = this.view.dataService;
                dialogModel.FormModel = this.view?.formModel;
                dialogModel.IsFull = true;
                dialogModel.zIndex = 999;
                var obj = {
                  action: 'edit',
                  title: this.titleAction,
                  lstOwners: lstOwners,
                  lstTargetLines: lstTargetLines,
                  gridViewSetupTarget: grid,
                };
                var dialog = this.callfc.openForm(
                  PopupAddTargetComponent,
                  '',
                  this.widthWin,
                  this.heightWin,
                  '',
                  obj,
                  '',
                  dialogModel
                );
                dialog.closed.subscribe((e) => {
                  if (!e?.event) this.view.dataService.clear();
                  if (e != null && e?.event != null) {
                    if (e?.event[0] != null && e?.event[0][1] != null) {
                      var data = e?.event[1];
                      var index = this.lstDataTree.findIndex(
                        (x) => x.businessLineID == data?.businessLineID
                      );
                      if (index != -1) {
                        this.lstDataTree[index] = data;
                      }
                      // this.lstDataTree.push(Object.assign({}, data));

                      this.detectorRef.detectChanges();
                    }
                  }
                });
              });
          });
      });
  }

  deleteTargetLine(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedTargetLineAsync';
    opt.assemblyName = 'ERM.Business.CM';
    opt.className = 'TargetsLinesBusiness';
    opt.service = 'CM';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  targetToFixed(data) {
    return data ? this.decimalPipe.transform(data, '1.0-0') : '0';
  }
}
