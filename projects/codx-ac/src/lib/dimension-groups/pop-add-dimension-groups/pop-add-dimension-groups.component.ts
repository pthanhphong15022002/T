import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  FormModel,
  DialogRef,
  CacheService,
  CallFuncService,
  NotificationsService,
  DialogData,
  RequestOption,
  DialogModel,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { DimensionControl } from '../../models/DimensionControl.model';
import { DimensionGroups } from '../../models/DimensionGroups.model';
import { DimensionSetup } from '../../models/DimensionSetup.model';
import { PopAddDimensionSetupComponent } from '../pop-add-dimension-setup/pop-add-dimension-setup.component';

@Component({
  selector: 'lib-pop-add-dimension-groups',
  templateUrl: './pop-add-dimension-groups.component.html',
  styleUrls: ['./pop-add-dimension-groups.component.css'],
})
export class PopAddDimensionGroupsComponent
  extends UIComponent
  implements OnInit
{
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  gridViewSetup: any;
  formType: any;
  validate: any = 0;
  openPop:any = false;
  dimensionGroups: DimensionGroups;
  dimensionSetup: DimensionSetup;
  objectDimensionSetup: Array<DimensionSetup> = [];
  objectDimensionControl: Array<DimensionControl> = [];
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
    this.dimensionGroups = dialog.dataService!.dataSelected;
    if (this.formType == 'edit') {
      if (this.dimensionGroups.dimGroupID != null) {
        this.acService
          .loadData(
            'ERM.Business.IV',
            'DimensionSetupBusiness',
            'LoadDataAsync',
            [this.dimensionGroups.dimGroupID]
          )
          .subscribe((res: any) => {
            this.objectDimensionSetup = res;
          });
        this.acService
          .loadData(
            'ERM.Business.IV',
            'DimensionControlBusiness',
            'LoadDataAsync',
            [this.dimensionGroups.dimGroupID]
          )
          .subscribe((res: any) => {
            this.objectDimensionControl = res;
          });
      }
    }
    this.cache
      .gridViewSetup('DimensionGroups', 'grvDimensionGroups')
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
    this.dimensionGroups[e.field] = e.data;
  }
  openPopupSetup(hearder: any, type: any) {
    let index = this.objectDimensionSetup.findIndex((x) => x.dimType == type);
    if (index == -1) {
      this.dimensionSetup = null;
    } else {
      this.dimensionSetup = this.objectDimensionSetup[index];
    }
    var obj = {
      headerText: 'Thiết lập kiểm soát ' + this.gridViewSetup[hearder].headerText,
      type: type,
      data: this.dimensionSetup,
      dataControl: this.objectDimensionControl,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'DimensionSetup';
    dataModel.gridViewName = 'grvDimensionSetup';
    dataModel.entityName = 'IV_DimensionSetup';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('DimensionSetup', 'grvDimensionSetup')
      .subscribe((res) => {
        if (res) {
          var dialog = this.callfc.openForm(
            PopAddDimensionSetupComponent,
            '',
            550,
            900,
            '',
            obj,
            '',
            opt
          );
          dialog.closed.subscribe((x) => {
            var datadimensionSetup = JSON.parse(
              localStorage.getItem('datadimensionSetup')
            );
            var datadimensionControl = JSON.parse(
              localStorage.getItem('datadimensionControl')
            );
            var type = JSON.parse(localStorage.getItem('type'));
            if (datadimensionSetup != null) {
              let index = this.objectDimensionSetup.findIndex(
                (x) => x.dimType == datadimensionSetup.dimType
              );
              if (index == -1) {
                this.objectDimensionSetup.push(datadimensionSetup);
              } else {
                this.objectDimensionSetup[index] = datadimensionSetup;
              }
            }
            if (datadimensionControl != null) {
              if (this.objectDimensionControl.length > 0) {
                for (
                  let index = 0;
                  index < this.objectDimensionControl.length;
                  index++
                ) {
                  if (this.objectDimensionControl[index].dimType == type) {
                    this.objectDimensionControl.splice(index, 1);
                    index--;
                  }
                }
                datadimensionControl.forEach((element) => {
                  this.objectDimensionControl.push(element);
                });
              } else {
                datadimensionControl.forEach((element) => {
                  this.objectDimensionControl.push(element);
                });
              }
            }
            window.localStorage.removeItem('datadimensionSetup');
            window.localStorage.removeItem('datadimensionControl');
          });
        }
      });
  }
  //#endregion

  //#region Function
  clearDimensionGroups() {
    this.form.formGroup.reset();
    this.objectDimensionSetup = [];
    this.objectDimensionControl = [];
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.dimensionGroups);
    var reWhiteSpace = new RegExp("/^\s+$/");
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.dimensionGroups[keymodel[i]] == null ||
              reWhiteSpace.test(this.dimensionGroups[keymodel[i]])
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
            opt.className = 'DimensionGroupsBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.dimensionGroups];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData(
                  'ERM.Business.IV',
                  'DimensionSetupBusiness',
                  'AddAsync',
                  [this.dimensionGroups.dimGroupID, this.objectDimensionSetup]
                )
                .subscribe((res: []) => {});
              this.acService
                .addData(
                  'ERM.Business.IV',
                  'DimensionControlBusiness',
                  'AddAsync',
                  [this.dimensionGroups.dimGroupID, this.objectDimensionControl]
                )
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            } else {
              this.notification.notifyCode(
                'SYS031',
                0,
                '"' + this.dimensionGroups.dimGroupID + '"'
              );
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'DimensionGroupsBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.dimensionGroups];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.acService
                .addData(
                  'ERM.Business.IV',
                  'DimensionSetupBusiness',
                  'UpdateAsync',
                  [this.dimensionGroups.dimGroupID, this.objectDimensionSetup]
                )
                .subscribe((res: []) => {});
              this.acService
                .addData(
                  'ERM.Business.IV',
                  'DimensionControlBusiness',
                  'UpdateAsync',
                  [this.dimensionGroups.dimGroupID, this.objectDimensionControl]
                )
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            } else {
              this.notification.notifyCode(
                'SYS031',
                0,
                '"' + this.dimensionGroups.dimGroupID + '"'
              );
              return;
            }
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
          opt.className = 'DimensionGroupsBusiness';
          opt.assemblyName = 'IV';
          opt.service = 'IV';
          opt.data = [this.dimensionGroups];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData(
                'ERM.Business.IV',
                'DimensionSetupBusiness',
                'AddAsync',
                [this.dimensionGroups.dimGroupID, this.objectDimensionSetup]
              )
              .subscribe((res) => {
                if (res) {
                  this.acService
                    .addData(
                      'ERM.Business.IV',
                      'DimensionControlBusiness',
                      'AddAsync',
                      [this.dimensionGroups.dimGroupID, this.objectDimensionControl]
                    )
                    .subscribe((res) => {
                      if (res) {
                        this.clearDimensionGroups();
                        this.dialog.dataService.clear();
                        this.dialog.dataService.addNew().subscribe((res) => {
                          this.dimensionGroups =
                            this.dialog.dataService!.dataSelected;
                        });
                      }
                    });
                }
              });
          }
        });
    }
  }
  //#endregion
}
