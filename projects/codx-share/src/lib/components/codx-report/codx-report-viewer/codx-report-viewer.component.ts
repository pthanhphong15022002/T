/// <reference types="@boldreports/types/reports.all" />
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, Params } from '@angular/router';
import { BoldReportDesignerComponent } from '@boldreports/angular-reporting-components/reportdesigner.component';
import { BoldReportViewerComponent } from '@boldreports/angular-reporting-components/reportviewer.component';


@Component({
  selector: 'codx-report-viewer',
  templateUrl: './codx-report-viewer.component.html',
  styleUrls: ['./codx-report-viewer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CodxReportViewerComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() isViewMode: boolean = true;
  @Input() showToolbar: boolean = true;
  @Input() parameters: any = {};
  @Input() reportUUID: any = '';
  @Input() locale!: string ;
  @Output() editReport = new EventEmitter<any>();
  @ViewChild('viewer') viewer!: BoldReportViewerComponent;
  @Input() serviceViewUrl = '';

  @Input() toolbarViewSettings: any;
  public isAdmin = true;
  public paramRequest:any = {};
  protected changeDetectorRef!: ChangeDetectorRef;
  constructor() {
    if(!this.toolbarViewSettings || Object.keys(this.toolbarViewSettings).length == 0){
      this.toolbarViewSettings = {
        showToolbar: this.showToolbar,
        customGroups: [{
          items: [{
            type: 'Default',
            cssClass: 'e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup',
            id: 'edit-report',
            // Need to add the proper header and content once, the tool tip issue resolved.
            tooltip: {
              header: 'Chỉnh sửa',
              content: 'Chỉnh sửa báo cáo này trong phần thiết kế báo cáo'
            }
          }],
          // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
          groupIndex: 3,
          cssClass: 'e-show'
        }]

      };
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.toolbarViewSettings = {
      showToolbar: this.showToolbar,
      customGroups: [{
        items: [{
          type: 'Default',
          cssClass: 'e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup',
          id: 'edit-report',
          // Need to add the proper header and content once, the tool tip issue resolved.
          tooltip: {
            header: 'Chỉnh sửa',
            content: 'Chỉnh sửa báo cáo này trong phần thiết kế báo cáo'
          }
        }],
        // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
        groupIndex: 3,
        cssClass: 'e-show'
      }]

    };

  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }


  onToolbarViewerClick (args:any) {
    if (args.value === 'edit-report') {
      this.editReport.emit(this.reportUUID);
    }
  }
}
