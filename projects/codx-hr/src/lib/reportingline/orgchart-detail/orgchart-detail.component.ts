import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ConnectorModel, Diagram, DiagramTools, NodeModel, SnapConstraints, SnapSettingsModel } from '@syncfusion/ej2-angular-diagrams';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-orgchart-detail',
  templateUrl: './orgchart-detail.component.html',
  styleUrls: ['./orgchart-detail.component.css']
})
export class OrgchartDetailComponent implements OnInit,AfterViewInit {
  @Input() onlyDepartment?: boolean;
  @Output() evtAfterViewInit = new EventEmitter;
  datasetting: any = null;
  tool: DiagramTools = DiagramTools.ZoomPan;
  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 30,
    horizontalSpacing: 40,
    enableAnimation: true,
  };
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  employOrg: any = [];
  employees: any = [];
  count = 0;
  @ViewChild('p') public popover: NgbPopover;


  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.evtAfterViewInit.emit(this);
  }
  loadEmploy(el) {
    var dataset = el[0].dataset;
    this._loadEmploy(el, dataset.orgid, dataset.status);
  }

  _loadEmploy(el, orgid, status) {
    this.popover['_elementRef'] = new ElementRef(el[0]);
    if (this.popover.isOpen()) {
      this.popover.close();
    }

    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetEmployeeListByOrgAsync',
        [orgid, status, '', this.onlyDepartment, 0]
      )
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 0) {
            this.employOrg = [];
            this.employees = res[0];
            this.count = res[1];

            var obj: any = {};

            this.changeDetectorRef.detectChanges();

            this.popover.open();
          }
        }
      });
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

}
