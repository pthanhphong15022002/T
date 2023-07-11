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
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddTargetComponent } from './popup-add-target/popup-add-target.component';

@Component({
  selector: 'lib-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.css'],
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

  dataObj: any;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;
  scheduleHeader?: ResourceModel;
  schedules?: ResourceModel;
  requestTree?: ResourceModel;
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

  constructor(private inject: Injector, private activedRouter: ActivatedRoute) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
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
        active: false,
        sameData: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
      {
        sameData: false,
        type: ViewType.schedule,
        active: true,
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
          //template5: this.resourceTootip,//tooltip
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          //template7: this.footerButton,//footer
          // statusColorRef: 'EP022',
        },
      },
    ];
    this.view.dataService.methodSave = 'AddTargetAndTargetLineAsync';
    this.view.dataService.methodDelete = 'DeletedTargetLineAsync';

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
    this.scheduleHeader.className = 'TargetsBusiness';
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

    //Vẽ tree

    this.requestTree = new ResourceModel();
    this.requestTree.assemblyName = 'CM';
    this.requestTree.className = 'TargetsBusiness';
    this.requestTree.service = 'CM';
    this.requestTree.method = 'GetListTargetAsync';
    this.requestTree.autoLoad = false;
    this.requestTree.parentIDField = 'Year';
  }
  //#endregion setting schedule

  //#region change Calendar ejs
  changeCalendar(data: any) {}
  //#endregion
  //#region event codx-view
  viewChanged(e) {}
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
      }
    }
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS04':
            res.disabled = true;
            break;
        }
      });
    }
  }
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      var obj = {
        action: 'add',
        title: this.titleAction,
      };
      var dialog = this.callfc.openSide(PopupAddTargetComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
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
}
