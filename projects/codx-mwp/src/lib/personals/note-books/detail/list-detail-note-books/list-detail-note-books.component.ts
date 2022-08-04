import { Component, Input, OnInit, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxListviewComponent, CRUDService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-list-detail-note-books',
  templateUrl: './list-detail-note-books.component.html',
  styleUrls: ['./list-detail-note-books.component.scss'],
})
export class ListDetailNoteBooksComponent
  extends UIComponent
  implements OnInit
{
  views = [];
  predicate = 'TransID=@0';
  dtService: CRUDService;

  @Input() formModel: any = [];
  @Input() dataValue = '';

  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(private injector: Injector, private route: ActivatedRoute) {
    super(injector);
    var dataSv = new CRUDService(injector);
    dataSv.request.pageSize = 10;
    this.dtService = dataSv;
  }

  onInit() {}

  ngAfterViewInit() {
    console.log('check listview', this.listview);
  }
}
