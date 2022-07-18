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
} from '@angular/core';

import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CodxService, DialogModel, DialogRef, SidebarModel, UIComponent, UploadFile, ViewModel, ViewType } from 'codx-core';
import { CodxAdService } from '../codx-ad.service';
import { AD_CompanySettings } from '../models/AD_CompanySettings.models';
import { PopupContactComponent } from './popup-contact/popup-contact.component';
import { PopupPersonalComponent } from './popup-personal/popup-personal.component';
import { LowerCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css'],
  providers: [LowerCasePipe]
})
export class CompanySettingComponent extends UIComponent implements OnInit, AfterViewInit {
  funcID: any;
  moreFunc = [];
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('itemView') itemView: TemplateRef<any>;
  @ViewChild('leftMenu') leftMenu: TemplateRef<any>;
  @ViewChild('paneleft') paneleft: TemplateRef<any>;
  items:any;
  option:any;
  views: Array<ViewModel> = [];
  data: AD_CompanySettings;
  // data = new AD_CompanySettings();
  dialog!: DialogRef;

  // image main logo
  check?: string
  imageUpload: UploadFile = new UploadFile();
  public imageSrc: string = '';
  optionMainLogo:any = 'mainlogo';

  // image mail header
  checkMain?: string
  imageUploadMain: UploadFile = new UploadFile();
  public imageSrcMain: string = '';
  @ViewChild('input') redel: ElementRef;
  @Input() childProperty: any[];
  optionMailHeader:any = 'mailheader';




  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private adService: CodxAdService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.adService.getListFunction(this.funcID).subscribe((res) => {
      if (res) {
        this.moreFunc = res;
        console.log(res);
      }
    });
    this.loadData();
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          // template: this.template,

          panelRightRef: this.paneleft,
        },
      },
    ];


  }
  valueChange(e) {

  }
  clickEditContact(data) {
    this.dialog = this.callfc.openForm(PopupContactComponent, "", 800, 800, "", data);
    this.changeDetectorRef.detectChanges();
  }

  clickEditPersonal(data) {
    this.dialog = this.callfc.openForm(PopupPersonalComponent, "", 800, 600, "", data);
    this.dialog.closed.subscribe(e => {
      if (e?.event) {
        this.data = e?.event
        this.detectorRef.detectChanges();
      }

    })
  }

  loadData() {
    this.adService.getListCompanySettings().subscribe((response) => {
      if (response) {
        this.data = response;
        // this.data.companyCode.toString().toLowerCase();
        this.detectorRef.detectChanges()
      }
    })
  }
  txtToLower(e: any) {
    this.data.companyCode = this.data.companyCode.toLowerCase();
  }


  async handleInputChange(event) {
    if (event.target.files.length > 0) {
      var file: File = event.target.files[0];
      this.data.Logo = file.name;
      var pattern = /image-*/;


      var reader = new FileReader();
      if (!file.type.match(pattern)) {
        alert('invalid format');
        return;
      }
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);
      let dataTest: ArrayBuffer;
      dataTest = await file.arrayBuffer();
      this.check = file.name;
      this.imageUpload.fileName = file.name;
      this.imageUpload.fileBytes = Array.from(new Uint8Array(dataTest));

      // Save image main logo
      // this.adService
      // .updateInformationCompanySettings(this.data,this.optionMailHeader,this.imageUpload)
      // .subscribe((response) => {
      // });

      this.api.execSv<any>("SYS", "AD", "CompanySettingsBusiness", "UpdateBusinessInformationAsync", [this.data,this.optionMailHeader,this.imageUpload])

      this.changeDetectorRef.detectChanges();

    }
  }
  _handleReaderLoaded(e) {
    let reader = e.target;
    this.imageSrc = reader.result;
  }


  async handleInputChangeMain(event) {
    if (event.target.files.length > 0) {
      var file: File = event.target.files[0];
      this.data.Logo = file.name;
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

}
