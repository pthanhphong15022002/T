import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  DialogModel,
  FormModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddBusinessLineComponent } from './popup-add-business-line/popup-add-business-line.component';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { F } from '@angular/cdk/keycodes';
import { PopupAddDynamicProcessComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';

@Component({
  selector: 'lib-business-line',
  templateUrl: './business-line.component.html',
  styleUrls: ['./business-line.component.css'],
})
export class BusinessLineComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('morefunction') morefunction: TemplateRef<any>;
  service = 'CM';
  assemblyName = 'ERM.Business.Core';
  entityName = 'CM_BusinessLines';
  className = 'DataBusiness';
  method = 'LoadDataAsync';
  idField = 'businessLineID';
  itemSelected: any;
  grvSetup: any;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];
  titleAction: any;

  description: string;

  constructor(
    private inject: Injector,
    private shareService: CodxShareService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID']; //CMS0105
    this.cache.functionList(this.funcID).subscribe((f) => {
      var description = f?.defaultName ?? f?.customName;
      this.description =
        description.charAt(0).toLowerCase() + description.slice(1);
    });
    this.cache
      .gridViewSetup('CMBusinessLines', 'grvCMBusinessLines')
      .subscribe((grv) => {
        this.grvSetup = grv;
      });
  }

  onInit(): void {}
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        active: true,
        model: {
          //resources: this.columnsGrid,
          template2: this.morefunction,
          //frozenColumns: 1,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  changeDataMF(e: any, data: any) {}

  click(evt) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  clickMF(e, data) {
    this.titleAction = e.text;
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS02':
        this.delete();
        break;
      case 'SYS03':
        this.edit();
        break;
      case 'SYS04':
        this.copy();
        break;
      case 'SYS05':
        this.viewDetail();
        break;
      case 'CMS0105_1':
        this.openEditProcess(data, e, '1');
        break;
      case 'CMS0105_2':
        this.openEditProcess(data, e, '4');
        break;
      default:
        this.shareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  selectedChange(e: any) {
    this.itemSelected = e?.data;
  }

  // region CRUD
  addNew() {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();

      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let obj = {
        action: 'add',
        headerText: this.titleAction + ' ' + this.description,
        gridViewSetup: this.grvSetup,
      };
      let dialog = this.callfc.openSide(
        PopupAddBusinessLineComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }

  copy() {}
  edit() {}
  viewDetail() {}
  delete() {}

  //======================end=============================//

  viewChanged(e) {}

  //#region Edit process by dong san pham
  async openEditProcess(data, evt, applyFor) {
    //VTHAO-2/10/2023
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'ProcessesBusiness',
        'GetProcessSettingAsync',
        [applyFor == '1' ? data?.processID : data?.processContractID]
      )
      .subscribe((res) => {
        if (res && res?.length > 0) {
          let process = res[0];
          let grv = res[1];
          let groups = res[2];
          let action = res[3] ? 'edit' : 'add';
          if (
            process.businessLineID == null ||
            process.businessLineID?.trim() == ''
          )
            process.businessLineID = data.businessLineID;
          process.applyFor = applyFor;
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          let formModel = new FormModel();
          formModel.entityName = 'DP_Processes';
          formModel.formName = 'DPProcesses';
          formModel.gridViewName = 'grvDPProcesses';
          formModel.funcID = 'DP0204'; //DP01 đôi đi vì Khanh đã đổi func

          dialogModel.FormModel = JSON.parse(JSON.stringify(formModel));

          var obj = {
            action: action,
            titleAction: evt ? evt.text : '',
            gridViewSetup: grv,
            lstGroup: groups,
            systemProcess: '2',
            data: process,
          };
          let dialogProcess = this.callfc.openForm(
            PopupAddDynamicProcessComponent,
            '',
            Util.getViewPort().height - 100,
            Util.getViewPort().width - 100,
            '',
            obj,
            '',
            dialogModel
          );
          dialogProcess.closed.subscribe((e) => {
            if (e && e?.event && e?.event?.recID && action == 'add') {
              if (applyFor == '1') data.processID = e.event?.recID;
              if (applyFor == '4') data.processContractID = e.event?.recID;
              let updateData = JSON.parse(JSON.stringify(data));
              this.view.dataService.update(updateData, true).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }
  //#endregion
}
