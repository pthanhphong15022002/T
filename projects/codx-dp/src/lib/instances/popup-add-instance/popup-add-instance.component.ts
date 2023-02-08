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
  titleAction = '';

  tabInfo: any[] = [];
  tabContent: any[] = [];
  listInstances: DP_Instances[] = [];
  formModelCrr : FormModel;
  gridViewSetup: any;
  instanceNo: string;

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
  readonly fieldCbxStep = { text: 'stepName', value: 'recID' };
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
   // this.instance = dialog.dataService.dataSelected != null ? JSON.parse(JSON.stringify(dialog.dataService?.dataSelected))  : JSON.parse(JSON.stringify(dialog.dataService?.data[0]));
    this.dialog = dialog;
    
    this.listStep = dt?.data[2];
    this.isApplyFor = dt?.data[1];
    this.titleAction = dt?.data[3];
    this.formModelCrr = dt?.data[4];
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isApplyFor === 'D') {
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

  buttonClick(e: any) {
    console.log(e);
  }

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
      var index = this.listStep.findIndex((x) => x.stepID == event.data.stepID);
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

  valueChangeUser(event) {}

  beforeSave(option: RequestOption) {
    if ((this.acction = 'add')) {
      option.methodName = 'AddInstanceAsync';
    }
    option.data = [this.instance, this.listStep];
  
    return true;
  }
  saveInstances() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res && res.save) {
          this.dialog.close(res);
        }
      });
  }
}
