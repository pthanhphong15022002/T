import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { AuthStore } from 'codx-core';
import { environment } from 'src/environments/environment';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Input() viewPreset: string = "weekAndDay";
  user: any;
  minHeight = 525;
  height: number;
  events = [];
  resources: any;
  columns = [
    {
      text: 'Tên thành viên', field: 'name', width: 200, htmlEncode: false,
      renderer: (data: any) => {
        if (!data?.value) {
          return "";
        }
        let arrayValue = data.value.split('|');
        let [userID, userName, position] = arrayValue;
        return ` <div class="d-flex align-items-center user-card py-4">
      <div class="symbol symbol-40 symbol-circle mr-4">
          <img  alt="Pic" src="${environment.apiUrl}/api/dm/img?objectID=${userID}&objectType=AD_Users&width=40&userId=${this.user.userID}&tenant=${this.user.tenant}&tk=${this.user.token}" />
      </div>
      <div class="d-flex flex-column flex-grow-1">
          <div class="text-dark font-weight-bold">${userName}</div>
          <div class="text-dark-75 font-weight-bold">${position}</div>
      </div>
  </div>`

      }
    }
  ];
  features: {
    headerZoom: false
  };
  constructor(private tmSv: TmService,
    private auStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef) {
      this.user = this.auStore.get();
 //   this.getHeightContain();
  }
  
  // getHeightContain(callback = null) {
  //   var hContainer = $("#kt_wrapper").height();
  //   if (hContainer && hContainer > 0) this.height = hContainer - 70;

  //   if (typeof callback === "function") return callback(true);
  // }

  ngOnInit(): void {
    this.tmSv.changeData.subscribe((result) => {
      if (result) {
        let data = result.data as Array<any>;
        this.resources = [];
        //if(this.viewListDetails) this.viewListDetails.detectChanges();
        this.resources = data;
        // if(this.viewListDetails) this.viewListDetails.detectChanges();

        this.handleDataSchedule(data);
        this.changeDetectorRef.detectChanges();
      }
    })
  }

  handleDataSchedule(listTask) {
    if (listTask?.length == 0) {
      this.events = [];
      this.resources = [];
      return;
    }
    const key = 'userID';
    const listUser = [...new Map(listTask.map(item =>
      [item[key], item])).values()];
    if (listTask && listTask.length > 0) {
      this.events = listTask.map((item: any) => {
        return {
          resourceId: item.owner,
          startDate: item.startDate,
          endDate: item.endDate,
          id: item.taskID,
          name: item.taskName,
          eventColor: item.backgroundColor,
          write: item.write,
          delete: item.delete,

        }
      });
    }
    if (listUser && listUser.length > 0) {
      this.resources = listUser.map((item: any) => {
        return {
          id: item.userID,
          name: item.userID + "|" + item.userName + "|" + (item.positionName ?? "")
        }
      });
    }
  }

  onCellDblClickScheduler(data) {
    let taskID = data.event.eventRecord.data.id;
    if (taskID) {
      this.viewDetailTask(taskID);
    }
  }
  viewDetailTask(taskID) {
    this.tmSv.showPanel.next(new InfoOpenForm(taskID, "TM003", VIEW_ACTIVE.Schedule, 'edit'));
  }
}
