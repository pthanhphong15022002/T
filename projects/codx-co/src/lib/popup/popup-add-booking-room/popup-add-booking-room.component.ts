import { AfterViewInit, Component, Injector, Optional } from '@angular/core';
import {
  CRUDService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';

@Component({
  selector: 'co-popup-add-booking-room',
  templateUrl: './popup-add-booking-room.component.html',
  styleUrls: ['./popup-add-booking-room.component.scss'],
})
export class COPopupAddBookingRoomComponent
  extends UIComponent
  implements AfterViewInit
{
  title: string = '';
  tabInfo = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Người tham dự',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-settings_applications',
      text: 'Mở rộng',
      name: 'tabReminder',
    },
  ];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  listFilePermission: any[];
  formModel: FormModel;
  dialogRef: DialogRef;
  grView: any;
  data: any;
  startTime: string;
  endTime: string;
  isFullDay = false;
  onSaving = false;

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = { ...dialogData?.data[0] };
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  onInit(): void {
    this.getCacheData();
  }

  ngAfterViewInit(): void {}

  setTitle(e) {}

  getCacheData() {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
  }

  openPopupTemplate(item: any) {
    // let option = new DialogModel();
    // option.zIndex = 2000;
    // this.dialog1 = this.callfc.openForm(
    //   TemplateComponent,
    //   '',
    //   1200,
    //   700,
    //   '',
    //   item,
    //   '',
    //   option
    // );
    // this.dialog1.closed.subscribe((e) => {
    //   if (e?.event) {
    //     this.meeting.templateID = e.event;
    //     if (this.meeting.templateID) {
    //       this.api
    //         .execSv<any>(
    //           'CO',
    //           'CO',
    //           'MeetingTemplatesBusiness',
    //           'GetTemplateByMeetingAsync',
    //           this.meeting.templateID
    //         )
    //         .subscribe((res) => {
    //           if (res) {
    //             this.template = res;
    //             this.templateName = this.template.templateName;
    //           }
    //         });
    //     }
    //   }
    // });
  }

  valueDateChange(e) {}

  valueStartTimeChange(e) {}

  valueEndTimeChange(e) {}

  valueAllDayChange(e) {}

  valueChange(e) {}

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    let isAdd = true;
    option.methodName = 'SaveAsync';
    option.data = [];
    return true;
  }

  onSaveForm() {
    (this.dialogRef.dataService as CRUDService)
      .save((opt: any) => this.beforeSave(opt), 0, null, null, false)
      .subscribe((res: any) => {
        if (res.save || res.update) {
        } else {
          this.onSaving = false;
          return;
        }
      });
  }
}
