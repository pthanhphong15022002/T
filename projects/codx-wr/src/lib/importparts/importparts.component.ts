import { firstValueFrom } from 'rxjs';
import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CodxGridviewV2Component,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxWrService } from '../codx-wr.service';
import { PopupDetailImportPartsComponent } from './popup-detail-import-parts/popup-detail-import-parts.component';

@Component({
  selector: 'lib-importparts',
  templateUrl: './importparts.component.html',
  styleUrls: ['./importparts.component.css'],
})
export class ImportpartsComponent extends UIComponent {
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  @ViewChild('templateViewDetail') templateViewDetail: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewV2Component;

  popupView: DialogRef;
  formModelTemp: FormModel = {
    formName: 'WRtempImportParts',
    gridViewName: 'grvWRtempImportParts',
    entityName: 'WR_tempImportParts',
    funcID: 'WR0105',
  };
  views: Array<ViewModel> = [];
  titleAction = '';
  // config api get data
  service = 'SYS';
  assemblyName = 'ERM.Business.Core';
  entityName = 'AD_IELogs';
  className = 'DataBusiness';
  method = 'LoadDataAsync';
  idField = 'recID';
  predicatesTemp = '';
  dataValuesTemp = '';
  dataSelected: any;
  button?: ButtonModel[];
  lstImportParts = [];
  loaded: boolean;
  titleView = '';
  asideMode: string;
  constructor(
    private inject: Injector,
    private codxShareService: CodxShareService,
    private wrSv: CodxWrService
  ) {
    super(inject);
  }

  onInit(): void {
    this.asideMode = this.codxService?.asideMode;
    this.button = [
      {
        id: 'btnAdd',
      },
    ];
    this.cache.moreFunction('IELogs', 'grvIELogs').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'WR0105_1');
        if (m) this.titleView = m.customName;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
    ];
  }

  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    // switch (evt.id) {
    //   default:

    //     break;
    // }
    let f = { functionID: 'SYS001' }; //bùa đã
    let data = evt.model;
    if (!data) data = this.view.dataService.dataSelected;
    this.codxShareService.defaultMoreFunc(
      f,
      data,
      null,
      this.formModelTemp,
      this.view.dataService,
      this
    );
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'WR0105_1':
        this.viewDetail(data);
        break;
      case 'SYS003':
      case 'SYS004':
      case 'SYS001':
      case 'SYS002':
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.formModelTemp,
          this.view.dataService,
          this
        );
        // this.df.detectChanges();
        break;
    }
  }

  changeDataMF(e, data) {
    if (e != null) {
      e.forEach((res) => {
        switch (res?.functionID) {
          case 'SYS02':
          case 'SYS03':
          case 'SYS04':
            res.disabled = true;
            break;
        }
      });
    }
  }

  onActions(e) {
    switch (e.type) {
      case 'dbClick':
        //xư lý dbClick
        this.dataSelected = e?.data?.rowData;
        this.viewDetail(e?.data?.rowData);
        break;
    }
  }

  add(evt) {}

  //#region view detail
  async viewDetail(data) {
    if (data) {
      let option = new DialogModel();
      option.IsFull = true;
      option.zIndex = 999;
      let formModel = new FormModel();
      formModel.formName = this.formModelTemp.formName;
      formModel.gridViewName = this.formModelTemp.gridViewName;
      formModel.entityName = this.formModelTemp.entityName;
      option.FormModel = formModel;
      let obj = {
        titleAction: this.titleView,
        data: data,
      };
      this.callfc.openForm(
        PopupDetailImportPartsComponent,
        '',
        Util.getViewPort().width,
        Util.getViewPort().height,
        '',
        obj,
        '',
        option
      );
    }
  }
  //#endregion
}
