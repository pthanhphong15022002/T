import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  DataRequest,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss'],
})
export class AchievementComponent extends UIComponent implements OnInit {
  funcID: any;
  reloadTop = true;
  labels_empty: string[] = ['Empty'];
  colors_empty: string[] = ['#B7B7B7'];
  chartDatas_empty: number[] = [100];
  chartDatas: number[] = [];
  optionsChart = {
    tooltips: {
      titleFontSize: 16,
      bodyFontSize: 16,
    },
    legend: {
      position: 'right',
      labels: {
        fontSize: 9,
      },
      display: false,
    },
    cutoutPercentage: 80,
    title: {
      align: 'start',
      fontSize: 16,
      text: 'Xu nhận',
      display: false,
    },
  };
  chartLabels: string[] = [];
  colors = [
    {
      backgroundColor: [],
    },
  ];
  options = new DataRequest();
  lstRate = [];
  dataProcess = [];
  heightList = '200';
  toDate = new Date();
  orgUnit = '';
  emloyeeID = '';
  predicate = '';
  dataValue = '';
  comboboxName = '';
  type = '';
  lstDataChart = [];
  ishide = true;
  loadList = false;
  lstEmployeeByOrg = [];
  dataTable = [];
  dicEmployeeByOrg: any;
  dataListTemp = [];
  views: Array<ViewModel> = [];
  showHeader: boolean = true;
  userPermission: any;

  @ViewChild('listview') listview;
  @ViewChild('subheader') subheader;
  @ViewChild('iTemplateLeft') iTemplateLeft: TemplateRef<any>;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;

  constructor(
    private injector: Injector,
    private dt: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.route.params.subscribe((param) => {
      this.funcID = param['funcID'];
    });
  }

  setOption(text): any {
    // this.options_empty.title.text = "index";
    this.dt.detectChanges();
    return true;
  }

  onInit(): void {
    this.options.pageLoading = false;
    this.options.entityName = 'FD_KudosTrans';
    this.options.entityPermission = 'FD_KudosTrans';
    this.options.gridViewName = 'grvKudosTrans';
    this.options.formName = 'KudosTrans';
    this.options.funcID = this.funcID;
    //this.LoadData();
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];
    this.userPermission = this.view.userPermission;
  }

  LoadData() {
    this.api
      .execSv<any>('FD', 'FD', 'KudosTransBusiness', 'LoadDataKudoAsync', [
        this.options,
        this.type,
      ])
      .subscribe((res) => {
        if (res) {
          this.lstRate = res[0];
          this.dataProcess = res[1];
          this.dataTable = res[2];
          this.dicEmployeeByOrg = res[3];
          if (this.dataProcess.length > 0) {
            var t = this;
            this.lstDataChart = [];
            var sField = 'orgUnitID';
            var sFieldName = 'orgUnitName';
            if (this.type == '1') {
              sField = 'companyID';
              sFieldName = 'companyName';
            } else if (this.type == '3') {
              sField = 'divisionID';
              sFieldName = 'divisionName';
            } else if (this.type == '4') {
              sField = 'departmentID';
              sFieldName = 'departmentName';
            }
            this.dataProcess.forEach(function (element, index) {
              if (index > 2) return;
              var data = t.lstRate;
              var name = element.breakName;
              var value = element.breakValue;
              var arrData = data.filter((x) => x.textRate == name);
              var sumEmployee = arrData.length;
              var dataGroup = data.reduce(function (r, a) {
                r[a[sField]] = r[a[sField]] || [];
                r[a[sField]].push(a);
                return r;
              }, Object.create(null));
              var chartDatas: number[] = [];
              for (const property in dataGroup) {
                var items = dataGroup[property];
                var count = 0;

                items.forEach((element) => {
                  if (element.textRate == name) {
                    count++;
                  }
                });

                if (
                  t.chartLabels.length < 0 ||
                  t.chartLabels.indexOf(items[0][sFieldName]) == -1
                ) {
                  t.chartLabels.push(items[0][sFieldName]);
                  t.colors[0].backgroundColor.push(t.getRandomColor());
                }
                if (count > 0) chartDatas.push(count);
              }
              var css = t.renderMiddleText(sumEmployee, name);
              // var plugin: PluginServiceGlobalRegistrationAndOptions[] = [];
              // plugin[0] = css;
              // var obj = {
              //   plugin: plugin,
              //   chartDatas: chartDatas,
              // };
              //t.lstDataChart.push(obj);
            });
          }
          if (this.lstDataChart.length > 0) this.ishide = false;
          this.setHeightList();
          this.dt.detectChanges();
          // console.log(res);
        }
      });
  }

  valueChange(e) {
    if (e) {
      if (e.component != undefined) var textVll = e.component.dataSource;
      switch (e.field) {
        case 'toDate':
          var value = new Date(e.data?.toDate);
          this.toDate = value;
          // this.options.predicate += " && TransDate <= @1";
          // this.options.dataValue += ";" + value.toISOString();
          break;
        case 'vllOrganize':
          textVll.forEach((res) => {
            if (res.value == e.data) {
              this.comboboxName = res.text;
              this.dt.detectChanges();
            }
          });
          this.type = e.data?.value;
          break;
        case 'Organize':
          var sField = 'OrgUnitID';
          if (this.type == '1') sField = 'CompanyID';
          else if (this.type == '3') sField = 'DivisionID';
          else if (this.type == '4') sField = 'DepartmentID';
          this.orgUnit = e.data[sField];
          break;
        case 'Employee':
          sField = 'EmployeeID';
          this.emloyeeID = e.data?.EmployeeID;
          break;
        default:
          break;
      }
    }
    this.setPredicate();
  }

  setPredicate() {
    this.options.predicate = 'TransType=@0';
    this.options.dataValue = '3';
    var predicate = '',
      dataValue = '',
      arrTemp = [];
    if (this.toDate)
      arrTemp.push({ field: 'TransDate', value: this.toDate.toISOString() });
    if (this.orgUnit) {
      var sField = 'OrgUnitID';
      if (this.type == '1') sField = 'CompanyID';
      else if (this.type == '3') sField = 'DivisionID';
      else if (this.type == '4') sField = 'DepartmentID';
      arrTemp.push({ field: sField, value: this.orgUnit });
    }
    if (this.emloyeeID)
      arrTemp.push({ field: 'EmployeeID', value: this.emloyeeID });
    arrTemp.forEach(function (element, index) {
      if (!element) return;
      var opartor = '=@';
      if (element.field == 'TransDate') opartor = '<=@';
      if (predicate) predicate += '&&' + element.field + opartor + (index + 1);
      else predicate = element.field + opartor + (index + 1);
      if (dataValue) dataValue += ';' + element.value;
      else dataValue = element.value;
    });
    this.options.predicate += '&&' + predicate;
    this.options.dataValue += ';' + dataValue;
    this.loadList = true;
    if (this.listview) {
      this.listview.predicate = this.options.predicate;
      this.listview.dataValue = this.options.dataValue;
      this.listview.data = [];
      this.listview.loadData();
    }
    this.chartLabels = [];
    this.colors[0].backgroundColor = [];
    this.LoadData();
  }

  ReloadListByRank(current, after) {
    if (this.listview) {
      if (this.dataListTemp.length == 0) this.dataListTemp = this.listview.data;
      var datas = this.dataListTemp;
      if (current) datas = datas.filter((x) => x.totalCoreEmp >= current);
      if (after) datas = datas.filter((x) => x.totalCoreEmp < after);
      this.listview.data = datas;
    }
  }

  setValueChartTable(value): any {
    if (!value) return;
    var css = this.renderMiddleText(value, '');
    // var plugin: PluginServiceGlobalRegistrationAndOptions[] = [];
    // plugin[0] = css;
    // return plugin;
  }

  renderMiddleText(value, name): any {
    var css = {
      beforeDraw(chart) {
        const ctx = chart.ctx;
        const txt = value;
        ctx.textAlign = 'center';
        ctx.fontSize = 16;
        ctx.textBaseline = 'middle';
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.fillText(txt + ' ' + name, centerX, centerY);
      },
    };
    return css;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  setHeightList() {
    let wh = window.innerHeight;
    var top = document.getElementsByClassName('top-champion');
    var process = document.getElementsByClassName('process-performance');
    if (top.length > 0) wh = wh - top[0].clientHeight;
    if (process.length > 0) wh = wh - process[0].clientHeight;
    this.heightList = wh - 60 + '';
  }
}
