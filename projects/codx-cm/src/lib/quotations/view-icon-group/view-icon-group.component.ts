import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'cm-view-icon-group',
  templateUrl: './view-icon-group.component.html',
  styleUrls: ['./view-icon-group.component.css'],
})
export class ViewIconGroupComponent implements OnInit {
  @ViewChild('noData') noData: TemplateRef<any>;
  @Input() custormerID: any;
  data: any;
  loaded = false;
  constructor(private api: ApiHttpService) {}

  ngOnInit() {
    this.loadData();
  }
  loadData() {
    this.loaded = false;
    this.api
      .exec('CM', 'CustomerGroupsBusiness', 'GetTmpGroupCustomersAsync', [
        this.custormerID,
      ])
      .subscribe((res) => {
        if (res) this.data = res;
        this.loaded = true;
      });
  }
}
