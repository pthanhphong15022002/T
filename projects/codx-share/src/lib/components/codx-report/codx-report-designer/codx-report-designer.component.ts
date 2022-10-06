// /// <reference types="@boldreports/types/reports.all" />
// import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
// import { BoldReportDesignerComponent } from '@boldreports/angular-reporting-components/reportdesigner.component';
// import { AuthStore } from 'codx-core';

// @Component({
//   selector: 'codx-report-designer',
//   templateUrl: './codx-report-designer.component.html',
//   styleUrls: ['./codx-report-designer.component.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class CodxReportDesignerComponent implements OnInit, AfterViewInit {
//   @ViewChild('designer') designerInst!: BoldReportDesignerComponent;
//   @Input() serviceDesignUrl: string = '';
//   @Input() toolbarDesignSettings: any;
//   @Input()  reportUUID: any = '';
//   @Input() isAdmin: boolean = true;
//   @Input() showToolbar: boolean = true;
//   @Input() locale: string = 'vi-VN';
//   @Input() permissionSettings!: any ;
//   @Output() viewerMode = new EventEmitter<any>();
//   private _user: any;
//   constructor(private auth : AuthStore) {
//     this._user = this.auth.get();
//   }
//   ngOnInit(): void {
//     if(!this.toolbarDesignSettings || Object.keys(this.toolbarDesignSettings).length == 0){
//       if(this.isAdmin == false){
//         this.toolbarDesignSettings = {
//           showToolbar: false,
//           items: ~ej.ReportDesigner.ToolbarItems.All
//         }
//         if(!this.permissionSettings || Object.keys(this.permissionSettings).length === 0){
//           this.permissionSettings = { dataSet: ~ej.ReportDesigner.Permission.All }
//         }
//       }
//       else {
//         this.toolbarDesignSettings = {
//           showToolbar: this.showToolbar,
//           items: ej.ReportDesigner.ToolbarItems.All &
//            ~ej.ReportDesigner.ToolbarItems.New &
//            ~ej.ReportDesigner.ToolbarItems.Open
//         }
//         if(!this.permissionSettings || Object.keys(this.permissionSettings).length === 0){
//           this.permissionSettings = { dataSet: ej.ReportDesigner.Permission.All }
//         }
//       }
//     }
//   }

//   ngAfterViewInit(): void {
//     if(this.designerInst && this.reportUUID){
//       this.designerInst.widget.openReport(this.reportUUID);
//     }


//   }




// onToolbarDesignerRendering(args:any): void {
//     // if(this.isAdmin == false)
//     //   if ($(args.target).hasClass('e-rptdesigner-toolbarcontainer')) {
//     //     const saveButton = (ej as any).buildTag('li.e-rptdesigner-toolbarli e-designer-toolbar-align e-tooltxt', '', {}, {});
//     //     const saveIcon = (ej as any).buildTag('span.e-rptdesigner-toolbar-icon e-toolbarfonticonbasic e-rptdesigner-toolbar-save e-li-item',
//     //       '', {}, { title: 'Save' });

//     //     const openButton = (ej as any).buildTag('li.e-rptdesigner-toolbarli e-designer-toolbar-align e-tooltxt', '', {}, {});
//     //     const openIcon = (ej as any).buildTag('span.e-rptdesigner-toolbar-icon e-toolbarfonticonbasic e-rptdesigner-toolbar-open e-li-item','', {}, { title: 'Open' });
//     //     //args.target.find('ul:first').append(openButton.append(openIcon));
//     //     args.target.find('ul:first').append(saveButton.append(saveIcon));
//     //   }

//     // if ($(args.target).hasClass('e-rptdesigner-toolbarcontainer')) {
//     //       const viewButton = (ej as any).buildTag('li.e-rptdesigner-toolbarli e-designer-toolbar-align e-tooltxt', '', {}, {});
//     //       const viewIcon = (ej as any).buildTag('span.e-rptdesigner-toolbar-icon e-toolbarfonticonbasic e-rptdesigner-toolbar-preview e-li-item',
//     //         '', {}, { title: 'Xem báo cáo' });
//     //       //args.target.find('ul:first').append(openButton.append(openIcon));
//     //       args.target.find('ul:eq(9)').append(viewButton.append(viewIcon));
//     //   }
// }

// onToolbarDesignerClick(args:any) {

//       if (args.event.click === 'Save') {
//         args.event.cancel = true;
//         args.designerInst.widget.saveReport();
//       }
//       if(args.event.click === 'External'){
//         this,this.viewerMode.emit(true);
//       }
// }

// onAjaxBeforeLoad(args:any) {
//   args.headers && args.headers.push({ Key: 'lvtk', Value: this._user.token });
//     args.data = JSON.stringify({ reportType: "RDL" });
// }

// onPreview(evt: any){
//   console.log(evt);

// }
// }
