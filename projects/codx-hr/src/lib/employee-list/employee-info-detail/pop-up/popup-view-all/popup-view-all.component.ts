import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { Component, Input, OnInit, ViewChild, Injector, ChangeDetectorRef, Optional, TemplateRef } from '@angular/core';
import { CRUDService, CodxFormComponent, CodxGridviewComponent, DataService, DialogData, NotificationsService, SortModel, UIComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';

@Component({
  selector: 'lib-popup-view-all',
  templateUrl: './popup-view-all.component.html',
  styleUrls: ['./popup-view-all.component.css']
})
export class PopupViewAllComponent  extends UIComponent implements OnInit {
  
  rowCount: any;
  funcID: any;
  employeeId: any;
  sortModel: SortModel;
  headerText : any;
  dataService: DataService;
  columnGrid: any;
  hasFilter: any;
  formModel: any;
  formGroup: any;
  
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('gridView') gridView: CodxGridviewComponent;
  @ViewChild('filter', { static: true }) filter: TemplateRef<any>;

  @Input() dialog: any;
  onInit(): void {

  }

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.sortModel = data?.data?.sortModel;
    this.columnGrid = data?.data?.columnGrid;
    this.formModel = data?.data?.formModel;
    this.formGroup = data?.data?.formGroup;
    this.hasFilter = data?.data?.hasFilter;
    this.dataService = new DataService(injector);
  }



}
