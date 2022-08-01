import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIComponent, ViewType } from 'codx-core';

@Component({
  selector: 'lib-meeting-detail',
  templateUrl: './meeting-detail.component.html',
  styleUrls: ['./meeting-detail.component.css']
})
export class MeetingDetailComponent extends UIComponent implements OnDestroy {

  funcID = '';
  views = [];
  recID: any;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  }
  dataValue = '';

  constructor(
    private injector: Injector,
    private TMService: CodxTMService,
    private route: ActivatedRoute,
  ) {
    super(injector);
    this.route.params.subscribe(params => {
      if (params)
        this.funcID = params['funcID'];
    })
    this.cache.functionList(this.funcID).subscribe(res => {
      if (res) {
        this.functionList.formName = res.formName;
        this.functionList.gridViewName = res.gridViewName;
        this.functionList.entityName = res.entityName;
      }
    })
    this.TMService.hideAside.next(false);

  }

  ngOnDestroy(): void {
    this.TMService.hideAside.next(true);
  }

  onInit(): void {
    this.getQueryParams();
  }


  getQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.recID = params.recID;
        this.dataValue = this.recID;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
      }
    }];
  }
}
