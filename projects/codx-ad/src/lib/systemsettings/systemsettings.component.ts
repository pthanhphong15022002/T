import { ChangeDetectorRef, Input } from '@angular/core';
import {
  UIComponent,
  AuthStore,
  ButtonModel,
  ViewModel,
  ViewType,
  DialogRef,
} from 'codx-core';
import {
  Component,
  OnInit,
  Injector,
  ViewChild,
  TemplateRef,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxAdService } from '../codx-ad.service';
import { AD_SystemSetting, TabControl } from '../models/AD_SystemSetting.models';

@Component({
  selector: 'lib-systemsettings',
  templateUrl: './systemsettings.component.html',
  styleUrls: ['./systemsettings.component.css'],
})
export class SystemsettingsComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  @Input() systemSetting = new AD_SystemSetting();
  @ViewChild('paneleft') paneleft: TemplateRef<any>;
  @ViewChild('itemView') itemView: TemplateRef<any>;
  @ViewChild('leftMenu') leftMenu: TemplateRef<any>;
  button?: ButtonModel;
  funcID: any;
  user: any;
  moreFunc = [];
  gridViewSetup: any;
  dialog!: DialogRef;
  tabControl: TabControl[] = [];
  name = '';
  private all = ['Thông tin chung', 'Chính sách bảo mật', 'Cấu hình ứng dụng'];
  active = 1;

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private activeRouter: ActivatedRoute,
    private adService: CodxAdService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.loadData();
    this.user = this.auth.get();
    this.funcID = this.activeRouter.snapshot.params['funcID'];
    this.dialog = dialog;
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        // this.add();
        break;
    }
  }

  onInit(): void {
    this.cache
      .gridViewSetup('SystemSetting', 'grvSystemSetting')
      .subscribe((res) => {
        if (res) this.gridViewSetup = res;
      });

    if (this.tabControl.length == 0) {
      this.all.forEach((res, index) => {
        var tabModel = new TabControl();
        tabModel.name = tabModel.textDefault = res;
        if (index == 1) tabModel.isActive = true;
        else tabModel.isActive = false;
        this.tabControl.push(tabModel);
      });
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabControl) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.paneleft,
        },
      },
    ];
  }

  //#region loadData
  loadData() {
    this.api
      .execSv<any>('SYS', 'AD', 'SystemSettingsBusiness', 'GetOneAsync')
      .subscribe((res) => {
        if (res) {
          this.systemSetting = res[0];
        }
      });
  }
  //#endregion

  //#region Functions
  changeView(evt: any) {
    var t = this;
  }

  selectedChange(val: any) {}

  readMore(dataItem) {
    //this.tableView.addHandler(dataItem, false, "taskGroupID");
  }
  //#endregion

  //#region layout

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  valueList(e){

  }
}
