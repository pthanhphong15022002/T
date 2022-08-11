import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService } from 'codx-core';

@Component({
  selector: 'lib-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
})
export class CatagoryComponent implements OnInit {
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
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((routeParams) => {
      var state = history.state;
      if (state) {
        this.setting = state.setting || [];
        this.function = state.function || [];
        this.groupSetting = this.setting.filter(
          (x) => x.controlType.toLowerCase() === 'groupcontrol'
        );
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
