import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
@Component({
  selector: 'lib-table-line-detail-static',
  templateUrl: './table-line-detail-static.component.html',
  styleUrls: ['./table-line-detail-static.component.scss'],
})
export class TableLineDetailStaticComponent
  extends UIComponent
  implements AfterViewInit, OnChanges
{
  //#region Constructor
  @Input() lines: any[] = [];
  @Input() loading: boolean = false;
  @Input() trTemplate: TemplateRef<any>;
  @Input() formModel: FormModel;
  @Input() columns: any[] = [];
  @Input() autoSum: boolean = true;

  @ViewChild('myTable') tableRef: ElementRef<HTMLElement>;

  hasVerticalScrollbar: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}

  ngAfterViewInit(): void {
    const tableElement: HTMLElement = this.tableRef.nativeElement;
    this.hasVerticalScrollbar =
      tableElement.offsetHeight < tableElement.scrollHeight;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lines) {
      const tableElement: HTMLElement = this.tableRef?.nativeElement;
      if (tableElement) {
        this.hasVerticalScrollbar =
          tableElement.offsetHeight < tableElement.scrollHeight;
      }
    }

    // calculate totalRow
    if (!this.autoSum) {
      return;
    }

    this.columns.map((col) => (col.sum = 0));
    for (const line of this.lines) {
      for (const th of this.columns) {
        if (th.hasSum) {
          th.sum += line[th.field] ?? 0;
        }
      }
    }
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
