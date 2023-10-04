import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CodxWrService } from '../../codx-wr.service';
import { ApiHttpService, CallFuncService } from 'codx-core';
import { Subject } from 'rxjs';

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
  @Input() listRoles = [];

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  constructor(
    private wrSv: CodxWrService,
    private callFunc: CallFuncService,
    private api: ApiHttpService
  ) {}

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }

  dbClick(data) {
    console.log('Not implemented');
  }

  getIcon($event) {
    if ($event == 'O') {
      return this.listRoles.filter((x) => x.value == 'O')[0]?.icon ?? null;
    } else if ($event == 'I') {
      return this.listRoles.filter((x) => x.value == 'I')[0]?.icon ?? null;
    } else if ($event == 'F') {
      return this.listRoles.filter((x) => x.value == 'F')[0]?.icon ?? null;
    }
    return this.listRoles.filter((x) => x.value == 'O')[0]?.icon ?? null;
  }

  //#region popover
  PopoverDetail(e, p: any, emp, field: string) {
    let parent = e.currentTarget.parentElement.scrollHeight;
    let child = e.currentTarget.offsetHeight;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (40 < child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
  }

  closePopover() {
    this.popupOld?.close();
  }

  checkHover(id) {
    var subject = new Subject<boolean>();
    setTimeout(() => {
      let isCollapsed = false;
      let element = document.getElementById(id);
      if (element) {
        if (element.offsetHeight > 40) {
          isCollapsed = true;
        }
      }
      subject.next(isCollapsed);
    }, 100);

    return subject.asObservable();
  }
  //#endregion
}
