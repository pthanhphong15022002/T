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
  CacheService,
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

  title = 'Nhiệm vụ';
  titleAction: string = '';

  gridViewSetup: any;
  action: any;
  tabInfo: any[] = [];
  tabContent: any[] = [];
  listInstances: DP_Instances[] = [];
  formModelCrr: FormModel;

  instanceNo: string;
  listStepCbx: any;

  instance: DP_Instances;

  isApplyFor: string = ''; // this is instance opportunity general

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
  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };
  acction: string = 'add';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private codxDpService: CodxDpService,
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
    this.instance.instanceNo = dt?.data[6];
  }

  ngOnInit(): void {
    if (this.action === 'add') {
      this.autoClickedSteps();
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
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
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
          if (idxField != -1)
            this.listStep[index].fields[idxField].dataValue = result;
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
    if (this.action === 'add') {
      option.methodName = 'AddInstanceAsync';
    } else if (this.action === 'edit') {
      option.methodName = 'EditInstanceAsync';
    }
    option.data = [this.instance, this.listStep];

    return true;
  }
  saveInstances() {
    if (this.instance?.title === null || this.instance?.title.trim() === '') {
      this.notificationsService.notifyCode('DP001');
      return;
    }
    if (this.listStep.length > 0) {
      let check = true;
      let checkFormat = true;
      this.listStep?.forEach((obj) => {
        if (obj.fields?.length > 0) {
          obj.fields.forEach((f) => {
            if (f.isRequired && (!f.dataValue || f.trim() == '')) {
              this.notificationsService.notifyCode(
                'SYS009',
                0,
                '"' + f.title + '"'
              );
              check = false;
            }
            checkFormat = this.checkFormat(f);
          });
        }
      });
      if (!check || !checkFormat) return;
    }
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res && res.save) {
          this.dialog.close(res);
        }
      });
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  autoClickedSteps() {
    this.instance.stepID = this.listStep[0].stepID;
  }
  async genAutoNumberNo() {
    this.codxDpService
      .genAutoNumber(this.formModelCrr.funcID, 'DP_Instances', 'InstanceNo')
      .subscribe((res) => {
        if (res) {
          this.instance.instanceNo = res;
        }
      });
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notificationsService.notifyCode(
                'SYS009',
                0,
                '"' + errorMessage + '"'
              );
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notificationsService.notifyCode(
                'SYS009',
                0,
                '"' + errorMessage + '"'
              );
            }
          });
          return false;
        }
      }
    }
    return true;
  }
}
