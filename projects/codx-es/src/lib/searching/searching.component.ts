import { Component, OnInit, ViewChild } from '@angular/core';
import { CacheService } from 'codx-core';
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
  constructor(
    private cache: CacheService,
    private hideToolbar: CodxOdService
  ) {}

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
}
