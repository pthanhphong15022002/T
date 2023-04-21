import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CacheService, AuthStore, ViewModel, ViewType } from 'codx-core';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';

@Component({
  selector: 'lib-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css']
})
export class SearchingComponent implements OnInit {
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  user: any = {};
  constructor(
    private cache: CacheService,
    private hideToolbar: CodxOdService,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
  }
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.itemTemplate
        },
      },
    ];
  }
}
