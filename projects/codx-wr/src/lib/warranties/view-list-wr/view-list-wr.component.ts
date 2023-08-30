import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CodxWrService } from '../../codx-wr.service';
import { ApiHttpService, CallFuncService } from 'codx-core';

@Component({
  selector: 'codx-view-list-wr',
  templateUrl: './view-list-wr.component.html',
  styleUrls: ['./view-list-wr.component.css'],
})
export class ViewListWrComponent {
  @Input() dataList: any;
  @Input() formModel: any;
  @Input() funcID = 'WR0101';
  @Input() entityName: any;
  @Input() gridViewSetup: any;

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();

  constructor(
    private wrSv: CodxWrService,
    private callFunc: CallFuncService,
    private api: ApiHttpService
  ) {}

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      // if (changes['taskID'].currentValue === this.id) return;
      // this.id = changes['taskID'].currentValue;
      // this.loadedHisPro = false;
      // this.getTaskDetail();
    }
  }

  dbClick(data) {
    console.log('Not implemented');
  }

  getIcon($event) {
    // if ($event == '1') {
    //   return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
    // } else if ($event == '5') {
    //   return this.listRoles.filter((x) => x.value == '5')[0]?.icon ?? null;
    // } else if ($event == '3') {
    //   return this.listRoles.filter((x) => x.value == '3')[0]?.icon ?? null;
    // }
    // return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
  }
}
