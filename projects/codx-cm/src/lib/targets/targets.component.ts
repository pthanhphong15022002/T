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
  dataObj: any;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  button?: ButtonModel;
  scheduleHeader?: ResourceModel;
  schedules?: ResourceModel;
  scheduleModel: any;
  scheduleHeaderModel: any;
  //#region Exec
  funcID = 'CM0601';
  service: string = 'CM';
  assemblyName: string = 'ERM.Business.CM';
  entityName: string = 'CM_Targets';
  className: string = 'TargetsBusiness';
  method: string = '';
  idField: string = 'recID';
  //#endregion

  readonly btnAdd: string = 'btnAdd';

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
    this.detectorRef.checkNoChanges();
  }

  //#region setting schedule
  getSchedule() {
    //lấy list target để vẽ schedule
    this.schedules = new ResourceModel();
    this.schedules.assemblyName = 'CM';
    this.schedules.className = 'TargetsBusiness';
    this.schedules.service = 'CM';
    this.schedules.method = 'GetListTargetAsync';
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
      subject: { name: 'targetName' },
      // startTime: { name: 'startDate' },
      // endTime: { name: 'endDate' },
      resourceId: { name: 'owner' },
      status: 'status',
    };

    this.scheduleHeaderModel = {
      Name: 'Owners',
      Field: 'owner',
      IdField: 'owner',
      TextField: 'userName',
      Title: 'Owners',
    };
  }
  //#endregion setting schedule

  //#region event codx-view
  viewChanged(e) {}
  onLoading(e) {}
  searchChanged(e) {}
  selectedChange(e) {}
  //#endregion

  //#region more
  click(evt) {
    // this.titleAction = evt.text;
    switch (evt.id) {
      case this.btnAdd:
        this.add();
        break;
    }
  }

  clickMF(e, data) {}

  changeDataMF(e, data) {}
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      var obj = {
        action: 'add',
        // title: this.titleAction,
      };
      var dialog = this.callfc.openSide(PopupAddTargetComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        if (e && e.event != null) {
          this.detectorRef.detectChanges();
          // this.customerDetail.listTab(this.funcID);
        }
      });
    });
  }
  //#endregion
}
