import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthStore, CacheService } from 'codx-core';
import { CodxOdService } from 'projects/codx-od/src/lib/codx-od.service';
import {
  convertHtmlAgency,
  getIdUser,
} from 'projects/codx-od/src/lib/function/default.function';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
import { extractContent } from '../function/default.function';

@Component({
  selector: 'lib-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.scss'],
})
export class SearchingComponent implements OnInit {
  @ViewChild('view') view: CodxFullTextSearch;

  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  funcID = 'EST03';
  service = 'ES';
  entityName = 'ES_SignFiles';
  formModel: any = {};

  user: any = {};
  constructor(
    private cache: CacheService,
    private hideToolbar: CodxOdService,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.getGridViewSetup();
  }

  getGridViewSetup() {
    this.cache.functionList(this.funcID).subscribe((fuc) => {
      this.formModel.entityName = fuc?.entityName;
      this.formModel.formName = fuc?.formName;
      this.formModel.funcID = fuc?.functionID;
      this.formModel.gridViewName = fuc?.gridViewName;
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetup = grd;
        });
    });
  }

  onSelected(e: any) {
    alert(JSON.stringify(e));
  }

  isBookmark(data) {
    let bookmarked = false;
    let lstBookmark = data?.bookmarks;
    if (lstBookmark) {
      let isbookmark = lstBookmark.filter(
        (p) => p.objectID == this.user.userID
      );
      if (isbookmark?.length > 0) {
        bookmarked = true;
      }
    }
    return bookmarked;
  }
}
