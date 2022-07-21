import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss']
})
export class ImgComponent implements OnInit, AfterViewInit {

  user: any;
  predicate = '';
  dataValue = '';
  dataSort: any;
  data: any = [];
  checkPredicate = '';

  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private codxService: CodxService,
    private api: ApiHttpService,
  ) {
    this.user = this.authStore.get();
    this.predicate = 'CreatedBy=@0';
    this.dataValue = this.user?.userID;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    console.log("check data", this.listview.dataService.data)
    debugger;
    this.data = this.listview.dataService.data;
  }
}
