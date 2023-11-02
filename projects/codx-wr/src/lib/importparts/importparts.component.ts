import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CodxGridviewV2Component,
  DialogModel,
  DialogRef,
  FormModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

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
    entityName: 'WR_tempImportParts'
  }
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
  button?: ButtonModel;

  constructor(
    private inject: Injector,
    private codxShareService: CodxShareService
  ) {
    super(inject);
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
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

  selectedChange(e) {}

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    // switch (evt.id) {
    //   default:

    //     break;
    // }
    let f = {functionID: 'SYS001'}; //bùa đã
    let data = evt.model;
    if (!data) data = this.view.dataService.dataSelected;
    this.codxShareService.defaultMoreFunc(
      f,
      data,
      null,
      this.view.formModel,
      this.view.dataService,
      this
    );
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS003':
      case 'SYS004':
      case 'SYS001':
      case 'SYS002':
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        // this.df.detectChanges();
        break;
    }
  }

  onActions(e) {
    switch (e.type) {
      case 'dbClick':
        //xư lý dbClick
        this.viewDetail(e);
        break;
    }
  }

  add(evt) {}

  //#region view detail
  viewDetail(data) {
    let dt= data?.data?.rowData;
    this.dataSelected = dt;
    if(dt){
      let option = new DialogModel();
      option.IsFull = true;
      option.zIndex = 999;
      this.predicatesTemp = 'SessionID=@0';
      this.dataValuesTemp = dt?.recID;
      this.popupView = this.callfc.openForm(
        this.templateViewDetail,
        '',
        Util.getViewPort().width,
        Util.getViewPort().height,
        '',
        null,
        '',
        option
      );
      this.popupView.closed.subscribe((e) => {});
    }

  }
  //#endregion
}
