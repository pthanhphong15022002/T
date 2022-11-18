import { ViewModel } from 'codx-core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent implements OnInit {
  views: Array<ViewModel> = [];
  constructor() {}

  ngOnInit(): void {}
}
