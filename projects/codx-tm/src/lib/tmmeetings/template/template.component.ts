import { ActivatedRoute } from '@angular/router';
import { DataRequest } from './../../../../../../src/shared/models/data.request';
import {
  CO_MeetingTemplates,
  CO_Content,
} from './../../models/CO_MeetingTemplates.model';
import { Component, Injector, Input, OnInit, Optional } from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  UIComponent,
  AlertConfirmInputConfig,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
})
export class TemplateComponent extends UIComponent implements OnInit {
  @Input() template: CO_MeetingTemplates[];
  options = new DataRequest();
  dialog: any;
  data: any;
  title = 'Chọn template';
  funcID: any;
  show: boolean = false;
  displayMembers: any;
  viewMember: any;
  valueMember: any;
  tempID: any;
  content: CO_Content[] = [];
  constructor(
    private injector: Injector,
    private activedRouter: ActivatedRoute,
    private notificationsService: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);

    this.dialog = dialog;
    this.data = dt?.data;
    this.content = this.data.contents;

    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.loadData();
  }

  loadData() {
    let data = new DataRequest();
    data.page = 1;
    data.pageSize = 10;
    data.comboboxName = 'TM_MeetingTemplates';
    this.api
      .execSv<any>(
        'CO',
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        data
      )
      .subscribe((res) => {
        if (res) {
          console.log(res);
          var item = JSON.parse(res[0]);
          var result = [];
          item.forEach((element) => {
            var obj = {
              recID: element['RecID'],
              templateName: element['TemplateName'],
              templateID: element['TemplateID'],
              descriptions: element['Descriptions'],
              content: element['Content'],
            };
            result.push(obj);
          });
          this.template = result;
        }
      });
  }

  search(e) {}

  toggleDocuments(item) {
    console.log(item);
    this.tempID = item.templateID;
  }

  onSave() {
    if (this.data.templateID == null) {
      this.dialog.close(this.tempID);
    } else {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notificationsService
        .alert(
          'Thông báo',
          'Đã có dữ liệu cũ bạn có chắc chắn muốn chỉnh sửa?',
          config
        )
        .closed.subscribe((x) => {
          if (x.event.status == 'Y') {
            this.dialog.close(this.tempID);
          }
        });
    }
  }

  getContent(event) {
    this.data.contents = event;
  }
}
