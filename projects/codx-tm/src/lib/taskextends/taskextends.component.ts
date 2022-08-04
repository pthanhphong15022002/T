import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  DialogRef,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxTMService } from '../codx-tm.service';
import { PopupConfirmComponent } from '../tasks/popup-confirm/popup-confirm.component';

@Component({
  selector: 'lib-taskextends',
  templateUrl: './taskextends.component.html',
  styleUrls: ['./taskextends.component.css'],
})
export class TaskExtendsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  user: any;
  funcID: any;
  itemSelected: any;
  dialogExtendsStatus!: DialogRef;
  vllStatus = 'TM010';

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
          groupBy: 'fieldGroup',
        },
      },
    ];
  }

  selectedChange(e) {}
  requestEnded(e) {}

  //#region extends
  openExtendStatusPopup(moreFunc, data) {
    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
      vll: 'TM010',
      action: 'extend',
    };
    this.dialogExtendsStatus = this.callfc.openForm(
      PopupConfirmComponent,
      '',
      500,
      350,
      '',
      obj
    );
  }

  receiveMF(e: any) {
    this.clickMF(e.e, this.itemSelected);
  }

  clickMF(e, data) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'TMT04011':
      case 'TMT04012':
        this.openExtendStatusPopup(e.data, data);
        break;
    }
  }
}
