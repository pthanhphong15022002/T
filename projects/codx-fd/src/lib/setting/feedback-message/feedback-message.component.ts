import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsService, TenantStore, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'lib-feedback-message',
  templateUrl: './feedback-message.component.html',
  styleUrls: ['./feedback-message.component.css'],
})
export class FeedbackMessageComponent extends UIComponent implements OnInit {
  datafuntion = null;
  type = '';
  lstPattent = null;
  item = { PolicyControl: '' };
  isLockCoin = false;
  isLockDedicate = false;
  tenant: string;
  formName = 'FDParameters';
  gridViewName = 'grvFDParameters';
  views: Array<ViewModel> = [];

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  constructor(
    private fedsv: CodxFdService,
    private changedr: ChangeDetectorRef,
    private at: ActivatedRoute,
    private notificationsService: NotificationsService,
    private tenantStore: TenantStore,
    injector: Injector
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
  }
  onInit(): void {
    this.at.params.subscribe((params) => {
      if (params && params.funcID) {
        switch (params.funcID) {
          case 'FDS011':
            this.type = this.fedsv.type = '1';
            break;
          case 'FDS012':
            this.type = this.fedsv.type = '2';
            break;
          case 'FDS013':
            this.type = this.fedsv.type = '3';
            break;
          case 'FDS014':
            this.type = this.fedsv.type = '4';
            break;
          case 'FDS015':
            this.type = this.fedsv.type = '5';
            break;
          case 'FDS016':
            this.type = this.fedsv.type = '6';
            break;
          case 'FDS017':
            this.type = this.fedsv.type = '7';
            break;
        }
        this.api
          .call('ERM.Business.SYS', 'FunctionListBusiness', 'GetAsync', [
            '',
            params.funcID,
          ])
          .subscribe((res) => {
            if (res && res.msgBodyData[0]) {
              var data = res.msgBodyData[0] as [];
              this.datafuntion = data;
              this.changedr.detectChanges();
            }
          });
      }
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
        active: true,
        type: ViewType.content,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  redirectPage(page) {
    this.codxService.navigate('', 'fd/settings/FDS', {redirectPage: page});
  }

  onSaveCMParameter(objectUpdate) {
    // this.api
    //   .callSv(
    //     'SYS',
    //     'ERM.Business.SYS',
    //     'SettingValuesBusiness',
    //     'SaveParamsOfPolicyAsync',
    //     ['FDParameters', this.type, JSON.stringify(objectUpdate)]
    //   )
    //   .subscribe((res) => {
    //     if (res && res.msgBodyData.length > 0) {
    //       if (res.msgBodyData[0] === true) {
    //         this.changedr.detectChanges();
    //       }
    //     }
    //   });
  }
  changeLock(data) {
    this.isLockCoin = data.isLockCoin;
    this.isLockDedicate = data.isLockDedicate;
  }
  openCreate(): void {
    $('#create_card').addClass('offcanvas-on');
  }
  closeCreate(): void {
    $('#create_card').removeClass('offcanvas-on');
  }

  backLocation() {
    // this.location.back();
  }
}
