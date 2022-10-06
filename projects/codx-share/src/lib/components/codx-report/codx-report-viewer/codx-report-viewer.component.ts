// /// <reference types="@boldreports/types/reports.all" />
// import {
//   AfterViewInit,
//   ChangeDetectorRef,
//   Component,
//   EventEmitter,
//   Input,
//   OnChanges,
//   OnInit,
//   Output,
//   SimpleChanges,
//   ViewChild,
//   ViewEncapsulation,
// } from '@angular/core';
// import { Router, Params } from '@angular/router';
// import { BoldReportDesignerComponent } from '@boldreports/angular-reporting-components/reportdesigner.component';
// import { BoldReportViewerComponent } from '@boldreports/angular-reporting-components/reportviewer.component';
// import { ApiHttpService, AuthStore, CallFuncService, DataRequest } from 'codx-core';
// import { CodxExportComponent } from '../../codx-export/codx-export.component';

// @Component({
//   selector: 'codx-report-viewer',
//   templateUrl: './codx-report-viewer.component.html',
//   styleUrls: ['./codx-report-viewer.component.scss'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class CodxReportViewerComponent
//   implements OnInit, AfterViewInit, OnChanges
// {
//   @Input() isViewMode: boolean = true;
//   @Input() showToolbar: boolean = true;
//   @Input() parameters: any = {};
//   @Input() paramRequest: any = [{}];
//   @Input() reportUUID: any = '';
//   @Input() locale: string = 'vi-VN';
//   @Input() print: boolean = false;
//   @Output() editReport = new EventEmitter<any>();
//   @ViewChild('viewer') viewer!: BoldReportViewerComponent;
//   @Input() serviceViewUrl = '';

//   @Input() toolbarViewSettings: any;
//   public isAdmin = true;
//   public exportSettings: any = {};
//   oldParam: any = {};
//   private _user: any;
//   protected changeDetectorRef!: ChangeDetectorRef;
//   constructor(
//     private auth : AuthStore,
//     private api: ApiHttpService,
//     private callfunc: CallFuncService,
//   ) {
//     this._user = this.auth.get();
//     if (
//       !this.toolbarViewSettings ||
//       Object.keys(this.toolbarViewSettings).length == 0
//     ) {
//       this.toolbarViewSettings = {
//         showToolbar: this.showToolbar,
//         customGroups: [
//           {
//             items: [
//               {
//                 type: 'Default',
//                 cssClass:
//                   'e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup',
//                 id: 'edit-report',
//                 // Need to add the proper header and content once, the tool tip issue resolved.
//                 tooltip: {
//                   header: 'Chỉnh sửa',
//                   content: 'Chỉnh sửa báo cáo này trong phần thiết kế báo cáo',
//                 },
//               },
//             ],
//             // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
//             groupIndex: 3,
//             cssClass: 'e-show',
//           },
//         ],
//       };
//     }
//     this.exportSettings = {
//       exportOptions: ej.ReportViewer.ExportOptions.All,
//       customItems: [
//         {
//           index: 7,
//           cssClass: '',
//           value: 'Excel Template',
//         },
//         {
//           index: 8,
//           cssClass: '',
//           value: 'PDF Template',
//         },
//       ],
//     };
//   }
//   ngOnChanges(changes: SimpleChanges): void {
//     if (
//       changes.parameters &&
//       JSON.stringify(changes.parameters.currentValue) !=
//         JSON.stringify(this.oldParam)
//     ) {
//       this.paramRequest = [this.parameters];
//       this.oldParam = JSON.parse(JSON.stringify(this.parameters));
//       this.viewer && (this.viewer.widget as any).reload();
//     }
//     if (changes.print && changes.print.currentValue == true) {
//       this.viewer && (this.viewer.widget as any).print();
//       this.print = false
//     }
//   }
//   ngOnInit(): void {
//     window['$divouter'] = undefined;
//     window['$spanTag'] = undefined;

//   }

//   onAjaxRequest(event:any) {
//     event.headers.push({ Key: 'lvtk', Value: this._user.token });
//   }

//   loaded(evt:any){
//     console.log(evt);

//     if (this.viewer) {
//       this.viewer.exportSettings_input = this.exportSettings;
//     }
//   }
//   ngAfterViewInit(): void {

//   }

//   onToolbarViewerClick(args: any) {
//     if (args.value === 'edit-report') {
//       this.editReport.emit(this.reportUUID);
//     }
//   }

//   //Export click event handler
//   onExportItemClick(event: any) {
//     if (event.value === 'Excel Template') {
//       let reportItem;
//       this.api.exec("SYS",
//       "ReportListBusiness",
//       "GetByReportIDAsync",
//        this.reportUUID).subscribe(res => {
//         reportItem = res;
//         let gridModel = new DataRequest();
//         gridModel.formName = "";
//         gridModel.entityName = reportItem.entityName;
//         gridModel.funcID = this.reportUUID;
//         gridModel.gridViewName = "";
//         gridModel.page = 0;
//         gridModel.pageSize = 5000;
//         //Chưa có group
//         gridModel.groupFields = "createdBy";
//         this.callfunc.openForm(CodxExportComponent,null,null,800,"",[gridModel,reportItem.recID],null);
//       })




//     } else if (event.value === 'PDF Template') {
//       //Implement the code to export report as DOT
//       alert('PDF export option clicked');
//       console.log(this.reportUUID);

//     }
//   }
// }
