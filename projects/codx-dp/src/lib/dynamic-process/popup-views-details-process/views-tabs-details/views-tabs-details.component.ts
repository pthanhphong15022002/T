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
  @ViewChild('cardTitleTmp') cardTitleTmp: TemplateRef<any>;
  @ViewChild('footerKanban') footerKanban: TemplateRef<any>;

  @Input() viewMode = '6';
  @Input() dataObj: any;


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
  dataDrop: any;
  crrStepID: any;
  listType: any = [];

  constructor(private inject: Injector) {
    super(inject);
    this.cache.valueList('DP004').subscribe((res) => {
      if (res && res.datas) this.listType = res?.datas;
    });

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

    this.funcID = 'DPT06';
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
          setColorHeader: true,
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

  getPropertiesHeader(data) {
    if (!this.listHeader || this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find;
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

  onActions(e) {
    switch (e.type) {
      case 'drop':
        // e.data.stepID = this.crrStepID;
        break;
      case 'drag':
        ///bắt data khi kéo
        // this.crrStepID = e?.data?.stepID;

        break;
      case 'dbClick':
        //xư lý dbClick
        break;
    }
  }
  getObjectID(data) {
    return data.roles.find((x) => x.objectID == data?.owner)?.objectID;
  }

  getObjectName(data) {
    return data.roles.find((x) => x.objectID == data?.owner)?.objectName;
  }

  getRolesSteps(data) {
    if (!data.isFailStep && !data.isSuccessStep) {
      if (this.kanban && this.kanban.columns?.length > 0) {
        let idx = this.kanban.columns.findIndex(
          (x) => x.keyField == data.keyField
        );
        if (idx != -1) {
          let roles = this.kanban.columns[idx].dataColums.roles;
          if (roles?.length > 0) {
            return roles.filter((x) => x.roleType == 'S')[0];
          }
        }
      }
    }
    return null;
  }
}
