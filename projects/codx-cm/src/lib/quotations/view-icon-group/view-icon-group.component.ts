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
  @Input() customerID: any;
  @Input() change = false;
  data: any;
  loaded = false;
  constructor(private api: ApiHttpService) {}

  ngOnChanges() {
    if (this.change) this.loadData();
  }
  ngOnInit() {
    this.loadData();
  }
  loadData() {
    this.loaded = false;
    this.api
      .exec('CM', 'CustomerGroupsBusiness', 'GetTmpGroupCustomersAsync', [
        this.customerID,
      ])
      .subscribe((res) => {
        if (res) this.data = res;
        this.loaded = true;
      });
  }
}
