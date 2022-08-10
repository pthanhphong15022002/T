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
  constructor(
    private route: ActivatedRoute,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    var a = history.state;
    var catagory = this.route.snapshot.params['catagory'];
    this.cacheService.valueList(this.listName).subscribe((res) => {
      debugger;
      if (res && res.datas) {
        const ds = (res.datas as any[]).find(
          (item) => item.default == catagory
        );
        this.category = ds.value;
        this.title = ds.text;
      }
    });
  }

  loadSettingValue(formName: string) {
    // this.api
    //   .execSv<any>('SYS', 'SYS', 'SettingsBusiness', 'GetSettingByFormAsync', [
    //     formName,
    //     this.category,
    //   ])
    //   .subscribe((res) => {
    //     debugger;
    //     if (res) {
    //       // this.dataSetting = res;
    //       // this.itemMenu = Object.keys(res);
    //     }
    //     this.changeDetectorRef.detectChanges();
    //     console.log(res);
    //   });
  }
}
