import {
  AfterViewInit,
  Injector,
  Input,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import {
  ButtonModel,
  DialogModel,
  NotificationsService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';

export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValues: string;
  predicates: string;
}

@Component({
  selector: 'app-dmdashboard',
  templateUrl: './dmdashboard.component.html',
  styleUrls: ['./dmdashboard.component.scss'],
})
export class DMDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('panel') lstPanels: QueryList<any>;
  @ViewChildren('my_dashboard') templates1: QueryList<any>;
  @Input() panels1: any;
  @Input() datas1: any;
  views: Array<ViewModel> = [];
  buttons: Array<ButtonModel> = [];
  funcID: string = 'DMD';
  reportID: string = 'DMD001';
  arrReport: any = [];
  dbData;
  isLoaded = false;
  isEditMode = false;

  public chartData: Object[] = [
    { orgUnitID: 'ORG-0000', pdf: 35, docx: 10, xlsx: 15 },
    { orgUnitID: 'ORG-0001', pdf: 28, docx: 20 },
    { orgUnitID: 'ORG-0002', pdf: 34, docx: 30 },
    { orgUnitID: 'ORG-0003', pdf: 32, docx: 40 },
    { orgUnitID: 'ORG-0001', exe: 16 },
  ];

  public primaryXAxis: Object = {
    valueType: 'Category',
  };

  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    private routerActive: ActivatedRoute,
    private fileService: FileService,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.panels1 = JSON.parse(
      '[{"id":"0.9605255352952085_layout","row":0,"col":0,"sizeX":12,"sizeY":22,"minSizeX":12,"minSizeY":22,"maxSizeX":null,"maxSizeY":null, "header": "Thống kê dung lượng tài liệu tải lên"},{"id":"0.47112877938374287_layout","row":0,"col":12,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header":"Tài liệu theo phân hệ"},{"id":"0.7647024471772221_layout","row":0,"col":24,"sizeX":12,"sizeY":12,"minSizeX":12,"minSizeY":12,"maxSizeX":null,"maxSizeY":null, "header": "Thống kê tài liệu theo bộ phận"},{"id":"0.6213687501730532_layout","row":12,"col":12,"sizeX":24,"sizeY":10,"minSizeX":24,"minSizeY":10,"maxSizeX":null,"maxSizeY":null, "header":"Thống kê mức độ sử dụng tài liệu theo bộ phận"},{"id":"0.7292886175486251_layout","row":0,"col":36,"sizeX":12,"sizeY":22,"minSizeX":12,"minSizeY":22,"maxSizeX":null,"maxSizeY":null, "header":"Top tài liệu"}]'
    );
    this.datas1 = JSON.parse(
      '[{"panelId":"0.9605255352952085_layout","data":"1"},{"panelId":"0.47112877938374287_layout","data":"2"},{"panelId":"0.7647024471772221_layout","data":"3"},{"panelId":"0.6213687501730532_layout","data":"4"},{"panelId":"0.7292886175486251_layout","data":"5"}]'
    );
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
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
    this.routerActive.queryParams.subscribe((res) => {
      if (res.reportID) {
        this.reportID = res.reportID;
        this.isLoaded = false;
        let reportItem: any = this.arrReport.find(
          (x: any) => x.reportID == res.reportID
        );
        if (reportItem) {
          let pinnedParams = reportItem.parameters?.filter((x: any) => x.isPin);
          if (pinnedParams) this.view.pinedReportParams = pinnedParams;
        }
        switch (res.reportID) {
          case 'DMD001':
            this.getDashboardData();
            break;
          default:
            break;
        }
      }
    });
    this.detectorRef.detectChanges();
  }

  getDashboardData(predicates?: string, dataValues?: string, params?: any) {
    let model = new GridModels();
    model.funcID = this.funcID;
    model.entityName = 'TM_Tasks';
    model.predicates = predicates;
    model.dataValues = dataValues;

    this.api
      .exec('DM', 'FileBussiness', 'GetDataDashboardAsync', [])
      .subscribe((res) => {
        this.dbData = res;

        setTimeout(() => {
          this.isLoaded = true;
        }, 500);
      });

    this.detectorRef.detectChanges();
  }

  filterChange(e: any) {
    this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];

    switch (this.reportID) {
      case 'DMD001':
        this.getDashboardData(predicates, dataValues, param);
        break;
      default:
        break;
    }

    this.detectorRef.detectChanges();
  }

  onActions(e: any) {
    if (e.type == 'reportLoaded') {
      this.arrReport = e.data;
      if (this.arrReport.length) {
        let arrChildren: any = [];
        for (let i = 0; i < this.arrReport.length; i++) {
          arrChildren.push({
            title: this.arrReport[i].customName,
            path: 'dm/dmdashboard/DMD?reportID=' + this.arrReport[i].reportID,
          });
        }
        this.pageTitle.setSubTitle(arrChildren[0].title);
        this.pageTitle.setChildren(arrChildren);
        this.codxService.navigate('', arrChildren[0].path);
      }
    }
    this.isLoaded = false;
  }

  newGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  toFixed(value: number) {
    return value % 1 === 0 ? value : value.toFixed(2);
  }

  getAvatar(ex: string) {
    if (!ex) return 'file.svg';
    var ext = ex.toLocaleLowerCase();
    switch (ext) {
      case '.txt':
        return 'txt.svg';
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.7z':
      case '.rar':
      case '.zip':
        return 'zip.svg';
      case '.jpg':
      case '.jpeg':
      case '.jfif':
        return 'jpg.svg';
      case '.mp4':
        return 'mp4.svg';
      case '.xls':
      case '.xlsx':
        return 'xls.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.png':
        return 'png.svg';
      case '.js':
        return 'javascript.svg';
      case '.apk':
        return 'android.svg';
      case '.ppt':
        return 'ppt.svg';
      case '.mp3':
      case '.wma':
      case '.wav':
      case '.flac':
      case '.ogg':
      case '.aiff':
      case '.aac':
      case '.alac':
      case '.lossless':
      case '.wma9':
      case '.aac+':
      case '.ac3':
        return 'audio.svg';
      default:
        return 'file.svg';
    }
  }

  getThumbnail(data) {
    return `../../../assets/codx/dms/${this.getAvatar(data.extension)}`;
  }

  viewFile(id: string) {
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    this.fileService.getFile(id).subscribe((fileInfo: any) => {
      if (fileInfo && fileInfo.read) {
        this.callfc.openForm(
          ViewFileDialogComponent,
          fileInfo.fileName,
          1000,
          800,
          '',
          [fileInfo, this.view?.currentView?.formModel],
          '',
          dialogModel
        );
      } else {
        this.notificationsService.notifyCode('SYS032');
      }
    });
  }
}
