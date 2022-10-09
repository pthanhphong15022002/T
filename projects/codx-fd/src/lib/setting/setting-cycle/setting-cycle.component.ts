import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  Injector,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogRef, UIComponent, DialogData, NotificationsService } from 'codx-core';

@Component({
  selector: 'app-setting-cycle',
  templateUrl: './setting-cycle.component.html',
  styleUrls: ['./setting-cycle.component.scss'],
})
export class SettingCycleComponent extends UIComponent implements OnInit {
  @ViewChild('settingCycleRun') settingCycleRun: any;
  @Input() applyFor: string = '';
  @Output() onSaveModel = new EventEmitter<any>();
  @Output() message = new EventEmitter<any>();
  monthActive = ['1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  messageSC003 = '';
  monthNameRun = '';
  dayNameRun = '';
  functionList: any;
  header: any;
  dialog: DialogRef;
  formModel: any;
  scheduledTasks: any;
  messageSC003Temp: any;

  constructor(
    private injector: Injector,
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private notification: NotificationsService,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dt;
    this.scheduledTasks = data.data?.scheduledTasks;
    this.getMessage();
  }
  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.scheduledTasks.currentValue) {
  //     this.monthActive = this.scheduledTasks.months.split('');
  //     this.updateMonthNameRun();
  //     this.setTextMemo();
  //   }
  // }
  openPopup() {
    this.modalService.open(this.settingCycleRun, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
  }
  onInit(): void {}
  handleChange(evt) {
    this.scheduledTasks.occurrenceOption =
      this.scheduledTasks.occurrenceOption == '1' ? '3' : '1';
    this.setTextMemo();
  }
  setTextMemo() {
    if (this.scheduledTasks.occurrenceOption == '1') {
      this.dayNameRun = 'ngày ' + this.scheduledTasks.dayOfMonth;
    } else {
      this.dayNameRun = 'ngày cuối tháng';
    }
    this.messageSC003 = this.setCycle(this.dayNameRun, this.monthNameRun);
  }
  valueChangeInputDay(newValue) {
    this.scheduledTasks.dayOfMonth = newValue;
    this.setTextMemo();
  }

  changeMonthActive(index) {
    this.monthActive[index] = this.monthActive[index] == '1' ? '0' : '1';
    this.updateMonthNameRun();
  }
  updateMonthNameRun() {
    this.monthNameRun = '';
    this.monthActive.forEach((element, index) => {
      if (element == '1') {
        let month = index + 1;
        this.monthNameRun += 'tháng ' + month + ', ';
      }
    });
    this.monthNameRun = this.monthNameRun.slice(0, -2);
    //Set lại tháng
    this.messageSC003 = this.setCycle(this.dayNameRun, this.monthNameRun);
    this.detectorRef.detectChanges();
  }
  // saveSettingCycleRun() {
  //   this.scheduledTasks.months = this.monthActive.join('');
  //   this.onSaveModel.emit(this.scheduledTasks);
  // }
  getMessage() {
    this.cache.message('SC003').subscribe((res) => {
      if (res) {
        this.messageSC003 = res.defaultName;
        this.messageSC003Temp = JSON.parse(JSON.stringify(res.defaultName));
        this.monthActive = this.scheduledTasks.months.split('');
        this.updateMonthNameRun();
        this.setTextMemo();
      }
    });
  }

  setCycle(dayNameRun, monthNameRun) {
    if (this.messageSC003) {
      var mess = JSON.parse(JSON.stringify(this.messageSC003Temp));
      var main = JSON.parse(JSON.stringify(this.messageSC003Temp));
      mess = mess.replace('{0}', dayNameRun);
      main = mess.replace('{1}', monthNameRun);
      // this.messageSC003 = this.main;
    }
    return main;
  }

  saveSettingCycleRun() {
    this.scheduledTasks.months = this.monthActive;
    this.api
      .execSv('SYS', 'AD', 'ScheduledTasksBusiness', 'AddUpdateAsync', [
        this.scheduledTasks,
      ])
      .subscribe((result) => {
        if (result) {
          this.notification.notifyCode('SYS019');
        }
      });
  }
}
