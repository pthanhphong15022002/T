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
  CodxListviewComponent,
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
  fromDateDropdown: any;
  toDateDropdown: any;
  orgUnit = '';
  emloyeeID = '';
  predicate = '';
  dataValue = '';
  cbb = '';
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
  fromDate: any = '';
  toDate = '';
  today: any = new Date();

  @ViewChild('listview') listview;
  @ViewChild('listview') listView: CodxListviewComponent;
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
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    var firstDayInMonth = new Date(year, month, 1);
    var lastDayInMonth = new Date(year, month + 1, 0);
    this.fromDate = this.dateTimeToString(firstDayInMonth);
    this.toDate = this.dateTimeToString(lastDayInMonth);
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
    this.setPredicate();
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

  dateChange(evt: any) {
    if (evt?.fromDate || evt?.toDate) {
      this.fromDateDropdown = this.dateTimeToString(evt?.fromDate);
      this.toDateDropdown = this.dateTimeToString(evt?.toDate);
      this.setPredicate();
    }
  }

  dateTimeToString(date: Date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return (
      yyyy +
      '-' +
      (mmChars[1] ? mm : '0' + mmChars[0]) +
      '-' +
      (ddChars[1] ? dd : '0' + ddChars[0])
    );
  }

  loadData() {
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
        }
      });
  }

  valueChange(e) {
    if (e) {
      switch (e.field) {
        case 'vllOrganize':
          var type = e.data;
          if (type == '1') this.cbb = 'Company';
          else if (type == '3') this.cbb = 'Divisions';
          else if (type == '4') this.cbb = 'HRDepartments';
          else this.cbb = 'HRDepartmentUnits';
          this.dt.detectChanges();
          break;
        case 'Organize':
          var sField = 'OrgUnitID';
          if (this.type == '1') sField = 'CompanyID';
          else if (this.type == '3') sField = 'DivisionID';
          else if (this.type == '4') sField = 'DepartmentID';
          this.orgUnit = e.data;
          break;
        case 'Employee':
          sField = 'EmployeeID';
          this.emloyeeID = e.data;
          break;
        default:
          break;
      }
      if (e.field !== 'vllOrganize' && e.data) this.setPredicate();
    }
  }

  setPredicate() {
    this.options.predicate = '(TransType=@0) && ';
    this.options.dataValue = '3';
    this.predicate = '';
    this.dataValue = '';
    var arrTemp = [];
    if (this.orgUnit) {
      var sField = 'OrgUnitID';
      arrTemp.push({ field: sField, value: this.orgUnit, dropdownCalendar: false});
    }
    if (
      this.fromDate &&
      this.toDate &&
      (!this.fromDateDropdown || !this.toDateDropdown)
    )
      arrTemp.push({
        field: 'TransDate',
        value: this.fromDate,
        dropdownCalendar: false,
      });
    if (this.fromDateDropdown || this.toDateDropdown)
      arrTemp.push({
        field: 'CreatedOn',
        value: this.fromDateDropdown,
        dropdownCalendar: true,
      });
    if (this.emloyeeID)
      arrTemp.push({
        field: 'EmployeeID',
        value: this.emloyeeID,
        dropdownCalendar: false,
      });
    let i = 1;
    var t = this;
    arrTemp.forEach(function (element) {
      if (!element) return;
      var spre = '';
      var dtValue = '';
      if (element.field == 'TransDate' && !element?.dropdownCalendar) {
        spre =
          '(' +
          element.field +
          '>=@' +
          i +
          ' && ' +
          element.field +
          '<=@' +
          (i + 1) +
          ')';
        dtValue = t.fromDate + ';' + t.toDate;
        i += 2;
      } else if (element?.dropdownCalendar) {
        spre =
          '(' +
          element.field +
          '>=@' +
          i +
          ' && ' +
          element.field +
          '<=@' +
          (i + 1) +
          ')';
        dtValue = t.fromDateDropdown + ';' + t.toDateDropdown;
        i += 2;
      } else if (element.field == 'OrgUnitID') {
        spre = '(' + element.field + '=@' + i + ')';
        dtValue = element.value;
        i += 1;
      } else if (element.field == 'EmployeeID') {
        spre = '(' + element.field + '=@' + i + ')';
        dtValue = element.value;
        i += 1;
      }
      if (t.predicate) {
        if (spre !== '') t.predicate += ' && ' + spre;
      } else t.predicate = spre;
      if (t.dataValue) {
        if (dtValue !== '') t.dataValue += ';' + dtValue;
      } else t.dataValue = dtValue;
    });
    this.options.predicate += this.predicate;
    this.options.dataValue += ';' + this.dataValue;
    debugger;
    this.loadList = true;
    if (this.listview) {
      this.listView.dataService
      .setPredicate(this.options.predicate, [this.options.dataValue])
      .subscribe();
    }
    this.chartLabels = [];
    this.colors[0].backgroundColor = [];
    this.loadData();
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
