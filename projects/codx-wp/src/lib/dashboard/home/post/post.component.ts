import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LIST_TYPE } from '@syncfusion/ej2-angular-richtexteditor';
import { Thickness } from '@syncfusion/ej2-charts';
import { CRUDService, SortModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';

@Component({
  selector: 'wp-lib-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent extends UIComponent {
  views: Array<ViewModel> | any = [];
  dataService:CRUDService = null;
  predicate: string = '(ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)) && Stop =false && Category !=@3';
  dataValue: string = '0;1;5;2';
  @ViewChild("content") content : TemplateRef<any>;
  constructor
  (
    private injector: Injector
  ) 
  {
    super(injector);
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.content
        }
      },
    ];
    this.detectorRef.detectChanges();
  }

  onInit()
  {
    this.dataService = new CRUDService(this.injector);
    this.dataService.predicate = this.predicate;
    this.dataService.dataValue = this.dataValue;
    let arrSort:SortModel[] = [];
    let sort = new SortModel();
    sort.field = "CreatedOn";
    sort.dir = "desc";
    arrSort.push(sort);
    this.dataService.setSort(arrSort);
    this.dataService.pageSize = 7;
    this.detectorRef.detectChanges();
  }


}
