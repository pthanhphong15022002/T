import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CodxService, DialogModel, DialogRef, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxAdService } from '../codx-ad.service';
import { AD_CompanySettings } from '../models/AD_CompanySettings.models';
import { PopupContactComponent } from './popup-contact/popup-contact.component';
import { PopupPersonalComponent } from './popup-personal/popup-personal.component';

@Component({
  selector: 'lib-company-setting',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.css'],
})
export class CompanySettingComponent extends UIComponent implements OnInit {
  funcID: any;
  moreFunc = [];
  @ViewChild('itemView') itemView: TemplateRef<any>;
  @ViewChild('leftMenu') leftMenu: TemplateRef<any>;
  @ViewChild('paneleft') paneleft: TemplateRef<any>;

  views: Array<ViewModel> = [];
  data: AD_CompanySettings;
 // data = new AD_CompanySettings();
  dialog!: DialogRef;
  constructor(
    private inject: Injector,
    private activedRouter: ActivatedRoute,
    private adService: CodxAdService,
    private codxService: CodxService,
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
          panelRightRef: this.paneleft,
        },
      },
     ];


  }
  valueChange(e){

  }
  clickEditContact(data) {
  this.dialog = this.callfc.openForm(PopupContactComponent, "", 800, 800, "",data);
  this.changeDetectorRef.detectChanges();
  }

  clickEditPersonal(data) {
    this.dialog = this.callfc.openForm(PopupPersonalComponent, "", 800, 600, "",data);
    this.dialog.closed.subscribe(e => {
      if(e?.event){
        this.data = e?.event
        this.detectorRef.detectChanges() ;
      }
    
    })}
 
  // clickEditPersonal(data: any) {
  //   var obj = {
  //     post: data,
  //     title: "Chia sẻ bài viết"
  //   }
  //   this.changeDetectorRef.detectChanges()
  //   let option = new DialogModel();
  //   option.DataService = this.listview.dataService as CRUDService;
  //   option.FormModel = this.listview.formModel;
  //   this.modal = this.callfc.openForm(PopupPersonalComponent, "", 600, 600, "", obj, '', option);
  //   this.modal.closed.subscribe();
  // }

  loadData() {
    this.adService.getListCompanySettings().subscribe((response) => {
      if (response) {
        this.data = response;
        this.detectorRef.detectChanges()
      }
      else {
        console.log('khong duoc');
      }
    })
  }

  // loadData(dataItem?) {
  //   // console.log(dataItem);
  //   // this.data = dataItem;
  //   // console.log(this.data);
  //   console.log('test12334');
  // }
}
