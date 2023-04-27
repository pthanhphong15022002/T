import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import {
  Component,
  Injector,
  Input,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  UIComponent,
  DialogData,
  DialogRef,
} from 'codx-core';

import axios from 'axios';
@Component({
  selector: 'codx-meeting-online',
  templateUrl: './codx-meeting-online.component.html',
  styleUrls: ['./codx-meeting-online.component.scss'],
})
export class CodxMeetingOnlineComponent extends UIComponent {
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
  environment = {
    SureMeet: {
      baseUrl: 'https://api.suremeet.vn/',
      tokenUrl: 'api/auth/token',
      addUpdateMeetingUrl: 'PublicMeeting/AddUpdate',
      connectMettingUrl: 'PublicMeeting/Verify',
      client_id: 'portal',
      client_secret: 'lacviet@2022@$%!$$!(@',
      app_id: 'demo.suremeet@gmail.com',
      app_secret: '123456',
    },
  };
  data;
  dialogRef: DialogRef;
  formGroup?: FormGroup;
  constructor(
    injector: Injector,
    private datePipe: DatePipe,
    
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data;
    this.dialogRef = dialogRef;
  }

  baseUrl = '.\\assets\\themes\\ep\\default\\img\\';
  vllImgUrl = [];
  curHost;
  onInit(): void {
    this.cache.valueList('EP021').subscribe((res) => {
      this.vllImgUrl = res.datas;
      this.curHost = this.vllImgUrl[0];
    });
  }

  // createMeeting() {
  //   if (this.meetingUrl) {
  //     return this.meetingUrl;
  //   }
  //   this.codxMeetingOnlineService
  //     .createMeeting(
  //       this.meetingUrl,
  //       this.meetingTitle,
  //       this.meetingDescription,
  //       this.meetingStartDate,
  //       this.meetingStartTime,
  //       this.meetingDuration,
  //       this.meetingPassword
  //     )
  //     .subscribe((url) => {
  //       this.meetingUrl = url;
  //       this.detectorRef.detectChanges();
  //       return url;
  //     });
  // }
  
  createMeeting() {
    if (this.meetingUrl) {
      return this.meetingUrl;
    }
    this.createAMeeting(
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
  changeHost(imgUrl) {
    this.curHost = imgUrl;
  }
  urlChange(evt: any) {
    if (evt && evt?.data != null) {
      this.meetingUrl = evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  closeDialog(isSave: boolean) {
    if (isSave) {
      this.data[0].onlineUrl = this.meetingUrl;
      this.dialog.close(this.meetingUrl);
    } else {
      this.dialog.close();
    }
  }

  

  createAMeeting(
    meetingUrl,
    meetingTitle,
    meetingDescription,
    meetingStartDate,
    meetingStartTime,
    meetingDuration,
    meetingPassword
  ): Promise<string> {
    if (meetingUrl) {
      return meetingUrl;
    }
    return axios
      .create({
        baseURL: this.environment.SureMeet.baseUrl,
      })
      .post(this.environment.SureMeet.tokenUrl, {
        client_id: this.environment.SureMeet.client_id,
        client_secret: this.environment.SureMeet.client_secret,
      })
      .then(() => {
        let data = {
          app_id: this.environment.SureMeet.app_id,
          app_secret: this.environment.SureMeet.app_secret,
          meetingschedule_id: 0,
          meetingschedule_title: meetingTitle,
          meetingschedule_description: meetingDescription,
          meetingschedule_startdate: this.datePipe
            .transform(meetingStartDate, 'yyyy-MM-dd')
            .toString(),
          meetingschedule_starttime: meetingStartTime,
          meetingschedule_duration: meetingDuration,
          meetingschedule_password: meetingPassword,
        };

        return axios
          .create({
            baseURL: this.environment.SureMeet.baseUrl,
          })
          .post(this.environment.SureMeet.addUpdateMeetingUrl, data)
          .then((meeting: any) => {
            return meeting.data.url;
          })
          .catch(() => {});
      })
      .catch(() => {});
    return null;
  }

  async connectMeetingNow(
    meetingTitle: string,
    meetingDescription: string,
    meetingDuration: number,
    meetingPassword: string,
    userName: string,
    mail: string,
    isManager: boolean,
    meetingUrl?: string,
    meetingStartDate?: string,
    meetingStartTime?: string
  ) {
    meetingStartDate = meetingStartDate ?? new Date().toString();

    meetingStartDate = this.datePipe
      .transform(meetingStartDate, 'yyyy-MM-dd')
      .toString();

    meetingStartTime =
      meetingStartTime ??
      this.datePipe.transform(new Date().toString(), 'HH:mm');

    let url =
      meetingUrl ??
      (await this.createAMeeting(
        meetingUrl,
        meetingTitle,
        meetingDescription,
        meetingStartDate,
        meetingStartTime,
        meetingDuration,
        meetingPassword
      ).then((url) => {
        return url;
      }));

    return axios
      .create({
        baseURL: this.environment.SureMeet.baseUrl,
      })
      .post(this.environment.SureMeet.tokenUrl, {
        client_id: this.environment.SureMeet.client_id,
        client_secret: this.environment.SureMeet.client_secret,
      })
      .then(() => {
        let data = {
          app_id: this.environment.SureMeet.app_id,
          app_secret: this.environment.SureMeet.app_secret,
          key: (url as string).split('/').reverse().at(0),
          password: null,
          name: userName,
          email: mail,
          manager: isManager == true ? 1 : 0,
        };
        return axios
          .create({
            baseURL: this.environment.SureMeet.baseUrl,
          })
          .post(this.environment.SureMeet.connectMettingUrl, data)
          .then((connectData: any) => {
            if (connectData?.data?.url) {
              return connectData?.data?.url;
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }
}
