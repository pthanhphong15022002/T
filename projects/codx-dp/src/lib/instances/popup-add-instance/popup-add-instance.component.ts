import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
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

  title = 'Nhiệm vụ';
  titleAction = '';

  tabInfo: any[] = [];
  tabContent: any[] = [];
  listInstances: DP_Instances[] = [];

  gridViewSetup: any;
  instanceNo: string;

  instance: DP_Instances;

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
  step = new DP_Instances_Steps() ;

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
  
    this.step = dt?.data[2]
    // this.instanceNo = dt?.data[2]?.instanceNo ?? '';
    console.log(this.instanceNo);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.tabInfo = [this.menuGeneralInfo, this.menuAddress, this.menuInputInfo];

    this.tabContent = [
      this.tabGeneralInfo,
      this.tabLocation,
      this.tabInputInfo,
    ];
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
  // getFunctionID(field, textTitle) {
  //   this.cache.gridView('grvDPInstances').subscribe((res) => {
  //     this.cache
  //       .gridViewSetup('DPInstances', 'grvDPInstances')
  //       .subscribe((res) => {
  //         let titleAction = textTitle;
  //         let option = new SidebarModel();
  //         let formModel = this.dialog?.formModel;
  //         formModel.formName = 'DPStepsFields';
  //         formModel.gridViewName = 'grvDPStepsFields';
  //         formModel.entityName = 'DP_Steps_Fields';
  //         option.FormModel = formModel;
  //         option.Width = '550px';
  //         option.zIndex = 1010;
  //         var dialogCustomField = this.callfc.openSide(
  //           PopupAddCustomFieldComponent,
  //           [this.fieldCrr, 'edit', titleAction],
  //           option
  //         );
  //         dialogCustomField.closed.subscribe((e) => {
  //           if (e && e.event != null) {
  //             //xu ly data đổ về
  //             this.fieldCrr = e.event;

  //             this.stepList.forEach((obj) => {
  //               if (obj.recID == this.fieldCrr.stepID) {
  //                 let index = obj.fields.findIndex(
  //                   (x) => x.recID == this.fieldCrr.recID
  //                 );
  //                 if (index != -1) {
  //                   obj.fields[index] = this.fieldCrr;
  //                 }
  //               }
  //             });
  //             this.changeDetectorRef.detectChanges();
  //           }
  //         });
  //       });
  //   });
  // }


  //anh thao Code ne bao
  // em thay roi
  valueChangeCustom(e){

  }
}
