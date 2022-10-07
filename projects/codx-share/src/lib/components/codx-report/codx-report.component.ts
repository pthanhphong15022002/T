// import { environment } from './../../../../../../src/environments/environment';
// /// <reference types="@boldreports/types/reports.all" />
// import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
// import { Router, Params } from '@angular/router';
// import { BoldReportDesignerComponent } from '@boldreports/angular-reporting-components/reportdesigner.component';
// import { BoldReportViewerComponent } from '@boldreports/angular-reporting-components/reportviewer.component';
// import { AuthStore } from 'codx-core';

// @Component({
//   selector: 'codx-report',
//   templateUrl: './codx-report.component.html',
//   styleUrls: ['./codx-report.component.scss']
// })
// export class CodxReportComponent implements OnInit, AfterViewInit, OnChanges {
//   @ViewChild('designer') designerInst!: BoldReportDesignerComponent;
//   @ViewChild('viewer') viewer!: BoldReportViewerComponent;
//   @Input() isViewMode: boolean = true;
//   @Input() showToolbar: boolean = true;
//   @Input() print: boolean = false;
//   @Input() parameters: any = {};
//   @Input() reportUUID: any = '';
//   @Input() locale!: string;
//   @Input() serviceDesignUrl: string = environment.apiUrl + '/api/ReportDesigner';
//   @Input() serviceViewUrl: string = environment.apiUrl + '/api/ReportViewer';
//   @Input() toolbarDesignSettings: any;
//   @Input() toolbarViewSettings: any;
//   public isAdmin = true;
//   _user: any;
//   protected changeDetectorRef!: ChangeDetectorRef;
//   constructor(
//     private auth: AuthStore,
//   ) {
//     this._user = this.auth.get();
//     this.serviceViewUrl = environment.apiUrl + '/api/ReportViewer';
//     this.serviceDesignUrl = environment.apiUrl + '/api/ReportDesigner';
//     this.toolbarViewSettings = {
//       showToolbar: this.showToolbar,
//       customGroups: [{
//         items: [{
//           type: 'Default',
//           cssClass: 'e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup',
//           id: 'edit-report',
//           // Need to add the proper header and content once, the tool tip issue resolved.
//           tooltip: {
//             header: 'Chỉnh sửa',
//             content: 'Chỉnh sửa báo cáo này trong phần thiết kế báo cáo'
//           }
//         }],
//         // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
//         groupIndex: 3,
//         cssClass: 'e-show'
//       }]

//     };
//     if (this.isAdmin == false) {
//       this.toolbarDesignSettings = {
//         showToolbar: false,
//         items: ~ej.ReportDesigner.ToolbarItems.All
//       }
//     }
//     else {
//       this.toolbarDesignSettings = {
//         showToolbar: this.showToolbar,
//         items: ej.ReportDesigner.ToolbarItems.All &
//           ~ej.ReportDesigner.ToolbarItems.New &
//           ~ej.ReportDesigner.ToolbarItems.Open
//       }
//     }

//     //this.reportUUID = '3cdcde9d-8d64-ec11-941d-00155d035518';
//   }
//   ngOnChanges(changes: SimpleChanges): void {
//     if (Object.keys(this.parameters).length == 0) {
//       //   this.parameters.name = "Tèo";
//       // this.parameters.address = "HCM, VN";
//       // this.parameters.age = 17;
//     }
//   }
//   ngOnInit(): void {
//     if (!this.locale) {
//       this.locale = 'vi-VN';
//     }
//   }
//   dataSource: any = {
//     connectionString: "Host=172.16.7.31;Port=5432;",
//     isIntegrated: false,
//     password: "Erm@2021",
//     provider: "PostgreSQL",
//     securityType: "DataBase",
//     username: "postgres"
//   }
//   ngAfterViewInit(): void {

//   }

//   onEditReport(evt: any) {
//     this.isViewMode = false;
//     this.reportUUID = evt;
//   }
//   viewReport() {
//     this.isViewMode = true;
//   }
// }
