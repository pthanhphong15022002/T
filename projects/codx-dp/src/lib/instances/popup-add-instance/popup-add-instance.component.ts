import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
} from 'codx-core';
import moment from 'moment';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances, DP_Instances_Steps } from '../../models/models';

@Component({
  selector: 'lib-popup-add-instance',
  templateUrl: './popup-add-instance.component.html',
  styleUrls: ['./popup-add-instance.component.css'],
})
export class PopupAddInstanceComponent implements OnInit {
  @ViewChild('tabGeneralInfo') tabGeneralInfo: TemplateRef<any>;
  @ViewChild('tabLocation') tabLocation: TemplateRef<any>;
  @ViewChild('tabInputInfo') tabInputInfo: TemplateRef<any>;
  @ViewChild('tabOpporGeneralInfo') tabOpporGeneralInfo: TemplateRef<any>;

  title = '';
  titleAction: string = '';

  gridViewSetup: any;
  action: any;
  dateMessage: any;
  tabInfo: any[] = [];
  tabContent: any[] = [];
  listInstances: DP_Instances[] = [];
  formModelCrr: FormModel;

  // instanceNo: string;
  listStepCbx: any;

  instance: DP_Instances;

  isApplyFor: string = ''; // this is instance opportunity general

  totalDaySteps: number;
  dateOfDuration: any;
  menuGeneralInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'GeneralInfo',
    subName: 'General information',
    subText: 'General information',
  };

  menuAddress = {
    icon: 'icon-reorder',
    text: 'Địa chỉ',
    name: 'Location',
    subName: 'Location',
    subText: 'Location',
  };

  menuInputInfo = {
    icon: 'icon-reorder',
    text: 'Thông tin nhập liệu',
    name: 'InputInfo',
    subName: 'Input information',
    subText: 'Input information',
  };

  dialog: DialogRef;
  // step = new DP_Instances_Steps() ;
  listStep = [];
  recID: any;
  lstParticipants = [];
  userName = '';
  positionName = '';
  owner = '';
  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };
  acction: string = 'add';
  oldEndDate: Date;
  oldIdInstance: string;
  user: any;
  autoName: string = '';
  listCustomFile = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private codxDpService: CodxDpService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.instance = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dialog = dialog;
    this.action = dt?.data[0];
    this.isApplyFor = dt?.data[1];
    this.listStep = dt?.data[2];
    this.titleAction = dt?.data[3];
    this.formModelCrr = dt?.data[4];
    this.listStepCbx = dt?.data[5];
    this.totalDaySteps = dt?.data[6];
    this.autoName = dt?.data[9];
    this.user = this.authStore.get();
    if (this.action === 'edit') {
      this.autoName = dt?.data[7];
      this.owner = this.instance?.owner;
      if (
        this.instance.permissions != null &&
        this.instance.permissions.length > 0
      ) {
        this.lstParticipants = this.instance.permissions.filter(
          (x) => x.roleType === 'P'
        );
      }
    }
    else if (this.action === 'add' || this.action === 'copy') {
      this.lstParticipants = dt?.data[7];
      if (this.lstParticipants != null && this.lstParticipants.length > 0)
        var check = this.lstParticipants.some(
          (x) => x.objectID === this.user.userID
        );
      if (!check) {
        let tmp = {};
        tmp['objectID'] = this.user.userID;
        tmp['objectName'] = this.user.userName;
        tmp['objectType'] = 'U';

        this.lstParticipants.push(tmp);
      }
      this.owner = this.user.userID;
    }

    if (this.action === 'copy') {
      this.oldIdInstance = dt?.data[8];
    }
    // if (this.instance.owner != null) {
    //   this.getNameAndPosition(this.instance.owner);
    // }
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  ngOnInit(): void {
    if (this.action === 'add' || this.action === 'copy') {
      this.action === 'add' && this.autoClickedSteps();
      this.handleEndDayInstnace(this.totalDaySteps);
    } else if (this.action === 'edit') {
      this.oldEndDate = this.instance?.endDate;
    }
  }

  ngAfterViewInit(): void {
    if (this.isApplyFor === '1') {
      this.tabInfo = [
        this.menuGeneralInfo,
        this.menuAddress,
        this.menuInputInfo,
      ];
      this.tabContent = [
        this.tabOpporGeneralInfo,
        this.tabLocation,
        this.tabInputInfo,
      ];
    } else {
      this.tabInfo = [this.menuGeneralInfo, this.menuInputInfo];
      this.tabContent = [this.tabGeneralInfo, this.tabInputInfo];
    }
  }

  buttonClick(e: any) {}

  setTitle(e: any) {
    if (!!this.autoName) {
      this.title = this.titleAction + ' ' + this.autoName;
    } else {
      this.title = this.titleAction + ' ' + e;
      this.autoName = e;
    }
    this.changeDetectorRef.detectChanges();
  }

  valueChange($event) {
    if ($event) {
      this.instance[$event.field] = $event.data;
    }
  }
  //anh thao Code ne bao
  // em thay roi
  valueChangeCustom(event) {
    if (event && event.e && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }

      var index = this.listStep.findIndex((x) => x.recID == field.stepID);

      if (index != -1) {
        if (this.listStep[index].fields?.length > 0) {
          let idxField = this.listStep[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1){
            this.listStep[index].fields[idxField].dataValue = result;
            let idxEdit = this.listCustomFile.findIndex((x) => x.recID == this.listStep[index].fields[idxField].recID);
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listStep[index].fields[idxField];
            } else
              this.listCustomFile.push(this.listStep[index].fields[idxField]);
          }
        }
      }
    }
  }
  cbxChange(e) {
    this.instance.stepID = e;
  }

  valueChangeUser(event) {
    if (event.data) {
      this.instance.owner = event?.data;
    }
  }

  beforeSave(option: RequestOption) {
    if (this.action === 'add' || this.action === 'copy') {
      option.methodName = 'AddInstanceAsync';
      option.data = [this.instance, this.listStep, this.oldIdInstance];
    } else if (this.action === 'edit') {
      option.methodName = 'EditInstanceAsync';
      option.data = [this.instance, this.listCustomFile];
    }


    return true;
  }
  saveInstances() {
    if (this.instance?.title === null || this.instance?.title.trim() === '') {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Title']?.headerText + '"'
      );
      return;
    }
    if (this.instance?.owner === null || this.instance?.owner.trim() === '') {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    } else if (
      this.checkEndDayInstance(this.instance?.endDate, this.totalDaySteps)
    ) {
      // thDateFormat = new Date(this.dateOfDuration).toLocaleDateString('en-AU');
      this.notificationsService.notifyCode(
        `Ngày đến hạn phải lớn hơn hoặc bằng ${this.dateMessage} `
      );
      return;
    }
    //khong check custom field nua - nhung ko xóa
    // if (this.listStep?.length > 0) {
    //   let check = true;
    //   let checkFormat = true;
    //   this.listStep.forEach((obj) => {
    //     if (obj?.fields?.length > 0 && obj.stepID==this.instance.stepID) {
    //       var arrField = obj.fields;
    //       arrField.forEach((f) => {
    //           if (
    //             f.isRequired &&
    //             (!f.dataValue || f.dataValue?.toString().trim() == '')
    //           ) {
    //             this.notificationsService.notifyCode(
    //               'SYS009',
    //               0,
    //               '"' + f.title + '"'
    //             );
    //             check = false;
    //           }
    //           checkFormat = this.checkFormat(f);
    //       });
    //     }
    //   });
    //   if (!check || !checkFormat) return;
    // }
    if (this.action === 'add' || this.action === 'copy') {
      this.onAdd();
    } else if (this.action === 'edit') {
      this.onUpdate();
    }
  }
  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res && res.save) {
          this.dialog.close(res);
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.close(res.update);
        }
      });
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  autoClickedSteps() {
    this.instance.stepID = this.listStep[0]?.stepID;
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.notificationsService.notifyCode('SYS037');
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.notificationsService.notifyCode('RS030');
          return false;
        }
      }
    }
    return true;
  }
  handleEndDayInstnace(durationDay: number) {
    this.instance.endDate = new Date();
    this.instance.endDate.setDate(
      this.instance.endDate.getDate() + durationDay
    );
    this.dateOfDuration = JSON.parse(JSON.stringify(this.instance?.endDate));
  }
  checkEndDayInstance(endDate, durationDay) {
    if (this.action === 'edit') {
      var timeEndDay =
        moment(new Date(this.instance.createdOn)).toDate().getTime() +
        durationDay * 24 * 3600000;
      var dateFormatCreate = moment(new Date(timeEndDay)).toDate();
    }
    var dateFormatDuration = new Date(
      this.action === 'edit' ? dateFormatCreate : this.dateOfDuration
    );
    var dateFormatEndDay = new Date(endDate);
    var dateStr1 = dateFormatDuration.toISOString().slice(0, 10);
    var dateStr2 = dateFormatEndDay.toISOString().slice(0, 10);
    this.dateMessage = new Date(dateFormatDuration).toLocaleDateString('en-AU');
    if (dateStr1 > dateStr2) {
      return true;
    }
    return false;
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  eventUser(e) {
    if (e != null) {
      this.owner = e?.id; // thêm check null cái
      this.instance.owner = this.owner;
    }
  }
  getNameAndPosition(id) {
    this.codxDpService.getPositionByID(id).subscribe((res) => {
      if (res) {
        this.userName = res.userName;
        this.positionName = res.positionName;
      }
    });
  }


  setTimeHoliday(starDay: Date, endDay: Date, dayOff: string): Date {
    if (dayOff && (dayOff.includes('7') || dayOff.includes('8'))) {
        const isSaturday = dayOff.includes('7');
        const isSunday = dayOff.includes('8');
        let day = 0;

        for (let currentDate = new Date(starDay); currentDate <= endDay; currentDate.setDate(currentDate.getDate() + 1)) {
            if (currentDate.getDay() === 6 && isSaturday) {
                day++;
            }
            if (currentDate.getDay() === 0 && isSunday) {
                day++;
            }
        }


        endDay.setDate(endDay.getDate() + day);

        if (endDay.getDay() === 0 && isSunday) {
            endDay.setDate(endDay.getDate() + 1);
        }

        return endDay;
    }

    return endDay;
  }
}
