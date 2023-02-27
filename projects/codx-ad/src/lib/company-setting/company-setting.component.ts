import { PopupInfoComponent } from './popup-info/popup-info.component';
import { I } from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  AuthStore,
  CodxService,
  DialogModel,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  SidebarModel,
  UIComponent,
  UploadFile,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxAdService } from '../codx-ad.service';
import { AD_CompanySettings } from '../models/AD_CompanySettings.models';
import { PopupContactComponent } from './popup-contact/popup-contact.component';
import { PopupPersonalComponent } from './popup-personal/popup-personal.component';
import { LowerCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TN_OrderModule } from '../models/tmpModule.model';
import { PopupModuleDetailComponent } from './popup-module-detail/popup-module-detail.component';

@Component({
  selector: 'lib-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LowerCasePipe],
})
export class CompanySettingComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  funcID: any;
  moreFunc = [];
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('itemView') itemView: TemplateRef<any>;
  @ViewChild('leftMenu') leftMenu: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  items: any;
  views: Array<ViewModel> = [];
  data: AD_CompanySettings;
  // data: any;
  // data = new AD_CompanySettings();
  dialog!: DialogRef;
  minType = 'MinRange';
  memory: number;
  storage: number;
  curStorage: number;
  maxStorage: number;
  kbToGb = 1024 * 1024;
  inner = '';
  // image main logo
  check?: string;
  imageUpload: UploadFile = new UploadFile();
  imageLogo: any;
  //image: string = '';
  optionMainLogo: any = 'mainlogo';
  option: any = 'contact';

  // image mail header
  checkMain?: string;
  imageUploadMain: UploadFile = new UploadFile();
  public imageSrcMain: string = '';
  image: any;
  @ViewChild('input') redel: ElementRef;
  @Input() childProperty: any[];
  optionMailHeader: any = 'mailheader';
  tenant: any;
  vllL1449;
  setting;

  //bought modules
  lstModule: Array<TN_OrderModule> = [];
  lstInstalledModule: Array<TN_OrderModule> = [];
  lstNotInstallModule: Array<TN_OrderModule> = [];

  //order
  orderFormodel: FormModel;
  userID = '';
  grvTNOrders;

  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private adService: CodxAdService,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private notiService: NotificationsService,
    private authStore: AuthStore
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    var auth = authStore as any;
    this.tenant = auth.tenantStore?.activeTenant;
    this.userID = this.authStore.get()?.userID;
    this.cache.gridViewSetup('TNOrders', 'grvTNOrders').subscribe((res) => {
      if (res) {
        this.grvTNOrders = res;
        console.log(res);
      }
    });
    this.loadData();
  }

  onInit(): void {
    this.adService.getListFunction(this.funcID).subscribe((res) => {
      if (res) {
        this.moreFunc = res;
      }
    });
    this.cache.valueList('L1449').subscribe((res) => {
      this.vllL1449 = res?.datas;
    });
    this.adService.getTenantDefaultSetting().subscribe((res) => {
      this.setting = JSON.parse(res.dataValue);
    });
    this.adService
      .getLstBoughtModule()
      .subscribe((res: Array<TN_OrderModule>) => {
        if (res) {
          this.lstModule = res;
          this.lstModule.forEach((md) => {
            if (md.boughtModule.refID == null) {
              if (md.bought) {
                this.lstInstalledModule.push(md);
              } else {
                this.lstNotInstallModule.push(md);
              }
            }
          });
        }
      });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.templateRight,
        },
      },
    ];
    this.changeDetectorRef.detectChanges();
  }
  valueChange(e) {
    if (e.data) {
      var data = JSON.parse(JSON.stringify(this.data));
      data[e.field] = e.data;
      this.update(data);
    }
  }

  update(data) {
    this.adService
      .updateInformationCompanySettings(data, this.option)
      .subscribe((response) => {
        if (!response[0] && response[0].length == 0) {
          this.notiService.notifyCode('SYS021');
        }
      });
    this.changeDetectorRef.detectChanges();
  }

  clickEditInfo(data) {
    var dialog = this.callfc.openForm(
      PopupInfoComponent,
      '',
      650,
      300,
      '',
      data
    );
    dialog.closed.subscribe((res) => {
      if (res.event) {
        this.data.legalName = res.event?.legalName;
        this.data.taxCode = res.event?.taxCode;
      }
    });
    this.changeDetectorRef.detectChanges();
  }

  clickEditContact(data) {
    var dialog = this.callfc.openForm(
      PopupContactComponent,
      '',
      800,
      800,
      '',
      data
    );
    dialog.closed.subscribe((res) => {
      if (res.event[0]) {
        this.getURLEmbed(res.event[0].timeZone);
      }
    });
    this.changeDetectorRef.detectChanges();
  }

  clickEditPersonal(data) {
    let option = new DialogModel();
    option.DataService = this.view?.currentView?.dataService;
    option.FormModel = this.view?.currentView?.formModel;
    var dialog = this.callfc.openForm(
      PopupPersonalComponent,
      '',
      800,
      600,
      '',
      data,
      '',
      option
    );
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        this.data = e?.event;
        this.data.modifiedOn = new Date();
        this.view.dataService.update(this.data).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  loadData() {
    this.adService.getListCompanySettings().subscribe((response) => {
      if (response) {
        this.data = response;
        if (this.data.logoFull) {
          var bytes = this.base64ToArrayBuffer(this.data.logoFull);
          let blob = new Blob([bytes], { type: 'image/jpeg' });
          let url = window.URL.createObjectURL(blob);
          let image = this.sanitizer.bypassSecurityTrustUrl(url);
          this.image = image;
        }

        if (this.data.logo) {
          var bytes = this.base64ToArrayBuffer(this.data.logo);
          let blob = new Blob([bytes], { type: 'image/jpeg' });
          let url = window.URL.createObjectURL(blob);
          let image = this.sanitizer.bypassSecurityTrustUrl(url);
          this.imageLogo = image;
        }
        if (this.data.storage < 0) {
          this.maxStorage = Number(this.data.memory);
          this.cache.message('AD016').subscribe((res) => {
            this.inner = res.customName;
          });
        } else {
          this.cache.message('AD015').subscribe((res) => {
            this.maxStorage = Number(this.data.storage);
            this.inner = res.customName;
          });
        }
        this.curStorage = Number(this.data.memory);
        if (this.data.timeZone) this.getURLEmbed(this.data.timeZone);
        // this.data.companyCode.toString().toLowerCase();
        this.detectorRef.detectChanges();
      }
    });
  }

  formatBytes(kbytes) {
    let gb = (kbytes / this.kbToGb).toFixed(0);
    return gb;
  }

  innerHTML(memory, storage) {
    let me = (memory / this.kbToGb).toFixed(1);
    me = Number(me) < 1 ? memory + ' KB' : me + ' GB ';

    let sto = (storage / this.kbToGb).toFixed(1);
    sto = Number(sto) < 1 ? storage + ' KB' : sto + ' GB ';

    this.inner = this.inner.replace('{0}', me).replace('{1}', sto);

    return this.inner;
  }

  txtToLower(e: any) {
    this.data.companyCode = this.data.companyCode.toLowerCase();
  }

  changeMainLogo(event) {
    this.handleInputChange(event, this.optionMainLogo);
  }
  changeMainHeader(event) {
    this.handleInputChange(event, this.optionMailHeader);
  }

  async handleInputChange(event, optionCheck?: any) {
    if (event.target.files.length > 0) {
      var file: File = event.target.files[0];
      if (optionCheck == this.optionMainLogo) {
        this.data.logo = file.name;
        var reader = new FileReader();
        reader.onload = this._handleReaderLoadedMainLogo.bind(this);
      }
      if (optionCheck == this.optionMailHeader) {
        this.data.logoFull = file.name;
        var reader = new FileReader();
        reader.onload = this._handleReaderLoadedMailHeader.bind(this);
      }

      reader.readAsDataURL(file);
      let dataTest: ArrayBuffer;
      dataTest = await file.arrayBuffer();
      this.imageUpload.fileName = file.name;
      this.imageUpload.fileBytes = Array.from(new Uint8Array(dataTest));

      //  Save image main logo
      if (optionCheck == this.optionMainLogo) {
        this.data.logo = ''; // main logo
        this.adService
          .updateInformationCompanySettings(
            this.data,
            this.optionMainLogo,
            this.imageUpload
          )
          .subscribe();
      }

      //  Save image main logo
      if (optionCheck == this.optionMailHeader) {
        this.data.logoFull = ''; // header logo
        this.adService
          .updateInformationCompanySettings(
            this.data,
            this.optionMailHeader,
            this.imageUpload
          )
          .subscribe();
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  _handleReaderLoadedMailHeader(e) {
    let reader = e.target;
    this.image = reader.result;
  }

  _handleReaderLoadedMainLogo(e) {
    let reader = e.target;
    this.imageLogo = reader.result;
  }
  async handleInputChangeMain(event) {
    if (event.target.files.length > 0) {
      var file: File = event.target.files[0];
      this.data.logo = file.name;
      //  this.employee.path = File;sch
      // this.url.avatar = file.name;

      var pattern = /image-*/;
      var reader = new FileReader();
      if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
      }
      reader.onload = this._handleReaderLoadedMain.bind(this);
      reader.readAsDataURL(file);
      let data: ArrayBuffer;
      data = await file.arrayBuffer();
      this.check = file.name;
      this.imageUploadMain.fileName = file.name;
      this.imageUploadMain.fileBytes = Array.from(new Uint8Array(data));
      this.changeDetectorRef.detectChanges();
    }
  }
  _handleReaderLoadedMain(e) {
    let reader = e.target;
    this.imageSrcMain = reader.result;
  }

  base64ToArrayBuffer(base64: string) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  urlEmbedSafe: any;
  getURLEmbed(url) {
    if (url) {
      this.urlEmbedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.changeDetectorRef.detectChanges();
    }
  }

  openModuleDetail(module) {
    let data = {
      module: module,
      lstModule: this.lstModule,
      currency: this.setting?.CurrencyID,
      vllL1449: this.vllL1449,
      tenantID: this.tenant,
    };

    let popuMD = this.callfc.openForm(
      PopupModuleDetailComponent,
      '',
      900,
      900,
      this.funcID,
      data
    );
  }

  viewChanged(e) {
    console.log(e);
  }
}
