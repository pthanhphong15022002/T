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

  onInit(): void {}

  createMeeting() {
    if (!this.meetingUrl) {
      return axios
        .create({
          baseURL: environment.SureMeet.baseUrl,
        })
        .post(environment.SureMeet.tokenUrl, {
          client_id: environment.SureMeet.client_id,
          client_secret: environment.SureMeet.client_secret,
        })
        .then((res: any) => {
          let data = {
            app_id: environment.SureMeet.app_id,
            app_secret: environment.SureMeet.app_secret,
            meetingschedule_id: 0,
            meetingschedule_title: this.meetingTitle,
            meetingschedule_description: this.meetingDescription,
            meetingschedule_startdate: this.datePipe
              .transform(this.meetingStartDate, 'yyyy-MM-dd')
              .toString(),
            meetingschedule_starttime: this.meetingStartTime.toString(0),
            meetingschedule_duration: this.meetingDuration,
            meetingschedule_password: this.meetingPassword,
          };
          return axios
            .create({
              baseURL: environment.SureMeet.baseUrl,
            })
            .post(environment.SureMeet.addUpdateMeetingUrl, data)
            .then((meeting: any) => {
              this.meetingUrl = meeting.data.url;
              this.detectorRef.detectChanges();
              return meeting.data.url;
            })
            .catch((err: any) => {});
        })
        .catch((err: any) => {});
    }
    return this.meetingUrl;
  }

  async createAndMeetingNow() {
    let url = this.meetingUrl ?? (await this.createMeeting());
    return axios
      .create({
        baseURL: environment.SureMeet.baseUrl,
      })
      .post(environment.SureMeet.tokenUrl, {
        client_id: environment.SureMeet.client_id,
        client_secret: environment.SureMeet.client_secret,
      })
      .then((res: any) => {
        let data = {
          app_id: environment.SureMeet.app_id,
          app_secret: environment.SureMeet.app_secret,
          key: (url as string).split('/').reverse().at(0),
          password: null,
          name: this.userName,
          email: this.mail,
          manager: this.isManager == true ? 1 : 0,
        };
        axios
          .create({
            baseURL: environment.SureMeet.baseUrl,
          })
          .post(environment.SureMeet.connectMettingUrl, data)
          .then((connectData: any) => {
            if (connectData?.data?.url)
              window.open(connectData?.data?.url, '_blank');
            this.closeDialog(true);
          })
          .catch((err: any) => {});
      })
      .catch((err: any) => {});
  }

  closeDialog(isSave: boolean) {
    if (isSave) {
      this.data[0].onlineUrl = this.meetingUrl;
    }
    this.dialog.close();
  }
}
