import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { UMConversion } from '../../models/UMConversion.model';
import { UnitsOfMearsure } from '../../models/UnitsOfMearsure.model';
import { PopAddConversionComponent } from '../pop-add-conversion/pop-add-conversion.component';

@Component({
  selector: 'lib-pop-add-mearsure',
  templateUrl: './pop-add-mearsure.component.html',
  styleUrls: ['./pop-add-mearsure.component.css'],
})
export class PopAddMearsureComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  unitsofmearsure: UnitsOfMearsure;
  gridViewSetup:any;
  umid:any;
  umName:any;
  objectUmconversion: Array<UMConversion> = [];
  tabInfo: any[] = [
    { 
      icon: 'icon-info', 
      text: 'Thông tin chung', 
      name: 'Description' },
    {
      icon: 'icon-playlist_add_check',
      text: 'Thông tin quy đổi',
      name: 'ConversionInformation',
    },
  ];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.unitsofmearsure = dialog.dataService!.dataSelected;
    this.umid = '';
    this.umName = '';
    this.cache.gridViewSetup('UnitsOfMearsure', 'grvUnitsOfMearsureAC').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  valueChange(e:any){
    this.unitsofmearsure[e.field] = e.data;
  }
  valueChangeUMID(e:any){
    this.umid = e.data;
    this.unitsofmearsure[e.field] = e.data;
  }
  valueChangeUMName(e:any){
    this.umName = e.data;
    this.unitsofmearsure[e.field] = e.data;
  }
  openPopupConversion(){
    if (this.umid.trim() == '' || this.umid == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['UMID'].headerText + '"'
      );
      return;
    }
    var obj = {
      headerText: 'Thêm mới thông tin quy đổi',
      umid:this.umid
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'UMConversion';
    dataModel.gridViewName = 'grvUMConversion';
    dataModel.entityName = 'BS_UMConversion';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('UMConversion', 'grvUMConversion')
      .subscribe((res) => {
        if (res) {
          var dialogumconversion = this.callfc.openForm(
            PopAddConversionComponent,
            '',
            400,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogumconversion.closed.subscribe((x) => {
            var dataumconversiont = JSON.parse(localStorage.getItem('dataumconversion'));
            if (dataumconversiont != null) {
              this.objectUmconversion.push(dataumconversiont);
            }
            window.localStorage.removeItem('dataumconversion');
          });
        }
      });
  }
  editobjectConversion(data:any){
    let index = this.objectUmconversion.findIndex(
      (x) => x.recID == data.recID
    );
    var obj = {
      headerText: 'Thêm mới thông tin quy đổi',
      data:{ ...data }
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'UMConversion';
    dataModel.gridViewName = 'grvUMConversion';
    dataModel.entityName = 'BS_UMConversion';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('UMConversion', 'grvUMConversion')
      .subscribe((res) => {
        if (res) {
          var dialogumconversion = this.callfc.openForm(
            PopAddConversionComponent,
            '',
            400,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogumconversion.closed.subscribe((x) => {
            var dataumconversiont = JSON.parse(localStorage.getItem('dataumconversion'));
            if (dataumconversiont != null) {
              this.objectUmconversion[index] = dataumconversiont;
            }
            window.localStorage.removeItem('dataumconversion');
          });
        }
      });
  }
  deleteobjectConversion(data:any){

  }
  onSave(){
    if (this.umid.trim() == '' || this.umid == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['UMID'].headerText + '"'
      );
      return;
    }
    if (this.umName.trim() == '' || this.umName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['UMName'].headerText + '"'
      );
      return;
    }
  }
}
