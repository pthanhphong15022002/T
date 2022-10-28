import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  ConnectorModel,
  Diagram,
  DiagramComponent,
  DiagramTools,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';

@Component({
  selector: 'lib-reportingline-orgchart',
  templateUrl: './reportingline-orgchart.component.html',
  styleUrls: ['./reportingline-orgchart.component.css']
})
export class ReportinglineOrgChartComponent implements OnInit, AfterViewInit {

  employees:any[] = [];
  employeeInfor:any = null;

  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 30,
    horizontalSpacing: 40,
    enableAnimation: true,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  datasetting: any = null;


  constructor() { }
  

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
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
    return obj;
  }

  orgClick(event){

  }

  showEmploy(pemp, emp){

  }

  onSearch($event){
    
  }
}
