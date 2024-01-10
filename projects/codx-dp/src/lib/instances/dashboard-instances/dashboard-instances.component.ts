import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AccumulationChartComponent } from '@syncfusion/ej2-angular-charts';
import {
  AuthStore,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'new-dashboard-instances',
  templateUrl: './dashboard-instances.component.html',
  styleUrls: ['./dashboard-instances.component.css'],
})
export class DashboardInstancesComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChildren('template1') dashBoard1: QueryList<any>;
  @ViewChildren('template2') dashBoard2: QueryList<any>;
  @ViewChild('template') template: TemplateRef<any>;

  @ViewChild('accumulationPipe') accumulationPipe: AccumulationChartComponent;
  @Input() vllStatus: any;
  @Input() processID = '';
  //#region settings
  panels1 = [
    {
      id: '10.1636284528927885_layout',
      row: 0,
      col: 0,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '20.5801149283702021_layout',
      row: 0,
      col: 12,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '30.6937258303982936_layout',
      row: 0,
      col: 24,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '40.5667390469747078_layout',
      row: 0,
      col: 36,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '50.4199281088325755_layout',
      row: 3,
      col: 0,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Cơ hội theo giai đoạn',
    },
    {
      id: '60.4592017601751599_layout',
      row: 3,
      col: 16,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Top nhân viên có nhiều cơ hội thành công nhất',
    },
    {
      id: '70.14683256767762543_layout',
      row: 3,
      col: 32,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê năng suất nhân viên',
    },
    {
      id: '80.36639064171709834_layout',
      row: 11,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thành công',
    },
    {
      id: '90.06496875406606994_layout',
      row: 17,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thất bại',
    },
    {
      id: '100.21519762020962552_layout',
      row: 11,
      col: 16,
      sizeX: 32,
      sizeY: 12,
      minSizeX: 32,
      minSizeY: 12,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê hiệu suất trong năm',
    },
  ];
  datas1 = [
    {
      panelId: '10.1636284528927885_layout',
      data: '1',
    },
    {
      panelId: '20.5801149283702021_layout',
      data: '2',
    },
    {
      panelId: '30.6937258303982936_layout',
      data: '3',
    },
    {
      panelId: '40.5667390469747078_layout',
      data: '4',
    },
    {
      panelId: '50.4199281088325755_layout',
      data: '5',
    },
    {
      panelId: '60.4592017601751599_layout',
      data: '6',
    },
    {
      panelId: '70.14683256767762543_layout',
      data: '7',
    },
    {
      panelId: '80.36639064171709834_layout',
      data: '8',
    },
    {
      panelId: '90.06496875406606994_layout',
      data: '9',
    },
    {
      panelId: '100.21519762020962552_layout',
      data: '10',
    },
  ];
  panels2 = [
    {
      id: '10.1636284528927885_layout',
      row: 0,
      col: 0,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '20.5801149283702021_layout',
      row: 0,
      col: 12,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '30.6937258303982936_layout',
      row: 0,
      col: 24,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '40.5667390469747078_layout',
      row: 0,
      col: 36,
      sizeX: 12,
      sizeY: 3,
      minSizeX: 12,
      minSizeY: 3,
      maxSizeX: null,
      maxSizeY: null,
    },
    {
      id: '50.4199281088325755_layout',
      row: 3,
      col: 0,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Cơ hội theo giai đoạn',
    },
    {
      id: '60.4592017601751599_layout',
      row: 3,
      col: 16,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Top nhân viên có nhiều cơ hội thành công nhất',
    },
    {
      id: '70.14683256767762543_layout',
      row: 3,
      col: 32,
      sizeX: 16,
      sizeY: 8,
      minSizeX: 16,
      minSizeY: 8,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê năng suất nhân viên',
    },
    {
      id: '80.36639064171709834_layout',
      row: 11,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thành công',
    },
    {
      id: '90.06496875406606994_layout',
      row: 17,
      col: 0,
      sizeX: 16,
      sizeY: 6,
      minSizeX: 16,
      minSizeY: 6,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Lý do thất bại',
    },
    {
      id: '100.21519762020962552_layout',
      row: 11,
      col: 16,
      sizeX: 32,
      sizeY: 12,
      minSizeX: 32,
      minSizeY: 12,
      maxSizeX: null,
      maxSizeY: null,
      // header: 'Thống kê hiệu suất trong năm',
    },
  ];
  datas2 = [
    {
      panelId: '10.1636284528927885_layout',
      data: '1',
    },
    {
      panelId: '20.5801149283702021_layout',
      data: '2',
    },
    {
      panelId: '30.6937258303982936_layout',
      data: '3',
    },
    {
      panelId: '40.5667390469747078_layout',
      data: '4',
    },
    {
      panelId: '50.4199281088325755_layout',
      data: '5',
    },
    {
      panelId: '60.4592017601751599_layout',
      data: '6',
    },
    {
      panelId: '70.14683256767762543_layout',
      data: '7',
    },
    {
      panelId: '80.36639064171709834_layout',
      data: '8',
    },
    {
      panelId: '90.06496875406606994_layout',
      data: '9',
    },
    {
      panelId: '100.21519762020962552_layout',
      data: '10',
    },
  ];
  //#endregion

  isLoaded = true;
  isEditMode = false; //có thể change setting

  viewType = '1'; //test
  views: Array<ViewModel> = [];
  arrReport: any = [];
  reportItem: any;
  reportID: any;

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private authstore: AuthStore,
    private renderer: Renderer2
  ) {
    super(inject);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.chart,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,
        model: {
          panelRightRef: this.template,
        },
      },
    ];
    this.pageTitle.setBreadcrumbs([]);

    this.router.params.subscribe((res) => {
      if (res.funcID) {
        this.reportID = res.funcID;
        this.isLoaded = false;
        let reportItem = this.arrReport.find((x: any) => x.recID == res.funcID);
        if (reportItem) {
          this.reportItem = reportItem;
          this.funcID = reportItem?.reportID;
          let method: string = '';
          switch (
            this.reportID
            // case 'CMD001':
            //   //dashboard moi
            //   //dashboard moi
            //   // this.getDashBoardTargets();
            //   this.isLoaded = true;
            //   this.getDataset('GetDashBoardTargetAsync', null, null, null);
            //   break;
            // // nhom chua co tam
            // case 'CMD002':
            //   // code cũ chạy tạm
            //   //this.getDataDashboard();
            //   this.getDataset('GetReportSourceAsync', null, null, null);
            //   break;
            // //ca nhan chua co ne de vay
            // case 'CMD003':
            //   // code cũ chạy tạm
            //   // let predicates = 'Owner =@0';
            //   // let dataValues = this.user.userID;
            //   // // this.getDataDashboard(predicates, dataValues);
            //   //test DataSet
            //   this.getDataset(
            //     'GetReportSourceAsync',
            //     null,
            //     '@0.Contains(Owner)',
            //     this.user.userID
            //   );
            //   break;
            // // target
            // case 'CMD004':
            //   this.isLoaded = true;
            //   break;
          ) {
          }
        }
      }
    });
    this.detectorRef.detectChanges();
  }
  onInit(): void {}

  filterChange(e: any) {
    this.isLoaded = false;
    let { predicates, dataValues } = e[0];
    const param = e[1];
    //if (this.subscription) this.subscription.unsubscribe();
    let method: any = '';
    if (!this.funcID) return;
    switch (
      this.funcID
      // case 'CMD001':
      //   //dashboard moi
      //   // this.getDashBoardTargets();
      //   method = 'GetDashBoardTargetAsync';
      //   this.getDataset(method, param);
      //   break;
      // // nhom chua co tam
      // case 'CMD002':
      //   //this.getDataDashboard(predicates, dataValues, param);
      //   this.getDataset('GetReportSourceAsync', param);
      //   break;
      // //ca nha chua co ne de vay
      // case 'CMD003':
      //   // let length = dataValues.split(';')?.length ?? 0;

      //   // let predicate =
      //   //   length == 0 ? 'Owner =@' + length : ' and ' + 'Owner =@' + length;
      //   // let dataValue = length == 0 ? this.user.userID : ';' + this.user.userID;

      //   // predicates += predicate;
      //   // dataValues += dataValue;
      //   // this.getDataDashboard(predicates, dataValues, param);
      //   this.getDataset('GetReportSourceAsync', param);
      //   break;
      // // target
      // case 'CMD004':
      //   this.isLoaded = true;
      //   break;
    ) {
    }
    this.detectorRef.detectChanges();
  }

  onActions(e) {
    if (e.type == 'reportLoaded') {
      //moi theo report
      this.arrReport = e.data;
      if (this.arrReport.length) {
        this.cache
          .functionList(
            this.arrReport[0].moduleID + this.arrReport[0].reportType
          )
          .subscribe((res: any) => {
            if (res) {
              this.pageTitle.setRootNode(res.customName);
              this.pageTitle.setParent({
                title: res.customName,
                path: res.url,
              });
              let arrChildren: any = [];
              for (let i = 0; i < this.arrReport.length; i++) {
                arrChildren.push({
                  title: this.arrReport[i].customName,
                  // path: 'cm/dashboard/' + this.arrReport[i].reportID,  //trầm kêu có thể trùn reportID
                  path: 'cm/dashboard/' + this.arrReport[i].recID, //chuẩn theo Trầm
                });
              }

              this.isLoaded = false;
              this.pageTitle.setBreadcrumbs([]);
              if (!this.reportItem) {
                if (this.reportID) {
                  let idx = this.arrReport.findIndex(
                    (x: any) => x.recID == this.reportID
                  );
                  if (idx != -1) {
                    this.reportItem = this.arrReport[idx];
                    this.pageTitle.setSubTitle(arrChildren[idx].title);
                    this.pageTitle.setChildren(arrChildren);
                    this.funcID = this.reportItem.reportID;
                  } else {
                    this.reportItem = this.arrReport[0];
                    this.pageTitle.setSubTitle(arrChildren[0].title);
                    this.pageTitle.setChildren(arrChildren);
                    this.codxService.navigate('', arrChildren[0].path);
                    this.funcID = this.arrReport[0].reportID;
                  }
                } else {
                  this.reportItem = this.arrReport[0];
                  this.pageTitle.setSubTitle(arrChildren[0].title);
                  this.pageTitle.setChildren(arrChildren);
                  this.codxService.navigate('', arrChildren[0].path);
                  this.funcID = this.arrReport[0].reportID;
                }

                switch (this.funcID) {
                }

                this.detectorRef.detectChanges();
              }
            }
          });
      }
    }
  }
}
