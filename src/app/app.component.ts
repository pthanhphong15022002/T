import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  NotificationsFCMService,
  NotificationsService,
  TenantService,
} from 'codx-core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Component({
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private angularFireMessaging: AngularFireMessaging;

  constructor(
    private router: Router,
    private tenant: TenantService,
    // private angularFireMessaging: AngularFireMessaging,
    private ns: NotificationsFCMService,
    private notify: NotificationsService
  ) {}

  ngOnInit() {
    this.unsubscribe.push(this.tenant.init(this.router));
    // this.angularFireMessaging.requestToken.subscribe(
    //   (token) => {
    //     environment.FCMToken = token;
    //     console.log(token);
    //   },
    //   (err) => {
    //     console.error('Unable to get permission to notify.', err);
    //   }
    // );

    // this.angularFireMessaging.messages.subscribe(
    //   (payload: any) => {
    //     console.log("new message received. ", payload);
    //     this.ns.get().subscribe(async res => {
    //       console.log('res: ',res)
    //       this.ns.changeData(res);
    //     });
    //     this.notify.notify(payload.notification.body);
    //   });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  @HostListener('window:load', ['$event'])
  hashChangeHandler(e) {
    this.closeDialog(); // close dialog khi back của browser
  }

  closeDialog() {
    var dialogContain = document.querySelector('.codx-dialog-container');
    dialogContain.innerHTML = '';
    var dialog = document.querySelectorAll('.e-dialog');
    dialog.forEach((box) => {
      if (box.tagName.toLowerCase() !== 'ejs-dialog') box = box.parentElement;
      box.remove();
    });
  }
}
