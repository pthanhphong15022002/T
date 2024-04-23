import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  Util,
} from 'codx-core';
import moment from 'moment';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances } from '../../models/models';
import { CustomFieldService } from '../../share-crm/codx-input-custom-field/custom-field.service';

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

  applyFor: string = ''; // this is instance opportunity general
  addFieldsControl = '1';
  totalDaySteps: number;
  totalHourSteps: number;
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
  recID: any;
  lstParticipants = [];
  listCustomFile = [];
  listFields: any[] = [];
  listStep = [];
  userName = '';
  positionName = '';
  owner = '';
  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };
  fields: Object = { text: 'userName', value: 'userID' };
  actionAdd: string = 'add';
  endDate: Date;
  oldIdInstance: string;
  user: any;
  autoName: string = '';
  instanceNoSetting: any;
  processID: string = '';
  idxCrr: number = -1;
  autoNameTabFields: string;
  arrCaculateField = []; //cac field co tinh toán
  isLoadedCF = false; // da lay danh sach CF
  isShowMore = false;
  widthDefault: string;
  templetCreated = [];
  conRef: any[] = []//mang ref error
  isHaveApplyDep = false;  //co dependence

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private codxDpService: CodxDpService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private customFieldSV: CustomFieldService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action;
    this.applyFor = dt?.data?.applyFor;
    this.listStep = this.updateIdFile(dt?.data?.listSteps);
    this.titleAction = dt?.data?.titleAction;
    this.formModelCrr = dt?.data?.formMD;
    this.autoName = dt?.data?.autoName;
    this.endDate = new Date(dt?.data?.endDate);
    this.addFieldsControl = dt?.data?.addFieldsControl;
    this.instanceNoSetting = dt?.data?.instanceNoSetting;
    this.processID = dt?.data?.processID;
    this.autoNameTabFields = dt?.data?.autoNameTabFields;
    this.oldIdInstance = dt?.data?.oldIdInstance;
    this.instance = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.lstParticipants = dt?.data?.lstParticipants?.filter(
      (x) => x?.userID != null && x?.userID != ''
    );

    if (this.action != 'add') {
      this.promiseAll();
    }
    //lấy độ rộng popup
    this.widthDefault = this.dialog.dialog.width
      ? this.dialog.dialog.width.toString()
      : '550';

    this.user = this.authStore.get();
    if (this.action === 'edit' || this.action === 'view') {
      this.autoName = dt?.data?.autoName;
      this.owner = this.instance?.owner;
    } else {
      this.instance.title = this.autoName?.trim();
      this.instance.endDate = this.endDate;
      let check = false;
      if (this.lstParticipants != null && this.lstParticipants.length > 0)
        check = this.lstParticipants.some((x) => x.userID === this.user.userID);

      if (check == true) {
        this.owner = this.user.userID;
      } else {
        this.owner = '';
      }
      this.instance.owner = this.owner;
    }
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

    if (this.action === 'add') {
      this.updateEndDate();
    }
  }

  ngOnInit(): void {
    if (this.menuInputInfo)
      this.menuInputInfo.text =
        this.autoNameTabFields != null && this.autoNameTabFields?.trim() != ''
          ? this.autoNameTabFields
          : this.menuInputInfo.text;
    if (this.action === 'add' || this.action === 'copy') {
      this.action === 'add' && this.autoClickedSteps();
    }
  }

  ngAfterViewInit(): void {
    if (this.action == 'add') {
      this.loadTabsForm();
    }
  }

  buttonClick(e: any) { }

  async promiseAll() {
    this.action === 'edit' &&
      (await this.getListInstanceStep(
        this.instance.recID,
        this.instance.processID,
        this.instance.status
      ));
    this.action === 'copy' && (await this.getListInstaceStepCopy());
  }

  updateEndDate() {
    this.endDate = this.HandleEndDate(
      this.listStep,
      this.action,
      this.action !== 'edit' ||
        (this.action === 'edit' &&
          (this.instance.status == '1' || this.instance.status == '15'))
        ? null
        : this.instance.createdOn
    );
    this.instance.endDate =
      this.action === 'edit' ? this.instance?.endDate : this.endDate;
  }

  loadTabsForm() {
    if (this.action != 'add')
      this.idxCrr = this.listStep.findIndex(
        (x) => x.stepID == this.instance.stepID
      );

    if (this.applyFor === '1') {
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
    if (!this.ischeckFields(this.listStep)) {
      this.tabInfo.pop();
      this.tabContent.pop();
    }
  }

  async getListInstanceStep(recID, processID, status) {
    this.codxDpService
      .GetStepsByInstanceIDAsync([recID, processID, status, this.applyFor])
      .subscribe(async (res) => {
        if (res && res?.length > 0) {
          this.listStep = JSON.parse(JSON.stringify(res));
          this.updateEndDate();
          this.loadTabsForm();
        }
      });
  }

  async getListInstaceStepCopy() {
    let datas = [this.oldIdInstance, this.processID, this.instanceNoSetting];
    this.codxDpService.getInstanceStepsCopy(datas).subscribe((res) => {
      if (res && res.length > 0) {
        this.listStep = res[0];
        this.loadTabsForm();
        this.instance.instanceNo = res[1];
        this.updateEndDate();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  setTitle(e: any) {
    if (this.autoName) {
      this.title = this.titleAction + ' ' + this.autoName;
    } else {
      this.title = this.titleAction + ' ' + e;
      this.autoName = e;
    }
    this.changeDetectorRef.detectChanges();
  }

  valueChangeDate($event) {
    if ($event) {
      this.instance[$event.field] = $event.data.fromDate;
    }
  }
  valueChange($event) {
    if ($event) {
      this.instance[$event.field] = $event.data;
    }
  }

  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      let result = event.e;
      let field = event.data;
      let dependences = event?.dependences; //tham chieu dependece cua cbx

      let index = this.listStep.findIndex((x) => x.recID == field.stepID);

      if (index != -1) {
        if (this.listStep[index].fields?.length > 0) {
          let idxField = this.listStep[index].fields.findIndex(
            (x) => x.recID == event.data.recID
          );
          if (idxField != -1) {
            let valueOld = this.listStep[index].fields[idxField].dataValue;
            this.listStep[index].fields[idxField].dataValue = result;

            // //Tham chieu rang buoc
            // let crrField = this.listStep[index].fields[idxField];
            // if (crrField.isApplyConditional && crrField?.conditionReference?.length > 0) {
            //   let check = this.customFieldSV.checkConditionalRef(this.listStep[index].fields, crrField)
            //   this.conRef = this.conRef.filter(f => f?.id != crrField.recID);
            //   if (!check?.check && check.conditionRef?.length > 0) {
            //     let arrRef = check.conditionRef.map(x => {
            //       let obj = { ...x, id: crrField.recID }
            //       return obj
            //     })
            //     this.conRef = this.conRef.concat(arrRef)
            //   }
            // }
            this.isHaveApplyDep = this.listStep[index].fields.some(x => x.isApplyDependences)
            if (this.isHaveApplyDep && dependences?.length > 0) this.listStep[index].fields = this.changeRefData(dependences, this.listStep[index].fields)
            let idxEdit = this.listCustomFile.findIndex(
              (x) => x.recID == this.listStep[index].fields[idxField].recID
            );
            if (idxEdit != -1) {
              this.listCustomFile[idxEdit] =
                this.listStep[index].fields[idxField];
            } else
              this.listCustomFile.push(this.listStep[index].fields[idxField]);
            if (field.dataType == 'N' && valueOld != result)
              this.caculateField();
          }
        }
      }
    }
  }

  cbxChange(e) {
    this.instance.stepID = e;
  }


  beforeSave(option: RequestOption) {
    if (this.action === 'add' || this.action === 'copy') {
      option.methodName = 'AddInstanceAsync';
      option.data = [
        this.instance,
        this.listStep,
        this.action === 'copy' ? this.oldIdInstance : null,
      ];
    } else if (this.action === 'edit') {
      option.methodName = 'EditInstanceAsync';
      option.data = [this.instance, this.listCustomFile];
    }

    return true;
  }
  saveInstances() {
    if (this.instance?.title === null || this.instance?.title?.trim() === '') {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Title']?.headerText + '"'
      );
      return;
    }
    if (!this.instance?.owner || this.instance?.owner?.trim() === '') {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    } else if (this.checkEndDayInstance(this.instance?.endDate, this.endDate)) {
      this.notificationsService.notifyCode(
        'DP032',
        0,
        '"' + this.gridViewSetup['EndDate']?.headerText + '"',
        '"' + this.dateMessage + '"'
      );
      return;
    }
    // //Kieerm tra dk
    // if (this.conRef?.length > 0) {
    //   this.conRef.forEach(x => {
    //     this.notificationsService.notify(x.messageText, x.messageType)
    //   })
    //   return
    // }
    if (!this.conditionRefValidate()) return;

    if (this.action === 'add' || this.action === 'copy') {
      this.onAdd();
    } else if (this.action === 'edit') {
      this.onUpdate();
    }
  }
  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res.save) {
          this.dialog.close(res.save);
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
  //Xoa templet tao => chưa xử lý dc ??
  deletedTempletMailCustomField() {
    if (this.templetCreated?.length > 0) this.customFieldSV.deletedTempmail(this.templetCreated)
  }
  autoClickedSteps() {
    this.instance.stepID = this.listStep[0]?.stepID;
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        let validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.notificationsService.notifyCode('SYS037');
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        let validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.notificationsService.notifyCode('RS030');
          return false;
        }
      }
    }
    return true;
  }
  checkEndDayInstance(endDate, endDateCondition) {
    let date1 = new Date(endDate);
    let date2 = new Date(endDateCondition);
    this.dateMessage = new Date(date2).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1 < date2;
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  eventUser(e) {
    this.owner = e; // thêm check null cái
    this.instance.owner = this.owner;
  }
  getNameAndPosition(id) {
    this.codxDpService.getPositionByID(id).subscribe((res) => {
      if (res) {
        this.userName = res.userName;
        this.positionName = res.positionName;
      }
    });
  }

  updateIdFile(listStep) {
    if (listStep?.length > 0 && listStep) {
      for (let item of listStep) {
        if (item.fields.length > 0 && item.fields) {
          let listFieldFiled = item.fields.filter((x) => x.dataType === 'A');
          if (listFieldFiled.length > 0 && listFieldFiled) {
            for (let fieldFile of listFieldFiled) {
              fieldFile.recID = Util.uid();
            }
          }
        }
      }
    }
    return listStep;
  }

  // checkAddField(stepCrr, idx) {
  //   if (stepCrr) {
  //     if (this.action == 'edit' && this.idxCrr != -1 && this.idxCrr >= idx) {
  //       return true;
  //     }
  //     if (idx == 0) return true;
  //     return false;
  //   }
  //   return false;
  // }

  ischeckFields(liststeps: any): boolean {
    this.listFields = [];
    if (this.action !== 'edit') {
      let stepCurrent = liststeps[0];
      if (stepCurrent && stepCurrent.fields?.length > 0) {
        let filteredTasks = stepCurrent.tasks
          .filter(
            (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
          )
          .map((task) => task.fieldID)
          .flatMap((item) => item.split(';').filter((item) => item !== ''));
        let listFields = stepCurrent.fields.filter(
          (field) =>
            !filteredTasks.includes(
              this.action === 'copy' ? field?.reCID : field?.refID
            )
        );
        this.listFields = [...this.listFields, ...listFields];
      }
    } else {
      let idxCrr = liststeps.findIndex(
        (x) => x.stepID == this.instance?.stepID
      );
      if (idxCrr != -1) {
        for (let i = 0; i <= idxCrr; i++) {
          let stepCurrent = liststeps[i];
          if (stepCurrent && stepCurrent.fields?.length > 0) {
            let filteredTasks = stepCurrent?.tasks
              .filter(
                (task) => task?.fieldID !== null && task?.fieldID?.trim() !== ''
              )
              .map((task) => task?.fieldID)
              .flatMap((item) => item.split(';').filter((item) => item !== ''));
            let listFields = stepCurrent?.fields.filter(
              (field) => !filteredTasks.includes(field?.recID)
            );
            this.listFields = [...this.listFields, ...listFields];
          }
        }
      }
    }
    return this.listFields != null && this.listFields?.length > 0;
  }
  HandleEndDate(listSteps: any, action: string, endDateValue: any) {
    endDateValue =
      action === 'add' ||
        action === 'copy' ||
        (this.action === 'edit' &&
          (this.instance.status == '1' || this.instance.status == '15'))
        ? new Date()
        : new Date(endDateValue);
    let dateNow = endDateValue;
    let endDate = endDateValue;
    for (let i = 0; i < listSteps.length; i++) {
      if (!listSteps[i].isSuccessStep && !listSteps[i].isFailStep) {
        endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
        endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
        endDate = this.setTimeHoliday(
          dateNow,
          endDate,
          listSteps[i]?.excludeDayoff
        );
        dateNow = endDate;
      }
    }
    return endDate;
  }
  setTimeHoliday(startDay: Date, endDay: Date, dayOff: string) {
    if (!dayOff || (dayOff && (dayOff.includes('7') || dayOff.includes('8')))) {
      const isSaturday = dayOff.includes('7');
      const isSunday = dayOff.includes('8');
      let day = 0;

      for (
        let currentDate = new Date(startDay);
        currentDate <= endDay;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        day += currentDate.getDay() === 6 && isSaturday ? 1 : 0;
        day += currentDate.getDay() === 0 && isSunday ? 1 : 0;
      }
      let isEndSaturday = endDay.getDay() === 6;
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        if (!isEndSaturday) {
          endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
        }
        endDay.setDate(endDay.getDate() + (isSunday ? 1 : 0));
      }
    }
    return endDay;
  }

  //----------------------CACULATE---------------------------//

  getArrCaculateField() {
    this.arrCaculateField = [];
    this.listStep.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'CF');
        if (fnum?.length > 0)
          this.arrCaculateField = this.arrCaculateField.concat(fnum);
      }
    });
    if (this.arrCaculateField?.length > 0)
      this.arrCaculateField.sort((a, b) => {
        if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
        else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
        else return 0;
      });
    this.isLoadedCF = true;
  }
  //tính toán
  caculateField() {
    if (!this.isLoadedCF) this.getArrCaculateField();
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    let fieldsNum = [];
    this.listStep.forEach((x) => {
      if (x.fields?.length > 0) {
        let fnum = x.fields.filter((x) => x.dataType == 'N');
        if (fnum?.length > 0) fieldsNum = fieldsNum.concat(fnum);
      }
    });
    if (!fieldsNum || fieldsNum?.length == 0) return;

    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      fieldsNum.forEach((f) => {
        if (
          f.stepID == obj.stepID &&
          dataFormat.includes('[' + f.fieldName + ']')
        ) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;
          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      this.arrCaculateField.forEach((x) => {
        if (
          x.stepID == obj.stepID &&
          dataFormat.includes('[' + x.fieldName + ']')
        ) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = this.listStep.findIndex((x) => x.recID == obj.stepID);
        if (index != -1) {
          if (this.listStep[index].fields?.length > 0) {
            let idxField = this.listStep[index].fields.findIndex(
              (x) => x.recID == obj.recID
            );
            if (idxField != -1) {
              this.listStep[index].fields[idxField].dataValue = obj.dataValue;

              let idxEdit = this.listCustomFile.findIndex(
                (x) => x.recID == this.listStep[index].fields[idxField].recID
              );
              if (idxEdit != -1) {
                this.listCustomFile[idxEdit] =
                  this.listStep[index].fields[idxField];
              } else
                this.listCustomFile.push(this.listStep[index].fields[idxField]);
            }
          }
          this.setElement(obj.recID, obj.dataValue, obj.dataType);
        }
      }
    });
  }

  setElement(recID, value, dataType) {
    var codxinput = document.querySelectorAll(
      '.form-group codx-input[data-record="' + recID + '"]'
    );
    if (dataType == 'N' || dataType == 'CF') {
      value =
        value && value != '_'
          ? Number.parseFloat(value)?.toFixed(2).toString()
          : '';
    }

    if (codxinput?.length > 0) {
      let htmlE = codxinput[0] as HTMLElement;
      let input = htmlE.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = value;
      }
    }
  }

  //------------------END_CACULATE--------------------//

  //openpopup
  rezisePopup(width = '1000') {
    this.isShowMore = !this.isShowMore;
    width = Util.getViewPort().width.toString();
    this.dialog.setWidth(this.isShowMore ? width : this.widthDefault);
    this.changeDetectorRef.detectChanges();
  }

  createdTempletMail(e) {
    if (e && !this.templetCreated.includes(e))
      this.templetCreated.push(e)
  }

  conditionRefValidate() {
    //Tham chieu rafng buoc
    var checkAll = true;
    // this.listFields.forEach(x => {
    //   let fields = this.listStep.find(f => f.recID == x.stepID)?.fields;
    //   if (fields?.length > 0) {
    //     let fieldsApplyCondition = x.fields.filter(x => x.isApplyConditional && x.conditionReference?.length > 0);
    //     if (fieldsApplyCondition?.length > 0) {
    //       let checkOne = true
    //       fieldsApplyCondition.forEach(x => {
    //         let check = this.customFieldSV.checkConditionalRef(fields, x);
    //         if (checkOne && !check.check) checkOne = check.check;
    //       })
    //       if (!checkOne && checkAll) checkAll = checkOne;
    //     }
    //   }
    // })
    let fieldsApplyCondition = this.listFields.filter(x => x.isApplyConditional && x.conditionReference?.length > 0);
    if (fieldsApplyCondition?.length > 0) {
      fieldsApplyCondition.forEach(x => {
        let check = this.customFieldSV.checkConditionalRef(this.listFields, x);
        if (checkAll && !check.check) checkAll = check.check;
      })
    }
    return checkAll;
  }

  //Tham chiếu giá trị
  changeRefData(dependences, fields) {
    dependences.forEach(fn => {
      let idx = fields.findIndex(x => x.fieldName == fn.fieldName);
      if (idx != -1) {
        fields[idx].dataValue = fn.dataValue
        this.setElement(fields[idx].recID, fn.dataValue, fields[idx].dataType)
        if (fields[idx].dataType == 'N') this.caculateField()
      }
    })

    return fields;
  }
}
