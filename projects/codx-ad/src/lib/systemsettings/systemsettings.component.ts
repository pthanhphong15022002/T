import { ChangeDetectorRef, Input } from '@angular/core';
import {
  UIComponent,
  AuthStore,
  ButtonModel,
  ViewModel,
  ViewType,
  DialogRef,
  Util,
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
import {
  AD_SystemSetting,
  SYS_FunctionList,
} from '../models/AD_SystemSetting.models';

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
  functionList: SYS_FunctionList[] = [];
  pwLifeDays = "";
  pwExpireWarning= "";
  pwDuplicate= "";
  blockSystem="";
  freezeInMinutes="";
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
          this.functionList = res[1];
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

  //#endregion

  valueList(e) {
    this.systemSetting[e.field] = e.data;
    if (e.field) {
      this.api
        .execSv('SYS', 'AD', 'SystemSettingsBusiness', 'UpdateSystemAsync', [
          this.systemSetting,
        ])
        .subscribe(res=>{
          if(res){
            console.log(res);
            this.systemSetting[e.field] = res[e.field];
          }
        });
    }
    this.cache.message('AD010').subscribe((mssg: any) => {
      if (mssg)
        this.pwLifeDays = Util.stringFormat(mssg.defaultName, '<b>' + this.systemSetting.pwLifeDays + '</b>');
    });
    this.cache.message('AD011').subscribe((mssg: any) => {
      if (mssg)
        this.pwExpireWarning = Util.stringFormat(mssg.defaultName, '<b>' + this.systemSetting.pwExpireWarning + '</b>');
    });
    this.cache.message('AD012').subscribe((mssg: any) => {
      if (mssg)
        this.pwDuplicate = Util.stringFormat(mssg.defaultName, '<b>' + this.systemSetting.pwDuplicate + '</b>');
    });
    this.cache.message('AD013').subscribe((mssg: any) => {
      if (mssg)
        this.blockSystem = Util.stringFormat(mssg.defaultName, '<b>' + this.systemSetting.blockSystem + '</b>');
    });
    this.cache.message('AD014').subscribe((mssg: any) => {
      if (mssg)
        this.freezeInMinutes = Util.stringFormat(mssg.defaultName, '<b>' + this.systemSetting.freezeInMinutes + '</b>');
    });
    console.log(e);

  }

  clickModule(e) {
    let mo = '';
    var url = '';
    if (e) {
      mo += e + 'S';
    }
    url += 'shared/settings/' + mo;
    this.codxService.navigate('', url);
  }
}
