import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'lib-quotations-lines',
  templateUrl: './quotations-lines.component.html',
  styleUrls: ['./quotations-lines.component.css'],
})
export class QuotationsLinesComponent implements OnInit, AfterViewInit {
  @Input() quotationLines =[];
  @Input() dataValues: any;
  @Input() predicates: any;

  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
  };
  gridHeight: number = 300;
  constructor() {

  }
  ngAfterViewInit(): void {}
  ngOnInit(): void {}
}
