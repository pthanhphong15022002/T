import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import axios from 'axios';
import {
  UIComponent,
  NotificationsService,
  AuthService,
  CacheService,
  ApiHttpService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxEpService } from '../codx-ep.service';

@Component({
  selector: 'lib-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingComponent extends UIComponent {
  @Input() dialog;
  @Input() meetingTitle;
  @Input() meetingDescription;
  @Input() meetingStartDate;
  @Input() meetingStartTime;
  @Input() meetingDuration = 60;
  @Input() meetingPassword = null;
  @Input() meetingUrl = null;
  @Input() userName;
  @Input() mail = null;
  @Input() isManager: boolean = false;

  data;
  dialogRef: DialogRef;
  formGroup?: FormGroup;
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private apiHttpService: ApiHttpService,
    private http: HttpClient,
    private datePipe: DatePipe,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data;
    this.dialogRef = dialogRef;
  }

  vllImgUrl = [];
  onInit(): void {
    this.cache.valueList('EP021').subscribe((res) => {
      console.log(res);

      this.vllImgUrl = res.datas;
    });
  }

  createMeeting() {
    if (this.meetingUrl) {
      return this.meetingUrl;
    }
    this.codxEpService
      .createMeeting(
        this.meetingUrl,
        this.meetingTitle,
        this.meetingDescription,
        this.meetingStartDate,
        this.meetingStartTime,
        this.meetingDuration,
        this.meetingPassword
      )
      .then((url) => {
        this.meetingUrl = url;
        this.detectorRef.detectChanges();
        return url;
      });
  }

  closeDialog(isSave: boolean) {
    if (isSave) {
      this.data[0].onlineUrl = this.meetingUrl;
    }
    this.dialog.close();
  }
}
