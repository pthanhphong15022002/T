import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  Type,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormScheduleComponent,
  DataRequest,
  DataService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  SidebarModel,
  Util,
} from 'codx-core';
//import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';
//import { PopupAddEmailTemplateComponent } from 'projects/codx-es/src/lib/setting/approval-step/popup-add-email-template/popup-add-email-template.component';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';
import { CodxApproveStepsComponent } from '../../codx-approve-steps/codx-approve-steps.component';
import { CodxEmailComponent } from '../../codx-email/codx-email.component';
import { MultiSelectPopupComponent } from 'projects/codx-ac/src/lib/journals/multi-select-popup/multi-select-popup.component';
@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatagoryComponent implements OnInit {
  private components = {
    cpnAutoNumbers: PopupAddAutoNumberComponent,
    cpnAlertRules: CodxEmailComponent,
    cpnApprovals: CodxApproveStepsComponent,
    cpnCategories: PopupAddCategoryComponent,
    cpnScheduledTasks: CodxFormScheduleComponent,
    MultiSelectPopupComponent: MultiSelectPopupComponent,
  };
  category = '';
  title = '';
  //listName = 'SYS001';
  settingFull = [];
  setting = [];
  settingValue = [];
  groupSetting = [];
  alertRules = [];
  schedules = [];
  categories = [];
  function: any = {};
  valuelist: any = {};
  dataValue: any = {};
  catagoryName: any = '';
  lstFuncID: any[] = [];
  autoDefault?: any;
  dialog?: DialogRef;
  oldSettingFull = [];
  oldDataValue: any = {};
  //labels
  labels = [];
  isOpenSub: boolean = false;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private cache: CacheService,
    private inject: Injector,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    if (data) {
      this.settingFull = (data.data?.settingFull as []) || [];

      this.setting =
        this.settingFull.filter((res) => res.isVisible == true) || [];
      this.valuelist = data.data?.valuelist;
      this.category = data.data?.category;
      this.function = data.data?.function;

      //this.loadSettingValue();
    }
  }

  ngOnInit(): void {
    if (this.dialog) {
      this.dialog.closed.subscribe((res) => {
        this.dialog = null;
      });
    } else {
      this.lstFuncID = [];
      this.autoDefault = null;
      this.dataValue = {};
      // this.setting = this.setting.filter((x) => {
      //   return (
      //     x.refLineID == '41a778ab-71cc-ed11-94a1-00155d035517' ||
      //     x.recID == '41a778ab-71cc-ed11-94a1-00155d035517'
      //   );
      // });
      if (this.setting) {
        this.groupSetting = this.setting.filter((x) => {
          return (
            x.controlType && x.controlType.toLowerCase() === 'groupcontrol'
          );
        });
        if (this.groupSetting.length > 0) {
          var lstNoGroup = this.setting.filter((x) => {
            return (
              ((x.controlType &&
                x.controlType.toLowerCase() !== 'groupcontrol') ||
                !x.controlType) &&
              !x.refLineID
            );
          });
          if (lstNoGroup.length > 0) {
            var objGroupTMP: any = {
              recID: '',
              refLineID: '',
              controlType: 'GroupControl',
            };
            this.groupSetting.splice(0, 0, objGroupTMP);
          }
        }
      }
      if (this.valuelist && this.valuelist.datas && this.category) {
        const ds = (this.valuelist.datas as any[]).find(
          (item) => item.value == this.category
        );
        this.title = ds.text;
        if (this.category === '2' || this.category === '7')
          this.getIDAutoNumber();
        //else if (this.category === '4') this.getCategories();
        else if (this.category === '5') this.getAlertRule();
        else if (this.category === '6') this.getSchedules();
      }
      this.changeDetectorRef.detectChanges();
    }
    this.loadSettingValue();

    //labels
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByPredicate',
        ['FormName=@0 and Category=@1', 'ESParameters;1']
      )
      .subscribe((setting: any) => {
        if (setting) {
          let format = JSON.parse(setting?.dataValue);
          console.log('func', this.function);

          // this.cacheService.functionList(this.lstFuncID)
          this.labels = format?.Label?.filter((label) => {
            return label.Language == this.function?.language;
          });

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  openPopup(evt: any, item: any, reference: string = '') {
    let value = item.fieldName,
      recID = item.recID;
    if (!reference) reference = item.reference;
    var width = 0,
      height = 0,
      title = '',
      funcID = '',
      data = {},
      cssClass = '',
      dialogModel = new DialogModel();
    if (!reference) {
      var itemChild = this.settingFull.filter(
        (x) => x.refLineID === recID && x.lineType === '2'
      );
      data['settingFull'] = itemChild;
      data['valuelist'] = this.valuelist;
      //data['settingValue'] = this.settingValue;
      data['category'] = this.category;
      data['function'] = this.function;
      width = 500;
      height = 100 * itemChild.length;

      this.callfc.openForm(
        CatagoryComponent,
        title,
        width,
        height,
        funcID,
        data,
        cssClass,
        dialogModel
      );
    } else {
      var component = this.components[reference] as Type<any>;
      switch (reference.toLowerCase()) {
        case 'cpnautonumbers':
          if (
            this.autoDefault &&
            this.autoDefault[value] &&
            !this.autoDefault[value].stop
          ) {
            this.api
              .execSv(
                'SYS',
                'ERM.Business.AD',
                'AutoNumberDefaultsBusiness',
                'GetByFuncNEntityAsync',
                [value]
              )
              .subscribe((res: any) => {
                if (res) {
                  data['autoNoCode'] = res.autoNumber;
                  data['functionID'] = res.functionID;
                  width = screen.width;
                  height = screen.height;
                  dialogModel.IsFull = true;
                  this.callfc.openForm(
                    component,
                    title,
                    width,
                    height,
                    funcID,
                    data,
                    cssClass,
                    dialogModel
                  );
                }
              });
          }
          break;
        case 'cpncalendar':
          break;
        case 'cpnalertrules':
          var rule = this.alertRules[value];
          if (!rule) return;
          data['formGroup'] = null;
          data['templateID'] = rule.emailTemplate;
          // data['showIsTemplate'] = null;
          // data['showIsPublish'] = null;
          // data['showSendLater'] = null;

          this.callfc.openForm(
            component,
            '',
            800,
            screen.height,
            '',
            data,
            '',
            dialogModel
          );
          break;
          // var rule = this.alertRules[value];
          // if (!rule) return;
          data['transID'] = null;
          // data['templateID'] = rule.emailTemplate;
          this.callfc.openForm(
            component,
            '',
            screen.width,
            screen.height,
            '',
            data,
            '',
            dialogModel
          );
          break;
        case 'cpnapprovals':
          let dtvalue = this.dataValue[item.transType].find(
            (x) => x.FieldName == value
          );
          if (dtvalue.ApprovalRule == '0') return;
          dialogModel.IsFull = true;
          var category = this.categories[value];
          if (!category) return;
          data['transID'] = category.recID;
          data['type'] = '0';
          this.callfc.openForm(
            component,
            '',
            screen.width,
            screen.height,
            '',
            data,
            '',
            dialogModel
          );
          break;
        case 'cpncategories':
          var category = this.categories[value];
          if (!category) return;
          this.cache.functionList('ESS22').subscribe((func) => {
            //Function này tạm thời code chết chờ c Th tìm ra cách lấy sau
            if (!func || !func.gridViewName || !func.formName) return;
            this.cache.gridView(func.gridViewName).subscribe((gridview) => {
              this.cache
                .gridViewSetup(func.formName, func.gridViewName)
                .subscribe((grvSetup) => {
                  var formModel = new FormModel();
                  formModel.gridViewName = func.gridViewName;
                  formModel.formName = func.formName;
                  formModel.entityPer = func.entityName;
                  formModel.currentData = category;
                  var dataService = new DataService(this.inject);
                  dataService.dataSelected = category;
                  let option = new SidebarModel();
                  option.Width = '550px';
                  option.DataService = dataService;
                  option.FormModel = formModel;
                  let popupAdd = this.callfc.openSide(
                    PopupAddCategoryComponent,
                    {
                      data: category,
                      isAdd: false,
                      headerText: /*"Sửa" + ' ' +*/ func?.customName ?? '',
                    },
                    option
                  );
                });
            });
          });

          break;
        case 'cpnscheduledtasks':
          var schedule = this.schedules[value];
          var id = null;
          if (schedule) id = schedule.recID;
          if (schedule && schedule.stop) return;

          // data['formGroup'] = null;
          // data['templateID'] = rule.emailTemplate;
          this.callfc.openForm(
            component,
            '',
            800,
            screen.height,
            '',
            id,
            '',
            dialogModel
          );
          break;
        case 'multiselectpopupcomponent':
          var dataValue = this.dataValue[item.transType];
          if (dataValue) {
            var dim = dataValue[value];
            this.callfc
              .openForm(
                MultiSelectPopupComponent,
                '',
                400,
                500,
                '',
                {
                  selectedOptions: dim,
                  showAll: true,
                },
                '',
                dialogModel
              )
              .closed.subscribe(({ event }) => {
                if (event == null) {
                  return;
                }

                dataValue[value] = event;
                var dt = this.settingValue.find(
                  (x) =>
                    x.category == this.category && x.transType == item.transType
                );
                if (dt) {
                  dt.dataValue = JSON.stringify(dataValue);
                  this.api
                    .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
                    .subscribe((res) => {
                      this.changeDetectorRef.detectChanges();
                      console.log(res);
                    });
                }
                console.log(event);
              });
          }

          break;
        default:
          break;
      }
    }
  }

  openSub(evt: any, recID: string, dataValue: any) {
    this.isOpenSub = true;
    this.oldSettingFull = JSON.parse(JSON.stringify(this.settingFull));
    this.oldDataValue = JSON.parse(JSON.stringify(this.dataValue));
    this.settingFull =
      this.settingFull.filter(
        (x) => x.refLineID === recID && x.lineType === '2'
      ) || [];
    this.setting =
      this.settingFull.filter((res) => res.isVisible == true) || [];
    this.dataValue = dataValue;
    this.groupSetting = this.setting.filter((x) => {
      return x.controlType && x.controlType.toLowerCase() === 'groupcontrol';
    });
    if (this.groupSetting.length > 0) {
      var lstNoGroup = this.setting.filter((x) => {
        return (
          ((x.controlType && x.controlType.toLowerCase() !== 'groupcontrol') ||
            !x.controlType) &&
          !x.refLineID
        );
      });
      if (lstNoGroup.length > 0) {
        var objGroupTMP: any = {
          recID: '',
          refLineID: '',
          controlType: 'GroupControl',
        };
        this.groupSetting.splice(0, 0, objGroupTMP);
      }
    }
    if (this.category === '2' || this.category === '7') this.getIDAutoNumber();
    else if (this.category === '5') this.getAlertRule();
    else if (this.category === '6') this.getSchedules();
    this.changeDetectorRef.detectChanges;
  }

  backSub(evt: any) {
    this.isOpenSub = false;
    evt.preventDefault();
    this.dataValue = JSON.parse(JSON.stringify(this.oldDataValue));
    this.settingFull = JSON.parse(JSON.stringify(this.oldSettingFull));

    this.setting =
      this.settingFull.filter((res) => res.isVisible == true) || [];
    this.groupSetting = this.setting.filter((x) => {
      return x.controlType && x.controlType.toLowerCase() === 'groupcontrol';
    });
    if (this.groupSetting.length > 0) {
      var lstNoGroup = this.setting.filter((x) => {
        return (
          ((x.controlType && x.controlType.toLowerCase() !== 'groupcontrol') ||
            !x.controlType) &&
          !x.refLineID
        );
      });
      if (lstNoGroup.length > 0) {
        var objGroupTMP: any = {
          recID: '',
          refLineID: '',
          controlType: 'GroupControl',
        };
        this.groupSetting.splice(0, 0, objGroupTMP);
      }
    }
    this.oldSettingFull = [];
    this.oldDataValue = {};
    if (this.category === '2' || this.category === '7') this.getIDAutoNumber();
    else if (this.category === '5') this.getAlertRule();
    else if (this.category === '6') this.getSchedules();
    this.changeDetectorRef.detectChanges;
  }

  collapseItem(evt: any, setting: any) {
    let recID = setting.recID;
    let fName = setting.fieldName;
    let transType = setting.transType;
    if (
      (this.dataValue[transType][fName] != '1' ||
        !this.dataValue[transType][fName]) &&
      evt != null
    )
      return;
    var eleItem = document.querySelectorAll(
      '.list-item[data-group="' + recID + '"]'
    );
    if (eleItem && eleItem.length > 0) {
      eleItem.forEach((element) => {
        var ele = element as HTMLElement;
        var classlist = ele.classList;
        if (evt != null) {
          if (classlist.contains('d-none')) classlist.remove('d-none');
          else classlist.add('d-none');
        } else {
          if (this.dataValue[fName] != '1' || !this.dataValue[fName]) {
            classlist.add('d-none');
          } else {
            classlist.remove('d-none');
          }
        }
      });
    }
    var btn = document.querySelector(
      '.button-collapse[data-id="' + recID + '"]'
    ) as HTMLElement;
    if (btn) {
      if (btn.classList.contains('icon-keyboard_arrow_right')) {
        btn.classList.remove('icon-keyboard_arrow_right');
        btn.classList.add('icon-keyboard_arrow_down');
      } else {
        btn.classList.remove('icon-keyboard_arrow_down');
        btn.classList.add('icon-keyboard_arrow_right');
      }
    }
  }

  loadSettingValue() {
    this.api
      .execSv<any>(
        'SYS',
        'SYS',
        'SettingValuesBusiness',
        'GetListValueBySettingAsync',
        [this.function?.formName, this.category, this.lstFuncID]
      )
      .subscribe((res) => {
        if (res) {
          if (res.length > 1) {
            this.autoDefault = res[1];
          } else {
            this.settingValue = res[0];
            this.loadValue();
          }
        }
        this.changeDetectorRef.detectChanges();
      });
    if (this.category === '2' || this.category === '7') {
    }
  }

  loadValue() {
    switch (this.category) {
      case '1':
      case '4':
        if (this.settingValue.length > 0) {
          this.settingValue.forEach((element) => {
            var value = element.dataValue;
            if (value) {
              this.dataValue[element.transType] = JSON.parse(value);
            }
          });
          // var value = this.settingValue[0].dataValue;
          // if (value) {
          //   this.dataValue = JSON.parse(value);
          // }
          if (this.category == '4') {
            this.getCategories();
          }
        }
        break;
    }
  }

  getIDAutoNumber() {
    this.setting.forEach((item, i) => {
      if (this.category === '7') {
        this.lstFuncID.push(item.fieldName);
      } else {
        let url = item.reference;
        if (url) {
          let arr = url.split('/') as any[];
          let funcID = arr[arr.length - 1];
          this.lstFuncID.push(funcID);
        }
      }
    });
  }

  getAlertRule() {
    var lstRoleID = [];
    if (this.setting) {
      this.setting.forEach((element) => {
        if (element.fieldName) lstRoleID.push(element.fieldName);
      });
    }
    if (lstRoleID.length > 0) {
      this.api
        .execSv<any>('SYS', 'AD', 'AlertRulesBusiness', 'GetDicByIDAsync', [
          lstRoleID,
        ])
        .subscribe((res) => {
          if (res) {
            this.alertRules = res;
          }
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  getSchedules() {
    var lstScheduleID = [];
    if (this.setting) {
      this.setting.forEach((element) => {
        if (element.fieldName) lstScheduleID.push(element.fieldName);
      });
    }
    if (lstScheduleID.length > 0) {
      this.api
        .execSv<any>('BG', 'BG', 'ScheduleTasksBusiness', 'GetDicByIDAsync', [
          lstScheduleID,
        ])
        .subscribe((res) => {
          if (res) {
            this.schedules = res;
          }
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  getCategories() {
    var lstCategoryID = [];
    // if (this.setting) {
    //   this.setting.forEach((element) => {
    //     if (element.fieldName) lstCategoryID.push(element.fieldName);
    //   });
    // }
    for (const property in this.dataValue) {
      if (this.dataValue[property] && Array.isArray(this.dataValue[property])) {
        this.dataValue[property].forEach((element) => {
          if (element.CategoryID) lstCategoryID.push(element.CategoryID);
        });
      }
    }
    // if (this.dataValue && Array.isArray(this.dataValue)) {
    //   this.dataValue.forEach((element) => {
    //     if (element.CategoryID) lstCategoryID.push(element.CategoryID);
    //   });
    // }
    if (lstCategoryID.length > 0) {
      this.api
        .execSv<any>('ES', 'ES', 'CategoriesBusiness', 'GetDicByIDAsync', [
          lstCategoryID,
        ])
        .subscribe((res) => {
          if (res) {
            this.categories = res;
          }
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  valueChange(evt: any, data: any, autoDefault: any = null) {
    var fieldName = data.fieldName;
    var transType = data.transType;
    var field = evt.field;
    var value = evt.data;
    if (autoDefault) {
      if (typeof value == 'string') {
        value = value === '1';
      }
      var auto = autoDefault[fieldName];
      if (!auto) {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.AD',
            'AutoNumberDefaultsBusiness',
            'GenAutoDefaultAsync',
            [fieldName]
          )
          .subscribe((res) => {
            if (res) {
              auto = autoDefault[fieldName] = res;
              this.changeDetectorRef.detectChanges();
            }
          });
      } else {
        if (!value === auto.stop) return;
        auto.stop = !value;
        this.api
          .execAction('AD_AutoNumberDefaults', [auto], 'UpdateAsync')
          .subscribe((res) => {
            if (res) {
            }
            this.changeDetectorRef.detectChanges();
            console.log(res);
          });
      }
    } else {
      if (
        (typeof value == 'boolean' &&
          data.dataType.toLowerCase() != 'boolean' &&
          data.dataType.toLowerCase() != 'bool') ||
        !data.dataType
      ) {
        value = +value + '';
      }
      if (this.category === '5') {
        var rule = this.alertRules[fieldName];
        if (!rule) return;
        if (typeof value == 'string') {
          value = value === '1';
        }
        if (value === rule[field]) return;
        rule[field] = value;
        this.api
          .execAction('AD_AlertRules', [rule], 'UpdateAsync')
          .subscribe((res) => {
            if (res) {
            }
            this.changeDetectorRef.detectChanges();
            console.log(res);
          });
      } else if (this.category === '6') {
        var schedule = this.schedules[fieldName];
        if (typeof value == 'string') {
          value = value === '1';
        }
        if (!schedule) {
          this.api
            .execSv(
              'BG',
              'ERM.Business.Core',
              'DataBusiness',
              'GetDefaultEntityAsync',
              'BG_ScheduleTasks'
            )
            .subscribe((res) => {
              if (res) {
                dt = res;
                dt.scheduleID = fieldName;
                dt[field] = !value;
                this.schedules[fieldName] = dt;

                this.api
                  .execAction('BG_ScheduleTasks', [dt], 'SaveAsync')
                  .subscribe((res) => {
                    if (res) {
                    }
                    this.changeDetectorRef.detectChanges();
                    console.log(res);
                  });
              }
            });
        } else {
          if (!value === schedule[field]) return;
          schedule[field] = !value;
          this.api
            .execAction('BG_ScheduleTasks', [schedule], 'UpdateAsync')
            .subscribe((res) => {
              if (res) {
              }
              this.changeDetectorRef.detectChanges();
              console.log(res);
            });
        }
      } else {
        if (!this.dataValue) this.dataValue = {};
        if (
          !this.dataValue[transType] ||
          (this.dataValue[transType] &&
            Array.isArray(this.dataValue[transType]) &&
            this.dataValue[transType].length == 0)
        ) {
          if (this.category != '4') this.dataValue[transType] = {};
          else this.dataValue[transType] = [];
        }
        if (this.category != '4') {
          if (this.dataValue[transType][field] == value) {
            this.collapseItem(null, data);
            return;
          }
        }
        var dt = this.settingValue.find(
          (x) => x.category == this.category && x.transType == transType
        );
        if (this.category == '1' || this.category == '4') {
          if (
            this.category == '4' &&
            Array.isArray(this.dataValue[transType])
          ) {
            let dtvalue = this.dataValue[transType].find(
              (x) => x.FieldName == data.fieldName
            );
            if (dtvalue.ApprovalRule == value) return;
            dtvalue.ApprovalRule = value;
          } else {
            if (data.displayMode !== '4' && data.displayMode !== '5') {
              this.dataValue[transType][field] = value;
            } else {
              if (
                evt.component?.ComponentCurrent?.typecheck == 'share' &&
                !value
              )
                return;
              if (!Array.isArray(value))
                this.dataValue[transType][field] = value;
              let fID = '',
                id = '',
                fName = '',
                name = '',
                fType = '',
                type = '';
              var settingChild = this.settingFull.filter((item: any) => {
                if (item.refLineID === data.recID) {
                  if (item.dataFormat === 'ID') fID = item.fieldName;
                  if (item.dataFormat === 'Name') fName = item.fieldName;
                  if (item.dataFormat === 'Type') fType = item.fieldName;
                  return item;
                }
              });
              if (Array.isArray(value)) {
                value.forEach((element, i) => {
                  let space = '';
                  if (i > 0) space = ';';
                  id += space + (element.id || '');
                  name += space + (element.text || element.objectName || '');
                  type += space + (element.objectType || '');
                });
              }
              if (fID) this.dataValue[transType][fID] = id;
              if (fName) this.dataValue[transType][fName] = name;
              if (fType) this.dataValue[transType][fType] = type;
              var ele = document.querySelector(
                '.share-object-name[data-recid="' + data.recID + '"]'
              );
              if (ele) ele.innerHTML = name;
            }
            if (data.displayMode == '3') {
              this.collapseItem(null, data);
            }
          }

          if (!this.dialog) {
            if (dt) {
              dt.dataValue = JSON.stringify(this.dataValue[transType]);
              this.api
                .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
                .subscribe((res) => {
                  if (res) {
                    // update AD_CompanySettings
                    if (
                      this.category == '1' &&
                      data.reference &&
                      data.isCustomize
                    ) {
                      const tempDataValue = JSON.parse(dt.dataValue);
                      this.updateCustom(tempDataValue, data);
                    }

                    // console.log(tempDataValue);

                    // const requestData = new DataRequest();
                    // requestData.entityName = 'AD_CompanySettings';
                    // requestData.pageLoading = false;
                    // this.api
                    //   .execSv(
                    //     'SYS',
                    //     'Core',
                    //     'DataBusiness',
                    //     'LoadDataAsync',
                    //     requestData
                    //   )
                    //   .pipe(
                    //     tap((r) => console.log(r)),
                    //     map((r) => r[0]),
                    //     tap((r) => console.log(r))
                    //   )
                    //   .subscribe((res) => {
                    //     const first = res[0];

                    //     if (first) {
                    //       first.baseCurr = tempDataValue.BaseCurr;
                    //       first.secondCurr = tempDataValue.SecondCurr;
                    //       first.conversionCurr = tempDataValue.LocalCurr;

                    //       this.api
                    //         .execAction(
                    //           'AD_CompanySettings',
                    //           [first],
                    //           'UpdateAsync'
                    //         )
                    //         .subscribe();
                    //     }
                    //   });
                  }
                  this.changeDetectorRef.detectChanges();
                  console.log(res);
                });
            } else {
              //dt = {};

              if (this.setting.length > 0) {
                this.api
                  .execSv(
                    'SYS',
                    'ERM.Business.Core',
                    'DataBusiness',
                    'GetDefaultEntityAsync',
                    'SYS_SettingValues'
                  )
                  .subscribe((res) => {
                    if (res) {
                      dt = res;
                      dt.dataValue = JSON.stringify(this.dataValue[transType]);
                      var setting = this.setting[0];
                      dt.formName = data.formName;
                      dt.category = data.category;
                      dt.refModule = data.moduleSales;
                      dt.transType = data.transType;
                      this.settingValue.push(dt);
                      if (
                        this.category == '1' &&
                        data.reference &&
                        data.isCustomize
                      ) {
                        const tempDataValue = JSON.parse(dt.dataValue);
                        this.updateCustom(tempDataValue, data);
                      }
                      this.api
                        .execAction('SYS_SettingValues', [dt], 'SaveAsync')
                        .subscribe((res) => {
                          if (res) {
                          }
                          this.changeDetectorRef.detectChanges();
                          console.log(res);
                        });
                    }
                  });
              }
            }
          }
        }
      }
    }
  }

  a(dataValue, data) {
    return false;
  }

  //hàm dùng để custom xử lý sau khi lưu setting value cho các trường hợp đặc thù.
  updateCustom(dataVale: any, setting: any) {
    if (!dataVale || !setting) return;
    switch (setting.reference.toLowerCase()) {
      case 'updatecompanysettings':
        // this.cache.companySetting().subscribe((res) => {
        //   const first = res[0];

        //   if (first) {
        //     var field = Util.camelize(setting.fieldName);
        //     first[field] = dataVale[setting.fieldName];
        //     // first.secondCurr = dataVale.SecondCurr;
        //     // first.conversionCurr = dataVale.LocalCurr;

        //     this.api
        //       .execAction('AD_CompanySettings', [first], 'UpdateAsync')
        //       .subscribe();
        //   }
        // });
        break;
    }
  }

  click($event: any) {
    var lstData: any[] = [];
    for (const property in this.dataValue) {
      var dt = this.settingValue.find(
        (x) => x.category == this.category && x.transType == property
      );
      dt.dataValue = JSON.stringify(this.dataValue[property]);
      lstData.push(dt);
    }

    if (lstData.length > 0) {
      //dt.dataValue = JSON.stringify(this.dataValue);
      this.api
        .execAction('SYS_SettingValues', [lstData], 'UpdateAsync')
        .subscribe((res) => {
          if (res) {
            this.dialog.close();
          }
          this.changeDetectorRef.detectChanges();
          console.log(res);
        });
    } else {
      if (this.setting.length > 0) {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.Core',
            'DataBusiness',
            'GetDefaultEntityAsync',
            'SYS_SettingValues'
          )
          .subscribe((res) => {
            if (res) {
              dt = res;
              var lstData: any[] = [];
              for (const property in this.dataValue) {
                var setting = this.setting.find(
                  (x) => x.transType == property && x.category == this.category
                );
                dt.recID = Util.uid();
                dt.formName = setting?.formName;
                dt.category = setting?.category;
                dt.refModule = setting?.moduleSales;
                dt.transType = setting?.transType || property;
                var dt = this.settingValue.find(
                  (x) => x.category == this.category && x.transType == property
                );
                dt.dataValue = JSON.stringify(this.dataValue[property]);
                lstData.push(dt);
                this.settingValue.push(dt);
              }
              this.api
                .execAction('SYS_SettingValues', [lstData], 'SaveAsync')
                .subscribe((res) => {
                  if (res) {
                  }
                  this.changeDetectorRef.detectChanges();
                  console.log(res);
                });
            }
          });
      }
    }
  }
}
