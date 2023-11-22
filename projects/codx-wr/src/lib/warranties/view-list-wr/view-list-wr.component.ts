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
  @Input() asideMode: string;

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMoreMF = new EventEmitter<any>();
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  fieldPopover: any;
  isPopoverOpen = false;
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
    return this.listRoles.find((x) => x.value == $event)?.icon ?? null;
  }

  //#region popover
  PopoverDetail(e, p: any, emp, field: string) {
    this.isPopoverOpen = true;
    let parent = e?.currentTarget?.clientHeight;
    let child = e?.currentTarget?.scrollHeight;
    const isOpen = p.isOpen();
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (parent < child) {
          p.open();
        }
      }
    } else {
      p.close();
    }
    this.popupOld = p;
    this.fieldPopover = field;
  }

  popoverClosed(p) {
    p.close();

    this.isPopoverOpen = false;
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
