import {
  CdkDragDrop,
  copyArrayItem,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiHttpService, CallFuncService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-form-format-value',
  templateUrl: './form-format-value.component.html',
  styleUrls: ['./form-format-value.component.scss'],
})
export class FormFormatValueComponent implements OnInit {
  @Input() subItem: any;
  @Input() dataCurrent: any;
  @Input() isShowTextHeader: boolean = false;
  @Input() showIconDrop: boolean = true;

  @Input() formModel: FormModel = {
    formName: 'DPStepsFields',
    gridViewName: 'grvDPStepsFields',
    entityName: 'DP_Steps_Fields',
  };
  @Output() renderData = new EventEmitter<any>();
  @Output() dropLists = new EventEmitter<any>();
  datasVll = [];
  countData = 0;
  isPopupUserCbb = false;
  mutiSelectVll: boolean;
  plancehoderVll = '';
  fields = {
    text: 'textValue',
    value: 'value',
    icon: 'icon',
    color: 'color',
    textColor: 'textColor',
  };
  lstTables = [];
  hasIndexNo: boolean = false;
  documentControl = [];
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private api: ApiHttpService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    this.loadData();
  }

  loadSubItem() {}

  loadData() {
    if (this.subItem?.fieldType) {
      switch (this.subItem?.fieldType) {
        case 'ValueList':
          if (this.subItem?.refValue) this.loadDataVll();
          break;
        case 'Combobox':
          break;
        case 'Table':
          if (this.subItem?.tableFormat) {
            const format = JSON.parse(this.subItem?.tableFormat);
            this.hasIndexNo = format?.hasIndexNo;
          }
          let tables = [];
          if (this.subItem?.dataFormat) {
            tables = JSON.parse(this.subItem?.dataFormat);
          }
          this.lstTables = JSON.parse(JSON.stringify(tables));
          break;
        case 'Attachment':
          if (typeof this.subItem?.documentControl == 'string') {
            if (this.subItem?.documentControl)
              this.documentControl = JSON.parse(this.subItem.documentControl);
          } else {
            this.documentControl = this.subItem.documentControl ?? [];
          }

          break;
      }
    }
    this.isPopupUserCbb = false;
  }

  loadDataVll() {
    this.api
      .execSv<any>('SYS', 'SYS', 'ValueListBusiness', 'GetAsync', [
        this.subItem?.refValue,
      ])
      .subscribe((vl) => {
        if (vl) {
          this.mutiSelectVll = vl?.multiSelect;
          this.plancehoderVll = vl?.note;
          const defaultValues = vl?.defaultValues?.split(';');
          const iconSets = vl?.iconSet?.split(';');
          const colorSets = vl?.colorSet?.split(';');
          const textColorSets = vl?.textColorSet?.split(';');

          if (!defaultValues || defaultValues?.length == 0) {
            this.datasVll = [];
            return;
          }

          if (vl.listType == 1) {
            for (let i = 0; i < defaultValues.length; i++) {
              let tmp = {};
              tmp['textValue'] = defaultValues[i];
              tmp['value'] = defaultValues[i];
              tmp['icon'] = iconSets[i];
              tmp['color'] = colorSets[i];
              tmp['textColor'] = textColorSets[i];
              this.datasVll.push(tmp);
            }
          }

          //chua lam 2
        } else this.datasVll = [];
      });
  }

  clickData(data) {
    this.renderData.emit({ data: data });
  }

  //#region popup
  openPopup() {
    this.isPopupUserCbb = true;
    this.detectorRef.detectChanges();
  }
  valueChangePop(e) {
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
  }
  //#endregion

  createRangeArray(min: number, max: number): number[] {
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }
}
