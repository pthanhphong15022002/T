import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ClickEventArgs } from '@syncfusion/ej2-angular-buttons';
import {
  ConnectorModel,
  Diagram,
  DiagramTools,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { ApiHttpService } from 'codx-core';
import { map, Observable } from 'rxjs';
let data: any[] = [
  { Name: 'Species', fillColor: '#3DD94A' },
  { Name: 'Plants', Category: 'Species' },
  { Name: 'Fungi', Category: 'Species' },
  { Name: 'Lichens', Category: 'Species' },
  { Name: 'Animals', Category: 'Species' },
  { Name: 'Mosses', Category: 'Plants' },
  { Name: 'Ferns', Category: 'Plants' },
  { Name: 'Gymnosperms', Category: 'Plants' },
  { Name: 'Dicotyledens', Category: 'Plants' },
  { Name: 'Monocotyledens', Category: 'Plants' },
  { Name: 'Invertebrates', Category: 'Animals' },
  { Name: 'Vertebrates', Category: 'Animals' },
  { Name: 'Insects', Category: 'Invertebrates' },
  { Name: 'Molluscs', Category: 'Invertebrates' },
  { Name: 'Crustaceans', Category: 'Invertebrates' },
  { Name: 'Others', Category: 'Invertebrates' },
  { Name: 'Fish', Category: 'Vertebrates' },
  { Name: 'Amphibians', Category: 'Vertebrates' },
  { Name: 'Reptiles', Category: 'Vertebrates' },
  { Name: 'Birds', Category: 'Vertebrates' },
  { Name: 'Mammals', Category: 'Vertebrates' },
];
@Component({
  selector: 'lib-organize-detail',
  templateUrl: './organize-detail.component.html',
  styleUrls: ['./organize-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizeDetailComponent implements OnInit, OnChanges {
  @Input() width = 260;
  @Input() height = 300;
  @Input() maxWidth = 300;
  @Input() maxHeight = 300;
  @Input() minWidth = 100;
  @Input() minHeight = 300;
  @Input() node?: any;
  @Input() orgUnitID!: string;
  @Input() numberLV: string = '3';
  @Input() parentID: string = '';
  @Input() onlyDepartment?: boolean;

  data: any[] = [];
  datasetting: any = null;
  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 30,
    horizontalSpacing: 40,
    enableAnimation: true,
  };
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.datasetting = {
      id: 'departmentCode',
      parentId: 'parentID',
      dataManager: new DataManager(this.data as JSON[]),
      //binds the external data with node
      doBinding: (nodeModel: NodeModel, data: any, diagram: Diagram) => {
        nodeModel.data = data;
        nodeModel.borderWidth = 1;
        nodeModel.width = this.width;
        nodeModel.height = this.height;
        nodeModel.maxWidth = this.maxWidth;
        nodeModel.maxHeight = this.maxHeight;
        nodeModel.minWidth = this.minWidth;
        nodeModel.minHeight = this.minHeight;
        nodeModel.shape = {
          type: 'HTML',
          content: '',
          data: data,
        };
      },
    };
    // this.loadOrgchart().subscribe((res) => {
    //   if (res) {
    //     this.data = res.Data as any[];
    //     this.datasetting.dataManager = new DataManager(this.data as JSON[]);
    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadOrgchart().subscribe((res) => {
      if (res) {
        this.data = res.Data as any[];
        this.datasetting.dataManager = new DataManager(this.data as JSON[]);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadOrgchart(): Observable<any> {
    return this.api
      .callSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetDataDiagramAsync',
        [
          this.orgUnitID,
          this.numberLV,
          this.parentID,
          this.onlyDepartment,
          true,
        ]
      )
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        })
      );
  }

  public connDefaults(
    connector: ConnectorModel,
    diagram: Diagram
  ): ConnectorModel {
    connector.targetDecorator!.shape = 'None';
    connector.type = 'Orthogonal';
    connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style!.strokeColor = '#6d6d6d';
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    // obj.expandIcon = {
    //   height: 10,
    //   width: 10,
    //   shape: 'Plus',
    //   fill: 'lightgray',
    //   offset: { x: 0.5, y: 1 },
    // };
    // obj.collapseIcon = {
    //   height: 10,
    //   width: 10,
    //   shape: 'Minus',
    //   fill: 'lightgray',
    //   offset: { x: 0.5, y: 1 },
    // };

    // // return obj;
    return obj;
  }
  public click(arg: ClickEventArgs) {
    console.log(arg.element?.id);
  }

  test(data) {
    debugger;
  }
}
