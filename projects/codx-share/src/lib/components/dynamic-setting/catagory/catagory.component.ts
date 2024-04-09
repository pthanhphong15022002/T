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
import { PopupAddDynamicProcessComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/popup-add-dynamic-process.component';
import { ActivatedRoute } from '@angular/router';
import { JournalsAddIdimcontrolComponent } from 'projects/codx-ac/src/lib/journals/journals-add/journals-add-idimcontrol/journals-add-idimcontrol.component';
import { FormatPipe } from '../pipes/format-string.pipe';

@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [FormatPipe],
})
export class CatagoryComponent implements OnInit {
  private components = {
    cpnAutoNumbers: PopupAddAutoNumberComponent,
    cpnAlertRules: CodxEmailComponent,
    cpnAutomationRules: CodxEmailComponent,
    cpnApprovals: CodxApproveStepsComponent,
    cpnCategories: PopupAddCategoryComponent,
    cpnScheduledTasks: CodxFormScheduleComponent,
    idimControl: JournalsAddIdimcontrolComponent,
    PopupAddDynamicProcessComponent: PopupAddDynamicProcessComponent,
  };
  category = '';
  title: string[] = [];
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
  idOld: string[] = [];
  //labels
  labels = [];
  lineType = '1';
  componentSub = '';
  isOpenSub: boolean = false;
  formModel: FormModel;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private cache: CacheService,
    private inject: Injector,
    private activatedRoute: ActivatedRoute,
    private formatDes: FormatPipe,
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
      this.lineType = data.data?.lineType;
      this.itemSelect = data.data?.itemSelect;
      //this.loadSettingValue();
    }
  }
  lstPolicies: any = {};
  lstPolicyLines: any = {};
  ngOnInit(): void {
    if (this.dialog) {
      if (this.setting) {
        this.groupSetting = this.setting.filter((x) => {
          return x.lineType === this.lineType;
        });
      }
      this.dialog.closed.subscribe((res) => {
        //let dataValues = this.dataValue[this.itemSelect.transType];
        if (this.itemSelect) {
          let des = this.formatDes.transform(this.itemSelect, this.dataValue);
          let ele = document.querySelector(
            ".setting-description[data-id='" + this.itemSelect.recID + "']"
          );
          if (ele) (ele as HTMLElement).innerText = des;
        }

        this.dialog = null;
        this.itemSelect = {};
      });
    } else {
      this.lstFuncID = [];
      this.autoDefault = null;
      this.dataValue = {};

      if (this.setting) {
        this.groupSetting = this.setting.filter((x) => {
          return x.lineType === this.lineType;
        });
        var funcID = this.activatedRoute.snapshot.params['funcID'];

        this.cache.functionList(funcID).subscribe((res) => {
          if (res) {
            this.formModel = new FormModel();
            this.formModel.formName = res.formName;
            this.formModel.funcID = res.funcID;
            this.formModel.gridViewName = res.gridViewName;
            this.formModel.entityName = res.entityName;
          }
        });
      }
      if (this.valuelist && this.valuelist.datas && this.category) {
        const ds = (this.valuelist.datas as any[]).find(
          (item) => item.value == this.category
        );
        this.title.push(ds.text);
        if (this.category === '2' || this.category === '7')
          this.getIDAutoNumber();
        //else if (this.category === '4') this.getCategories();
        else if (this.category === '5') this.getAlertRule();
        else if (this.category === '6') this.getSchedules();
      }
      this.changeDetectorRef.detectChanges();
    }
    let lstPoliciID: string[] = [];
    if (this.category == '1') {
      this.settingFull.forEach((st) => {
        if (st.reference) lstPoliciID.push(st.fieldName);
      });
    }

    if (lstPoliciID && lstPoliciID.length > 0) {
      this.api
        .execSv('FD', 'FD', 'PoliciesBusiness', 'GetPoliciesByFieldsAsync', [
          lstPoliciID,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.lstPolicies = res[0];
            this.lstPolicyLines = res[1];
            lstPoliciID.forEach((id) => {
              let setting = this.settingFull.find((x) => x.fieldName == id);
              setting.policy = this.lstPolicies[id];
            });
          }
        });
    }

    this.loadSettingValue();
  }

  itemSelect: any = {};
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
      if (
        this.dataValue[item.transType] &&
        this.dataValue[item.transType][value]
      ) {
        let dtvalue = this.dataValue[item.transType][value];
        if (dtvalue === '0') return;
        let lineType = +this.lineType + 1 + '';
        var itemChild = this.settingFull.filter(
          (x) => x.refLineID === recID && x.lineType === lineType
        );
        if (!itemChild || itemChild.length == 0) {
          itemChild = this.oldSettingFull.filter(
            (x) => x.refLineID === recID && x.lineType === lineType
          );
        }
        data['settingFull'] = itemChild;
        data['valuelist'] = this.valuelist;
        //data['settingValue'] = this.settingValue;
        data['category'] = this.category;
        data['function'] = this.function;
        data['lineType'] = lineType;
        data['itemSelect'] = item;
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
      }
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
          var lstRules = this.alertRules[reference];
          var rule = lstRules[value];
          if (!rule) return;
          data['formGroup'] = null;
          data['templateID'] = rule.emailTemplate;
          data['type'] = 'cpnalertrules';
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
        case 'cpnautomationrules':
          var lstRules = this.alertRules[reference];
          var rule = lstRules[value];
          if (!rule || !rule.actions || !rule.actions.templateID) return;
          data['formGroup'] = null;
          data['templateID'] = rule.actions.templateID;
          data['type'] = 'cpnautomationrules';
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
          data['data'] = category;
          data['vllShare'] = category?.approverList;
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
                  option.Width = '800px';
                  option.DataService = dataService;
                  option.FormModel = formModel;
                  let popupAdd = this.callfc.openSide(
                    PopupAddCategoryComponent,
                    {
                      data: category,
                      isAdd: false,
                      headerText: item.tilte ?? '', // /*"Sửa" + ' ' +*/ func?.customName ?? '',
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
          let dataValue = this.dataValue['null'];
          if (dataValue) {
            let obj = {
              lsselectidimcontrol:
                this.dataValue['null'][value] == ''
                  ? []
                  : this.dataValue['null'][value].split(';'),
              headerText: item.tilte,
              showAll: true,
            };
            let dialog = this.callfc.openForm(
              JournalsAddIdimcontrolComponent,
              '',
              350,
              500,
              '',
              obj,
              '',
              dialogModel
            );
            dialog.closed.subscribe((res) => {
              if (res.event != null) {
                dataValue[value] = res.event;
                let dt = this.settingValue.find(
                  (x) =>
                    x.category == this.category && x.transType == item.transType
                );
                if (dt) {
                  dt.dataValue = JSON.stringify(dataValue);
                  this.api
                    .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
                    .subscribe((res) => {});
                }
              }
            });
          }
          // var dataValue = this.dataValue[item.transType];
          // if (dataValue) {
          //   var dim = dataValue[value];
          //   this.callfc
          //     .openForm(
          //       MultiSelectPopupComponent,
          //       '',
          //       400,
          //       500,
          //       '',
          //       {
          //         selectedOptions: dim,
          //         showAll: true,
          //       },
          //       '',
          //       dialogModel
          //     )
          //     .closed.subscribe(({ event }) => {
          //       if (event == null) {
          //         return;
          //       }

          //       dataValue[value] = event;
          //       var dt = this.settingValue.find(
          //         (x) =>
          //           x.category == this.category && x.transType == item.transType
          //       );
          //       if (dt) {
          //         dt.dataValue = JSON.stringify(dataValue);
          //         this.api
          //           .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
          //           .subscribe((res) => {
          //             this.changeDetectorRef.detectChanges();
          //             console.log(res);
          //           });
          //       }
          //       console.log(event);
          //     });
          // }

          break;
        //crm
        case 'cms0301':
        case 'cms0302':
        case 'cms0303':
        case 'cms0304':
        case 'cms0305':
          this.cmOpenPopup(item, dialogModel);
          break;
        default:
          break;
      }
    }
  }

  openSub(evt: any, data: any, dataValue: any) {
    this.title.push(data.tilte);
    this.lineType = +this.lineType + 1 + '';
    let recID = data.recID;
    this.idOld.push(data.recID);
    this.isOpenSub = true;
    if (!this.oldSettingFull || Object.keys(this.oldSettingFull).length === 0)
      this.oldSettingFull = JSON.parse(JSON.stringify(this.settingFull));
    if (!dataValue) dataValue = this.oldDataValue[data.transType];
    if (!this.oldDataValue || Object.keys(this.oldDataValue).length === 0)
      this.oldDataValue = JSON.parse(JSON.stringify(this.dataValue));
    if (data.reference) {
      this.componentSub = data.reference;

      this.dataValue = dataValue || {};
      this.groupSetting = [];
      this.setting = [data];
    } else {
      this.setting =
        this.settingFull.filter(
          (x) =>
            x.refLineID === recID &&
            x.lineType === this.lineType &&
            x.isVisible == true
        ) || [];
      this.groupSetting = this.setting.filter((x) => {
        return x.lineType === this.lineType;
      });
      if (this.category === '2' || this.category === '7')
        this.getIDAutoNumber();
      else if (this.category === '5') this.getAlertRule();
      else if (this.category === '6') this.getSchedules();
    }

    this.changeDetectorRef.detectChanges;
  }

  backSub(evt: any) {
    this.title = this.title.slice(0, -1);
    this.idOld = this.idOld.slice(0, -1);
    if (this.lineType == '1') {
      this.oldSettingFull = [];
      this.oldDataValue = {};
    } else {
      if (this.lineType == '2') this.isOpenSub = false;
      this.lineType = +this.lineType - 1 + '';
    }

    evt.preventDefault();
    this.dataValue = JSON.parse(JSON.stringify(this.oldDataValue));
    this.settingFull = JSON.parse(JSON.stringify(this.oldSettingFull));
    let a = this.idOld;
    let recID = this.idOld[this.idOld.length - 1];
    this.setting =
      this.settingFull.filter(
        (x) => x.lineType === this.lineType && x.isVisible == true
      ) || [];
    if (recID)
      this.setting = this.setting.filter((x) => x.refLineID === recID) || [];
    // this.setting =
    //   this.settingFull.filter((res) =>) || [];
    this.groupSetting = this.setting.filter((x) => {
      return x.lineType === this.lineType;
    });

    if (this.componentSub) {
      this.componentSub = '';
    } else {
      if (this.category === '2' || this.category === '7')
        this.getIDAutoNumber();
      else if (this.category === '5') this.getAlertRule();
      else if (this.category === '6') this.getSchedules();
    }

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
    var lstAutoRoleID = [];
    if (this.setting) {
      this.setting.forEach((element) => {
        if (element.fieldName) {
          if (element.reference === 'cpnAutomationRules')
            lstAutoRoleID.push(element.fieldName);
          else lstRoleID.push(element.fieldName);
        }
      });
    }
    if (lstRoleID.length > 0) {
      this.api
        .execSv<any>('SYS', 'AD', 'AlertRulesBusiness', 'GetDicByIDAsync', [
          { cpnAutomationRules: lstAutoRoleID, cpnAlertRules: lstRoleID },
        ])
        .subscribe((res) => {
          if (res) this.alertRules = res;

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
        !data.dataType ||
        (typeof value == 'boolean' &&
          data.dataType.toLowerCase() != 'boolean' &&
          data.dataType.toLowerCase() != 'bool')
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
        if (data.displayMode == '3') {
          if (this.dataValue[transType][field] == value || !value) {
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
              if (evt.component?.controlType == 'share' && !value) return;
              if (!Array.isArray(value)) {
                if (this.dataValue[transType][field] == value) return;
                this.dataValue[transType][field] = value;
              }

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
            this.oldDataValue = JSON.parse(JSON.stringify(this.dataValue));
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
                    if (data) {
                      let des = this.formatDes.transform(data, this.dataValue);
                      let ele = document.querySelector(
                        ".setting-description[data-id='" + data.recID + "']"
                      );
                      if (ele) (ele as HTMLElement).innerText = des;
                    }
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
      case 'updatedowcode': // HR: update kỳ công cho nhân sự
        let lstFuncID = ['PRT01', 'PRT03', 'PRTPro18'];
        this.api
          .execSv(
            'SYS',
            'SYS',
            'GridViewSetupBusiness',
            'HRUpdateGridViewSetUpAsync',
            [lstFuncID, dataVale[setting.fieldName]]
          )
          .subscribe();
        break;
    }
  }

  click($event: any) {
    var lstData: any[] = [];
    let dataValue = this.dataValue;
    for (var property in dataValue) {
      if (property === 'null') property = null;
      var dt = this.settingValue.find(
        (x) => x.category == this.category && x.transType == property
      );
      dt.dataValue = JSON.stringify(dataValue[property]);
      lstData.push(dt);
    }

    if (lstData.length > 0) {
      //dt.dataValue = JSON.stringify(this.dataValue);
      this.api
        .execAction('SYS_SettingValues', lstData, 'UpdateAsync')
        .subscribe((res) => {
          if (res) {
            this.dialog.close(lstData);
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
              for (var property in this.dataValue) {
                if (property === 'null') property = null;
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
                .execAction('SYS_SettingValues', lstData, 'SaveAsync')
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

  //CM_Setting popup - VThao - 4/7/2023 - chuyen qua từ code của Phúc
  async cmOpenPopup(item, dialogModel) {
    let funcID = item.reference;
    let title = item.title || item.description;
    this.api
      .execSv<any>(
        'DP',
        'ERM.Business.DP',
        'ProcessesBusiness',
        'GetProcessDefaultSettingAsync',
        [
          funcID == 'CMS0301'
            ? '1'
            : funcID == 'CMS0302'
            ? '2'
            : funcID == 'CMS0303'
            ? '3'
            : funcID == 'CMS0304'
            ? '5'
            : '4',
        ]
      )
      .subscribe((data) => {
        if (data != null && data.length > 0) {
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          let formModel = new FormModel();
          formModel.entityName = 'DP_Processes';
          formModel.formName = 'DPProcesses';
          formModel.gridViewName = 'grvDPProcesses';
          formModel.funcID = 'DP0204'; //'DP01';
          // dialogModel.DataService = this.view?.dataService;
          dialogModel.FormModel = formModel;
          var obj = {
            action: data[3],
            titleAction: title,
            gridViewSetup: data[1],
            lstGroup: data[2],
            systemProcess: '1',
            data: data[0],
          };

          this.callfc.openForm(
            PopupAddDynamicProcessComponent,
            '',
            0,
            0,
            '',
            obj,
            '',
            dialogModel
          );
        }
      });

    // this.changeDetectorRef.detectChanges();
  }

  //end CRM
}
