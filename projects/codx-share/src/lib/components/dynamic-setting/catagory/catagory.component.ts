import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Switch } from '@syncfusion/ej2-angular-buttons';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
} from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';

@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
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
  settingValue = [];
  groupSetting = [];
  function: any = {};
  valuelist: any = {};
  dataValue: any = {};
  constructor(
    private route: ActivatedRoute,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((routeParams) => {
      debugger;
      var state = history.state;
      if (state) {
        this.setting = state.setting || [];
        this.function = state.function || [];
        this.valuelist = state.valuelist || {};
        this.groupSetting = this.setting.filter((x) => {
          return (
            x.controlType && x.controlType.toLowerCase() === 'groupcontrol'
          );
        });
      }
      var catagory = routeParams.catagory;
      if (this.valuelist && this.valuelist.datas) {
        const ds = (this.valuelist.datas as any[]).find(
          (item) => item.default == catagory
        );
        this.category = ds.value;
        this.title = ds.text;
        this.loadSettingValue();
      }
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
  }

  openPopup(evt: any, reference: any, value: any) {
    if (!reference) return;
    var component = this.components[reference] as Type<any>;
    var width = 0,
      height = 0,
      title = '',
      funcID = '',
      data = {},
      cssClass = '',
      dialogModel = new DialogModel();
    switch (reference.toLowerCase()) {
      case 'cpnautonumbers':
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

        break;
      case 'cpnCalendar':
        break;
    }
    // this.callfc.openForm(
    //   component,
    //   title,
    //   width,
    //   height,
    //   funcID,
    //   data,
    //   cssClass,
    //   dialogModel
    // );
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
        [this.function?.formName, this.category]
      )
      .subscribe((res) => {
        if (res) {
          this.settingValue = res;
          this.loadValue();
          // this.itemMenu = Object.keys(res);
        }
        this.changeDetectorRef.detectChanges();
        console.log(res);
      });
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

  valueChange(evt: any) {
    var field = evt.field;
    var value = evt.data;
    if (!value) return;
    if (this.category == '1') this.dataValue[field] = value;
  }
}
