import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  ViewModel,
  ViewType,
  FormModel,
  ButtonModel,
  ResourceModel,
} from 'codx-core';
import { CodxEpService } from '../codx-ep.service';

@Component({
  selector: 'testOM',
  templateUrl: './testOM.component.html',
  styleUrls: ['./testOM.component.scss'],
})
export class TestOMComponent extends UIComponent {
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  views: Array<ViewModel> = [];
  funcID: string;
  formModel: FormModel;
  service = 'OM';
  assemblyName = 'OM';
  entityName = 'OM_OKRPersonal';
  className = 'MeetingsBusiness';
  method = 'GetListMeetingsAsync';
  idField = 'meetingID';
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  viewType = ViewType;
  buttons: ButtonModel;
  popupTitle: string;
  funcIDName: string;
  moreFunc: Array<ButtonModel> = [];
  itemDetail: any;
  itemSelected: any;
  titleAction: any;
  statusVll = 'CO004';

  constructor(
    private injector: Injector,
    private activatedRoute: ActivatedRoute,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
  }

  onInit(): void {
    this.buttons = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteBookingAsync';
    this.views = [];
    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        //this.addNew();
        break;
      case 'btnEdit':
        //this.edit();
        break;
      case 'btnDelete':
        //this.delete();
        break;
    }
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS01':
        //this.add();
        break;
      case 'SYS03':
        //this.edit(data);
        break;
      case 'SYS04':
        //this.copy(data);
        break;
      case 'SYS02':
        //this.delete(data);
        break;
      case 'TMT05011':
        // this.viewDetail(e.data, data);
        //this.viewDetail(data);
        break;
      case 'TMT05013':
        //this.updateStatusMeeting(e.data, data);
        break;
    }
  }

  changeDataMF(e: any, data: any) {
    if (e) {
      e.forEach((x) => {
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  onActionClick(evt?) {
    if (evt.type == 'add') {
      //this.addNew(evt.data);
    }
  }
}
