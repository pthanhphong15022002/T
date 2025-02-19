import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiHttpService, FormModel } from 'codx-core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-view-content-schedule-meetings',
  templateUrl: './view-content-schedule-meetings.component.html',
  styleUrls: ['./view-content-schedule-meetings.component.css'],
})
export class ViewContentScheduleMeetingsComponent {
  @Input() data: any;
  @Input() formModel: any;
  @Output() openLink = new EventEmitter<any>();
  @Input() recID: any;
  haveFile = false;
  locationName = '';
  constructor(private api: ApiHttpService) {}

  async ngOnInit() {
    if(this.formModel){
      let formModel = new FormModel();
      formModel.entityName = 'CO_TMMeetings';
      formModel.formName = 'TMMeetings';
      formModel.gridViewName = 'grvTMMeetings';
      formModel.funcID = 'TMT0501';
      this.formModel = formModel;
    }
    if (this.recID) {
      this.data = await firstValueFrom(
        this.api.execSv<any>(
          'CO',
          'CO',
          'MeetingsBusiness',
          'GetOneByRecIDAsync',
          [this.recID]
        )
      );
    }
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [this.data.recID]
      )
      .subscribe((res: any[]) => {
        if (res?.length > 0) {
          this.haveFile = true;
        }
      });
    if (this.data) {
    }
    if (this.data.location) {
      this.api
        .execSv(
          'EP',
          'ERM.Business.EP',
          'ResourcesBusiness',
          'GetResourceAsync',
          [this.data.location]
        )
        .subscribe((res: any) => {
          if (res) {
            this.locationName = res?.resourceName;
          } else {
            this.locationName = this.data.location;
          }
        });
    }
  }

  getResourceID(data) {
    var resources = [];
    let objectID = '';
    resources = data.permissions;
    var id = '';
    if (resources != null) {
      resources.forEach((e) => {
        id += e.objectID + ';';
      });
    }

    if (id != '') {
      objectID = id.substring(0, id.length - 1);
    }
    return objectID;
  }

  getDate(data) {
    let startTime = '';
    if (data.startDate) {
      var date = new Date(data.startDate);
      var endDate = new Date(data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());
      startTime = start + ' - ' + end;
    }
    return startTime;
  }
  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
  openLinkMeeting(data) {
    if (data?.link) {
      window.open(data?.link, '_blank');
    }
  }
}
