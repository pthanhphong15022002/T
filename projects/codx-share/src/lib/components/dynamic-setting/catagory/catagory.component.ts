import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  Type,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  LayoutService,
} from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CatagoryComponent implements OnInit {
  private components = {
    cpnAutoNumbers: PopupAddAutoNumberComponent,
    cpnCalendar: null,
  };
  category = '';
  title = '';
  listName = 'SYS001';
  setting = [];
  settingMore = [];
  settingValue = [];
  groupSetting = [];
  function: any = {};
  valuelist: any = {};
  dataValue: any = {};
  catagoryName: any = '';
  urlOld = '';
  lstFuncID: any[] = [];
  autoDefault?: any;
  dialog?: DialogRef;
  constructor(
    private route: ActivatedRoute,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private layout: LayoutService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    if (data) {
      this.setting = data.data?.setting;
      this.valuelist = data.data?.valuelist;
      this.category = data.data?.category;
      this.function = data.data?.function;
      //this.loadSettingValue();
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((routeParams) => {
      this.layout.setLogo(null);
      this.lstFuncID = [];
      this.autoDefault = null;
      this.dataValue = {};
      this.urlOld = '..' + window.location.pathname;
      var state = history.state;
      if (state && !this.dialog) {
        this.setting = state.setting || [];
        this.settingMore = state.settingMore || [];
        this.function = state.function || [];
        this.valuelist = state.valuelist || {};
        this.groupSetting = this.setting.filter((x) => {
          return (
            x.controlType && x.controlType.toLowerCase() === 'groupcontrol'
          );
        });
      }
      var catagory = routeParams.catagory;
      if (this.valuelist && this.valuelist.datas && catagory) {
        const ds = (this.valuelist.datas as any[]).find(
          (item) => item.default == catagory
        );
        this.category = ds.value;
        this.title = ds.text;
        if (this.category === '2') this.getIDAutoNumber();
      }
      this.loadSettingValue();

      // this.cacheService.valueList(this.listName).subscribe((res) => {
      //   if (res && res.datas) {
      //     const ds = (res.datas as any[]).find(
      //       (item) => item.default == catagory
      //     );
      //     this.category = ds.value;
      //     this.title = ds.text;
      //     this.loadSettingValue();
      //   }
      // });
      this.changeDetectorRef.detectChanges();
    });
    if (this.dialog) {
      this.dialog.closed.subscribe((res) => {
        this.dialog = null;
      });
    }
  }

  openPopup(evt: any, reference: any, value: any, recID: any) {
    var width = 0,
      height = 0,
      title = '',
      funcID = '',
      data = {},
      cssClass = '',
      dialogModel = new DialogModel();
    if (!reference) {
      var itemChild = this.setting.filter(
        (x) => x.refLineID === recID && x.lineType === '2'
      );
      data['setting'] = itemChild;
      data['valuelist'] = this.valuelist;
      data['category'] = this.category;
      data['function'] = this.function;
      width = (screen.width * 40) / 100;
      height = 550;
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
                  width = (screen.width * 40) / 100;
                  height = 550;
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
        case 'cpnCalendar':
          break;
        default:
          break;
      }
    }
  }

  collapseItem(evt: any, recID: string) {
    var eleItem = document.querySelectorAll(
      '.list-item[data-group="' + recID + '"]'
    );
    if (eleItem && eleItem.length > 0) {
      eleItem.forEach((element) => {
        var ele = element as HTMLElement;
        var classlist = ele.classList;
        if (classlist.contains('d-none')) classlist.remove('d-none');
        else classlist.add('d-none');
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

          // this.itemMenu = Object.keys(res);
        }
        this.changeDetectorRef.detectChanges();
        //console.log(res);
      });
    if (this.category === '2' || this.category === '7') {
    }
  }

  loadValue() {
    switch (this.category) {
      case '1':
        var value = this.settingValue[0].dataValue;
        if (value) {
          this.dataValue = JSON.parse(value);
        }
        break;
    }
  }

  getIDAutoNumber() {
    //if (this.settingMore.length > 0) {
    //var lstFuncID: any[] = [];
    this.setting.forEach((item, i) => {
      let url = item.reference;
      if (url) {
        let arr = url.split('/') as any[];
        let funcID = arr[arr.length - 1];
        // var isCheck = this.settingMore.find(
        //   (res) => res.fieldName === funcID
        // );
        // if (isCheck)
        this.lstFuncID.push(funcID);
      }
    });
    // }
  }

  valueChange(evt: any, fieldName: string, autoDefault: any = null) {
    var field = evt.field;
    var value = evt.data;

    if (autoDefault) {
      if (typeof value == 'string') {
        value = value === '1';
      }
      var auto = autoDefault[fieldName];
      if (!auto) {
        //Chị Thương bảo nếu chưa có số tự động thì cảnh báo và báo C Thương thiết lập.
        // this.api
        //   .execSv(
        //     'SYS',
        //     'ERM.Business.AD',
        //     'AutoNumberDefaultsBusiness',
        //     'GenAutoDefaultAsync',
        //     [fieldName]
        //   )
        //   .subscribe((res) => {
        //     if (res) {
        //       auto = autoDefault[fieldName] = res;
        //       this.changeDetectorRef.detectChanges();
        //     }
        //   });
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
      if (typeof value == 'boolean') {
        value = +value + '';
      }
      var dt = this.settingValue.find((x) => x.category == this.category);
      if (this.category == '1') {
        this.dataValue[field] = value;
        if (!this.dialog) {
          dt.dataValue = JSON.stringify(this.dataValue);
          this.api
            .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
            .subscribe((res) => {
              if (res) {
              }
              this.changeDetectorRef.detectChanges();
              console.log(res);
            });
        }
      }
    }
  }

  click($event: any) {

    var dt = this.settingValue.find((x) => x.category == this.category);
    dt.dataValue = JSON.stringify(this.dataValue);
    this.api
      .execAction('SYS_SettingValues', [dt], 'UpdateAsync')
      .subscribe((res) => {
        if (res) {
        }
        this.changeDetectorRef.detectChanges();
        console.log(res);
      });
  }
}
