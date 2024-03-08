declare global {
  interface Window {
    ng: any;
  }
}
import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AuthService,
  AuthStore,
  LayoutService,
  NotificationsFCMService,
  NotificationsService,
  TenantService,
} from 'codx-core';
//import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
declare var window: any;

@Component({
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  //private angularFireMessaging: AngularFireMessaging;

  constructor(
    private router: Router,
    private tenant: TenantService,
    private layoutService: LayoutService,
    private titleService: Title,
    private authSV: AuthService
  ) {}

  ngOnInit() {
    if (environment.layout) {
      if (environment.layout.title)
        this.titleService.setTitle(environment.layout.title);
      else this.titleService.setTitle('CodxUI');
      if (environment.layout.icon)
        document
          .getElementById('appFavicon')
          .setAttribute('href', environment.layout.icon);
      else
        document
          .getElementById('appFavicon')
          .setAttribute('href', './assets/logos/favicon.ico');
    }
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

  ngAfterViewInit() {}
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    // sự kiện khi ấn nút back của trình duyệt
    this.closeDialog(event);
  }

  closeDialog(event) {
    var lstDialog = this.layoutService.listDialog;
    lstDialog.forEach((element) => {
      if (element && element.hide) element.hide();
    });
  }
}
