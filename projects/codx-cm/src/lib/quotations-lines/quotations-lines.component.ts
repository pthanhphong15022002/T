import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CacheService, FormModel, Util } from 'codx-core';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-quotations-lines',
  templateUrl: './quotations-lines.component.html',
  styleUrls: ['./quotations-lines.component.css'],
})
export class QuotationsLinesComponent implements OnInit, AfterViewInit {
  @Input() quotationLines = [];
  @Input() dataValues: any;
  @Input() predicates: any;
  @Input() actionParent = 'add';
  @Input() transID: any;

  @Output() listQuotationLines: Array<any> = [];
  @Output() quotationLinesAddNew = [];
  @Output() quotationLinesEdit = [];
  @Output() quotationLinesDeleted = [];

  @Output() eventAdd = new EventEmitter<any>();
  @Output() eventEdit = new EventEmitter<any>();
  @Output() eventDeleted = new EventEmitter<any>();

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  gridHeight: number = 300;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  titleActionLine = '';
  columnsGrid = [];
  arrFieldIsVisible: any[];
  formModel: FormModel;
  grvSetupQuotations: any;
  grvSetupQuotationsLines: any;
  crrCustomerID: string;

  constructor(private codxCM: CodxCmService, private cache: CacheService) {
    this.cache
      .gridViewSetup(
        this.fmQuotationLines.formName,
        this.fmQuotationLines.gridViewName
      )
      .subscribe((res) => {
        this.grvSetupQuotationsLines = res;
        //lay grid view
        let arrField = Object.values(res).filter((x: any) => x.isVisible);
        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          this.getColumsGrid(res);
        }
      });
  }
  ngAfterViewInit(): void {}
  ngOnInit(): void {}


  //#region  CRUD
  
  //#endregion

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'ItemID':
         // template = this.itemTemp;
          break;
      }

      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
          // textAlign: 'center',
        };
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnsGrid.push(colums);
    });
    // this.cache.companySetting().subscribe((res) => {
    //   let baseCurr = res.filter((x) => x.baseCurr != null)[0].baseCurr;
    //   this.columnsGrid = this.columnsGrid.slice();
    //   if (this.gridQuationsLines) {
    //     this.gridQuationsLines.refresh();
    //   }
    // });
  }
}
