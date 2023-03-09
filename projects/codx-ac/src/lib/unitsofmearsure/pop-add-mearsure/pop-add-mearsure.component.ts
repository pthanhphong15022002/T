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
  RequestOption,
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
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  unitsofmearsure: UnitsOfMearsure;
  gridViewSetup: any;
  validate: any = 0;
  objectUmconversion: Array<UMConversion> = [];
  objectUmconversionDelete: Array<UMConversion> = [];
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'Description',
    },
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
    if (this.formType == 'edit') {
      if (this.unitsofmearsure.umid != null) {
        this.acService
          .loadData(
            'ERM.Business.BS',
            'UMConversionBusiness',
            'LoadDataAsync',
            [this.unitsofmearsure.umid]
          )
          .subscribe((res: any) => {
            this.objectUmconversion = res;
          });
      }
    }
    this.cache
      .gridViewSetup('UnitsOfMearsure', 'grvUnitsOfMearsureAC')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.unitsofmearsure[e.field] = e.data;
  }
  //#endregion

  //#region Function
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  openPopupConversion() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      var obj = {
        headerText: 'Thêm mới thông tin quy đổi',
        umid: this.unitsofmearsure.umid,
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
              500,
              400,
              '',
              obj,
              '',
              opt
            );
            dialogumconversion.closed.subscribe((x) => {
              var dataumconversiont = JSON.parse(
                localStorage.getItem('dataumconversion')
              );
              if (dataumconversiont != null) {
                this.objectUmconversion.push(dataumconversiont);
              }
              window.localStorage.removeItem('dataumconversion');
            });
          }
        });
    }
  }
  editobjectConversion(data: any) {
    let index = this.objectUmconversion.findIndex((x) => x.recID == data.recID);
    var obj = {
      headerText: 'Thêm mới thông tin quy đổi',
      data: { ...data },
      type: 'edit',
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
            500,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogumconversion.closed.subscribe((x) => {
            var dataumconversiont = JSON.parse(
              localStorage.getItem('dataumconversion')
            );
            if (dataumconversiont != null) {
              this.objectUmconversion[index] = dataumconversiont;
            }
            window.localStorage.removeItem('dataumconversion');
          });
        }
      });
  }
  deleteobjectConversion(data: any) {
    let index = this.objectUmconversion.findIndex((x) => x.recID == data.recID);
    this.objectUmconversion.splice(index, 1);
    this.objectUmconversionDelete.push(data);
    this.notification.notifyCode('SYS008', 0, '');
  }
  clearUnitsofmearsure() {
    this.form.formGroup.reset();
    this.objectUmconversion = [];
    this.objectUmconversionDelete = [];
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.unitsofmearsure);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.unitsofmearsure[keymodel[i]] == null ||
              this.unitsofmearsure[keymodel[i]] == ''
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'UnitsOfMearsureBusiness';
            opt.assemblyName = 'BS';
            opt.service = 'BS';
            opt.data = [this.unitsofmearsure];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData(
                  'ERM.Business.BS',
                  'UMConversionBusiness',
                  'AddAsync',
                  [this.objectUmconversion]
                )
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            }else {
              this.notification.notifyCode(
                'SYS031',
                0,
                '"' + this.unitsofmearsure.umid + '"'
              );
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'UnitsOfMearsureBusiness';
            opt.assemblyName = 'BS';
            opt.service = 'BS';
            opt.data = [this.unitsofmearsure];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.acService
                .addData(
                  'ERM.Business.BS',
                  'UMConversionBusiness',
                  'UpdateAsync',
                  [this.objectUmconversion, this.objectUmconversionDelete]
                )
                .subscribe((res: []) => {});
            }
            this.dialog.close();
            this.dt.detectChanges();
          });
      }
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'UnitsOfMearsureBusiness';
          opt.assemblyName = 'BS';
          opt.service = 'BS';
          opt.data = [this.unitsofmearsure];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData('ERM.Business.BS', 'UMConversionBusiness', 'AddAsync', [
                this.objectUmconversion,
              ])
              .subscribe((res) => {
                if (res) {
                  this.clearUnitsofmearsure();
                  this.dialog.dataService.addNew().subscribe((res) => {
                    this.form.formGroup.patchValue(res);
                    this.unitsofmearsure =
                      this.dialog.dataService!.dataSelected;
                  });
                }
              });
          }else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.unitsofmearsure.umid + '"'
            );
            return;
          }
        });
    }
  }
  //#endregion
}
