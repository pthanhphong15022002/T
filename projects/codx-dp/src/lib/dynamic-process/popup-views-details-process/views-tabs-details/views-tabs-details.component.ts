import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'process-views-tabs-details',
  templateUrl: './views-tabs-details.component.html',
  styleUrls: ['./views-tabs-details.component.css'],
})
export class ViewsTabsDetailsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('viewKanban') viewKanban: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;

  @Input() viewMode = '6';
  @Input() dataObj: any;

  funcID: any = 'DPT06';

  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Processes';
  className = 'ProcessesBusiness';
  method = 'LoadDataColumnsAsync';
  idField = 'recID';
  views: Array<ViewModel> = [];
  request: ResourceModel;
  resourceKanban: ResourceModel;
  kanban: any;
  listHeader: any;

  constructor(private inject: Injector) {
    super(inject);
    // this.cache.viewSettings(this.funcID).subscribe((res) => {});
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'DP';
    this.request.assemblyName = 'DP';
    this.request.className = 'ProcessesBusiness';
    this.request.method = 'LoadDataColumnsAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '16',
        type: ViewType.content,
        active: false,
        sameData: false,
        model: {
          panelRightRef: this.itemViewList,
        },
      },
      {
        id: '6',
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
        },
      },
      // {
      //   id: '9',
      //   type: ViewType.chart,
      //   active: true,
      //   sameData: false,
      //   model: {
      //     panelLeftRef: this.flowChart,
      //   },
      // },
    ];
    this.detectorRef.detectChanges();
  }
  viewChanged(e) {
    if ((this.view.currentView as any)?.kanban)
      this.kanban = (this.view.currentView as any)?.kanban;
  }

  getPropertiesHeader(data, type) {
    if (!this.listHeader || this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find ? find[type] : '';
  }

  getPropertyColumn() {
    let dataColumns =
      this.kanban?.columns?.map((column) => {
        return {
          recID: column['dataColums']?.recID,
          icon: column['dataColums']?.icon || null,
          iconColor: column['dataColums']?.iconColor || null,
          backgroundColor: column['dataColums']?.backgroundColor || null,
          textColor: column['dataColums']?.textColor || null,
        };
      }) || [];

    return dataColumns;
  }
}
