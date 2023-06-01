import { Component, OnInit, Injector } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { NoteDrawerComponent } from 'projects/codx-share/src/lib/layout/drawers/note-drawer/note-drawer.component';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss'],
})
export class LayoutPortalComponent extends LayoutBaseComponent {
  funcID: string = '';
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private callfc: CallFuncService,
    private cache: CacheService,
    private shareService: CodxShareService
  ) {
    super(inject);
    this.module = 'WP';
    this.layoutModel.asideFixed = false;
    this.layoutModel.asideTheme = 'transparent';
    this.layoutModel.asideMinimize = 'icon';
    this.layoutModel.toolbarDisplay = false;
  }

  onInit() {
    //Test bankhub dung xoa cua a huhu :((
    // let data = {"bankID":"1","sourceAccountNumber":"0001100012473007","payeeType":"ACCOUNT","amount":100000,"description":"TRANSFER AMOUNT TO","payeeAccountNumber":"0129837294","payeeCardNumber":"","bankCode":"970406"}
    // let internal = {"bankID":"1","sourceAccountNumber":"0001100012473007","amount":25000,"description":"chuyen tien","payeeAccountNumber":"0001100012475002"};
    let account = { bankID: '1' };
    // this.api
    //   .execSv('AC', 'Core', 'CMBusiness', 'SendRequestBankHubAsync', [
    //     account,
    //     'test',
    //   ])
    //   .subscribe((res) => {
    //     console.log(res);
    //   });
  }
  asideClick(evt: any) {
    if (evt.assemblyName == 'HCS') {
      evt.cancel = true;
      this.shareService.loginHCS().subscribe((token) => {
        this.cache.functionList(evt.funcId).subscribe((res) => {
          let url = `${res?.className}/verifytoken.aspx?tklid=${token}&returnUrl=${res?.url}`;
          if (url != '') {
            window.open(url, '_blank');
          }
        });
      });
    }
  }
  onAfterViewInit(): void {}
  openFormNoteDrawer() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.dialog = this.callfc.openSide(NoteDrawerComponent, '', option);
    this.dialog.closed.subscribe();
  }
}
