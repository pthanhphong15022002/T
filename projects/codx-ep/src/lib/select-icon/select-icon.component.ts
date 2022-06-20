import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'select-icon',
  templateUrl: './select-icon.component.html',
  styleUrls: ['./select-icon.component.scss'],
})
export class SelectIconComponent implements OnInit {
  dataSource = [];
  data$: Observable<any>;
  @Input() itemSelected = '';
  @Input() refValue = 'L1470';
  @Output() valueChange = new EventEmitter();
  @Input() field = '';
  constructor(private api: ApiHttpService, private cache: CacheService) {}
  ngOnInit(): void {
    // this.data$ = this.api
    //   .execSv<any>('SYS', 'ERM.Business.SYS', 'ValueListBusiness',
    //     'GetJsonAsync', [this.refValue, true]);
    this.cache.valueList(this.refValue).subscribe((res) => {
      this.data$ = res.datas;
    });
  }

  displayTextIcon() {
    return this.itemSelected == '' ? 'Icon' : '';
  }

  fnTrackBy(index, item) {
    return item;
  }
  changeIcon(icon) {
    this.itemSelected = icon;
    this.valueChange.emit({ field: this.field, value: icon });
  }
}
