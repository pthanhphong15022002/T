import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-list-instances',
  templateUrl: './view-list-instances.component.html',
  styleUrls: ['./view-list-instances.component.css'],
})
export class ViewListInstancesComponent {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() lstStages = [];
  @Output() dbClickEvent = new EventEmitter<any>();
  countCurrent = 1;
  countTask = 0;
  countTaskDone = 0;
  countOverDueTask = 0;
  info: any;
  progress = 0;
  process: any;
  constructor(
    private api: ApiHttpService,
    private shareService: CodxShareService
  ) {}

  ngOnInit(): void {
    this.getTaskByInstanceID();
    this.getProcess();
    this.getInfo();
  }

  getProcess() {
    this.api
      .execSv<any>(
        'BP',
        'BP',
        'ProcessesBusiness',
        'GetAsync',
        this.dataSelected.processID
      )
      .subscribe((item) => {
        if (item) {
          const process = item;
          this.process = process;
          this.lstStages = process?.steps?.filter(
            (x) => x.activityType == 'Stage'
          );
        }
      });
  }

  getInfo() {
    let paras = [this.dataSelected.createdBy];
    let keyRoot = 'UserInfo' + this.dataSelected.createdBy;
    let info = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'AD',
      'UsersBusiness',
      'GetOneUserByUserIDAsync'
    );
    if (isObservable(info)) {
      info.subscribe((item) => {
        this.info = item;
      });
    } else this.info = info;
  }

  getTaskByInstanceID() {
    this.api
      .execSv<any>(
        'BP',
        'ERM.Business.BP',
        'ProcessTasksBusiness',
        'GetItemsByInstanceIDAsync',
        [this.dataSelected?.recID]
      )
      .subscribe((res) => {
        if (res) {
          const tasks = res.filter(
            (x) =>
              ![
                'Stage',
                'Group',
                'StartEnd',
                'Conditions',
                'Timer',
                'AI',
                'SubProcess',
              ].includes(x.activityType)
          );
          this.countTask = tasks?.length ?? 0; //Tổng task của nhiệm vụ

          tasks.forEach((ele) => {
            if (ele.status == '3') {
              //Task done
              this.countTaskDone++;
            }
            if (ele.endDate) {
              //task quá hạn
              if (ele.actualEnDate) {
                if (new Date(ele.endDate) < new Date(ele.actualEnDate))
                  this.countOverDueTask++;
              } else {
                if (new Date(ele.endDate) < new Date()) this.countOverDueTask++;
              }
            }

            if (this.countTask > 0) {
              let rate = (this.countTaskDone / this.countTask) * 100;
              this.progress = rate > 0 ? Math.round(rate) : 0;
            }
          });
          //Task done -> đợi ba mapping
        }
      });
  }

  getColor(data) {
    let color = 'step'; // Mặc định là 'step'
    const lst = this.lstStages;

    if (lst.some((x) => x.recID == data.recID)) {
      let currentIdx = lst.findIndex((x) => x.recID == data?.recID);

      if (
        currentIdx <
        lst.findIndex((x) => x.recID == this.dataSelected?.currentStage)
      ) {
        // Nếu index của item hiện tại nhỏ hơn index của '3'
        color = 'step old'; // Gán lớp 'step old'
      } else if (
        currentIdx ===
        lst.findIndex((x) => x.recID == this.dataSelected?.currentStage)
      ) {
        // Nếu index của item hiện tại bằng index của '3'
        color = 'step current'; // Gán lớp 'step current'
      }
    }
    return color; // Trả về lớp CSS
  }

  dbClick(data) {
    this.dbClickEvent.emit({ data: data });
  }
}
