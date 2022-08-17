import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, CallFuncService } from 'codx-core';

@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
})
export class CatagoryComponent implements OnInit {
  private components = {
    cpnAutoNumbers: null,
  };
  category = '';
  title = '';
  listName = 'SYS001';
  setting = [];
  groupSetting = [];
  function = {};
  constructor(
    private route: ActivatedRoute,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((routeParams) => {
      var state = history.state;
      if (state) {
        this.setting = state.setting || [];
        this.function = state.function || [];
        this.groupSetting = this.setting.filter((x) => {
          return (
            x.controlType && x.controlType.toLowerCase() === 'groupcontrol'
          );
        });
      }
      var catagory = routeParams.catagory;
      this.cacheService.valueList(this.listName).subscribe((res) => {
        if (res && res.datas) {
          const ds = (res.datas as any[]).find(
            (item) => item.default == catagory
          );
          this.category = ds.value;
          this.title = ds.text;
        }
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  openPopup(evt: any, reference: any) {
    var component = this.components[reference] as Type<any>;
    this.callfc.openForm(component);
  }

  collapseItem(evt: any, recID: string) {
    // var eleItem = document.querySelectorAll(
    //   '.list-item[data-group="' + recID + '"]'
    // );
    // if (eleItem && eleItem.length > 0) {
    //   eleItem.forEach((element) => {
    //     var ele = element as HTMLElement;
    //     var classlist = ele.classList;
    //     if (classlist.contains('d-none')) classlist.remove('d-none');
    //     else classlist.add('d-none');
    //   });
    // }
    // var btn = document.querySelector(
    //   '.button-collapse[data-id="' + recID + '"]'
    // ) as HTMLElement;
    // if (btn) {
    //   if (btn.classList.contains('icon-keyboard_arrow_right')) {
    //     btn.classList.remove('icon-keyboard_arrow_right');
    //     btn.classList.add('icon-keyboard_arrow_down');
    //   } else {
    //     btn.classList.remove('icon-keyboard_arrow_down');
    //     btn.classList.add('icon-keyboard_arrow_right');
    //   }
    // }
  }

  loadSettingValue(formName: string) {
    // this.api
    //   .execSv<any>('SYS', 'SYS', 'SettingsBusiness', 'GetSettingByFormAsync', [
    //     formName,
    //     this.category,
    //   ])
    //   .subscribe((res) => {
    //
    //     if (res) {
    //       // this.dataSetting = res;
    //       // this.itemMenu = Object.keys(res);
    //     }
    //     this.changeDetectorRef.detectChanges();
    //     console.log(res);
    //   });
  }
}
