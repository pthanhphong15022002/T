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
  dtService: CRUDService;
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;

  @Input() formModel: any = [];
  @Input() dataValue = '';
  @Input() predicate = '';

  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(private injector: Injector, private route: ActivatedRoute) {
    super(injector);
    var dataSv = new CRUDService(injector);
    dataSv.request.pageSize = 10;
    this.dtService = dataSv;
    this.cache
    .moreFunction('PersonalNotes', 'grvPersonalNotes')
    .subscribe((res) => {
      if (res) {
        this.editMF = res[2];
        this.deleteMF = res[3];
        this.pinMF = res[0];
        this.saveMF = res[1];
      }
    });
  }

  onInit() {
  }

  ngAfterViewInit() {
    console.log('check listview', this.listview);
  }
}
