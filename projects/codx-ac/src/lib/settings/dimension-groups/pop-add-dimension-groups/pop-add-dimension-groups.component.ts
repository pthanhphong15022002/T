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
import { PopAddDimensionSetupComponent } from '../pop-add-dimension-setup/pop-add-dimension-setup.component';
import { DimensionSetup } from '../../../models/DimensionSetup.model';
import { DimensionGroups } from '../../../models/DimensionGroups.model';
import { DimensionControl } from '../../../models/DimensionControl.model';
import { CodxAcService } from '../../../codx-ac.service';

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
  keyField: any = '';
  openPop: any = false;
  dimensionGroups: DimensionGroups;
  dimensionSetup: DimensionSetup;
  objectDimensionSetup: Array<DimensionSetup> = [];
  objectDimensionControl: Array<DimensionControl> = [];
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.dimensionGroups = dialog.dataService!.dataSelected;
    this.keyField = dialog.dataService!.keyField;
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
      .gridViewSetup('DimGroups', 'grvDimGroups')
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
      headerText:
        'Thiết lập kiểm soát ' + this.gridViewSetup[hearder].headerText,
      type: type,
      data: this.dimensionSetup,
      dataControl: this.objectDimensionControl,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'DimSetup';
    dataModel.gridViewName = 'grvDimSetup';
    dataModel.entityName = 'IV_DimSetup';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('DimSetup', 'grvDimSetup')
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
          dialog.closed.subscribe(() => {
            var datadimensionSetup = JSON.parse(
              localStorage.getItem('datadimensionSetup')
            );
            var datadimensionControl = JSON.parse(
              localStorage.getItem('datadimensionControl')
            );
            var type = JSON.parse(localStorage.getItem('type'));
            if (datadimensionSetup != null) {
              switch(type)
              {
                case '0':
                case '1':
                case '2':
                case '3':
                  datadimensionSetup.dimCategory = '1';
                  break;
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                  datadimensionSetup.dimCategory = '2';
                  break;
              }
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

    //Note
    let ignoredFields: string[] = [];
    if(this.keyField == 'DimGroupID')
    {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Note

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.dimensionGroups);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if(ignoredFields.includes(keygrid[index].toLowerCase()))
        {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.dimensionGroups[keymodel[i]] == null ||
              String(this.dimensionGroups[keymodel[i]]).match(/^ *$/) !== null
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
            if(this.keyField == 'DimGroupID')
            {
              this.dimensionGroups.dimGroupID = res.save.dimGroupID;
            }
            this.acService
              .addData(
                'ERM.Business.IV',
                'DimensionSetupBusiness',
                'AddAsync',
                [this.dimensionGroups.dimGroupID, this.objectDimensionSetup]
              )
              .subscribe(() => {});
            this.acService
              .addData(
                'ERM.Business.IV',
                'DimensionControlBusiness',
                'AddAsync',
                [this.dimensionGroups.dimGroupID, this.objectDimensionControl]
              )
              .subscribe(() => {});
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
                .subscribe(() => {});
              this.acService
                .addData(
                  'ERM.Business.IV',
                  'DimensionControlBusiness',
                  'UpdateAsync',
                  [this.dimensionGroups.dimGroupID, this.objectDimensionControl]
                )
                .subscribe(() => {});
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
          if(this.keyField == 'DimGroupID')
          {
            this.dimensionGroups.dimGroupID = res.save.dimGroupID;
          }
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
                    [
                      this.dimensionGroups.dimGroupID,
                      this.objectDimensionControl,
                    ]
                  )
                  .subscribe((res) => {
                    if (res) {
                      this.clearDimensionGroups();
                      this.dialog.dataService.clear();
                      this.dialog.dataService.addNew().subscribe(() => {
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
