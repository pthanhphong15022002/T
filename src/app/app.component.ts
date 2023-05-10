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
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
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
  private angularFireMessaging: AngularFireMessaging;

  constructor(
    private router: Router,
    private tenant: TenantService,
    private layoutService: LayoutService,
    private titleService: Title,
    private authSV: AuthService
  ) {}

  ngOnInit() {
    debugger;
    if (environment.layoutCZ == 'qtsc') {
      this.titleService.setTitle('QTSC@oms');
      document
        .getElementById('appFavicon')
        .setAttribute('href', './assets/cz/qtsc/bg/favicon.ico');
    } else if (environment.layoutCZ == 'lacviet') {
      this.titleService.setTitle('QTSC@oms');
      document
        .getElementById('appFavicon')
        .setAttribute('href', './assets/cz/lacviet/bg/favicon.ico');
    } else {
      this.titleService.setTitle('CodxUI');
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
  // @HostListener('click', ['$event'])
  // activeBoxChat(event) {
  //   // sự kiện focus box chat trên màn hình
  //   let _boxChats = document.getElementsByTagName("codx-chat-box");
  //     if(_boxChats.length > 0){
  //       Array.from(_boxChats).forEach(e => {
  //         if(e.classList.contains("active")){
  //           e.classList.remove("active");
  //         }
  //       });

  //     }
  // }

  closeDialog(event) {
    // var over = document.querySelector('.e-sidebar-overlay');
    // if (over) over.remove();
    var lstDialog = this.layoutService.listDialog;
    lstDialog.forEach((element) => {
      // var a = element;
      if (element && element.hide) element.hide();
    });
    // this.layoutService.listDialog = [];
    // var dialogContain = document.querySelector('.codx-dialog-container');
    // dialogContain.innerHTML = '';
    // var dialog = document.querySelectorAll('.e-dialog');
    // if (dialog && dialog.length > 0) {
    //   dialog.forEach((box) => {
    //     if (box.tagName.toLowerCase() !== 'ejs-dialog') box = box.parentElement;
    //     box.remove();
    //   });
    // }
  }
}
