import { CodxOmService } from './../../codx-om.service';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  FormModel,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddTaskComponent } from '../../popup/popup-add-task/popup-add-task.component';

@Component({
  selector: 'lib-okr-tasks',
  templateUrl: './okr-tasks.component.html',
  styleUrls: ['./okr-tasks.component.scss'],
})
export class OKRTasksComponent extends UIComponent implements AfterViewInit {
  @ViewChild('viewTask') viewTask!: ViewsComponent;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @Output() click = new EventEmitter<string>();
  service = 'TM';
  entityName = 'TM_Tasks';
  idField = 'taskID';
  assemblyName = 'TM';
  className = 'TaskBusiness';
  method = 'GetTasksAsync';
  funcID = 'TMT0201';
  dataObj;
  formModel: FormModel;
  button?: ButtonModel;
  buttons: Array<ButtonModel>;
  views: Array<ViewModel> | any = [];
  viewType = ViewType;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  isKanban: boolean = true;
  dataTreeProcessStep = [];
  listPhaseName = [];
  kanban: any;

  constructor(inject: Injector, private omService: CodxOmService) {
    super(inject);
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.dataObj = JSON.stringify(this.dataObj);
        }
      });
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'TM';
    this.request.assemblyName = 'TM';
    this.request.className = 'TaskBusiness';
    this.request.method = 'GetTasksAsync';
    this.request.idField = 'taskID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    //this.resourceKanban.dataObj = '125125';

    this.button = {
      id: 'btnAdd',
    };

    this.buttons = [
      {
        id: '1',
        icon: 'icon-format_list_bulleted icon-18',
        text: ' List',
      },
      {
        id: '2',
        icon: 'icon-appstore icon-18',
        text: ' Card',
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.kanban,
        active: true,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: false,
        // request: ,
        // request2: ,
        showSearchBar: false,
        showFilter: false,
        model: {
          statusColorRef: 'TM004',
        },
      },
    ];
  }

  clickMF(e: any, data?: any) {}

  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        //tắt duyệt confirm
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          (data.confirmControl == '0' || data.confirmStatus != '1')
        ) {
          x.disabled = true;
        }
        if (
          x.functionID == 'TMT02019' &&
          data.verifyControl == '0' &&
          data.category == '1'
        ) {
          x.disabled = true;
        }
        //tắt duyệt xác nhận
        if (
          (x.functionID == 'TMT04032' || x.functionID == 'TMT04031') &&
          data.verifyStatus != '1'
        ) {
          x.disabled = true;
        }
        //tắt duyệt đánh giá
        if (
          (x.functionID == 'TMT04021' ||
            x.functionID == 'TMT04022' ||
            x.functionID == 'TMT04023') &&
          data.approveStatus != '3'
        ) {
          x.disabled = true;
        }
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
        if (
          (x.functionID == 'TMT02015' || x.functionID == 'TMT02025') &&
          data.status == '90'
        ) {
          x.disabled = true;
        }
        //an cap nhat tien do khi hoan tat
        if (
          (x.functionID == 'TMT02018' ||
            x.functionID == 'TMT02026' ||
            x.functionID == 'TMT02035') &&
          data.status == '90'
        ) {
          x.disabled = true;
        }
      });
    }
  }

  buttonClick(event: any) {
    // this.click.emit(event);
    this.callfc.openSide(PopupAddTaskComponent);
  }

  viewChange(event) {
    if (event?.type == 6) {
      this.viewTask.viewChange(this.views[0]);
      this.detectorRef.detectChanges();
    }
    if (event?.type == 8) {
      this.viewTask.viewChange(this.views[1]);
      this.detectorRef.detectChanges();
    }
  }

  add(event) {}
}
