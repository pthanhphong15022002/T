import { ChangeDetectorRef, Component, EventEmitter, Input, Optional, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MenuEventArgs, MenuItemModel } from '@syncfusion/ej2-angular-navigations';
import { ApiHttpService, CacheService, DialogData, DialogRef, Filters, NotificationsService } from 'codx-core';
import moment from 'moment';
class FilterModel {
  operator?: string;
  field?: string;
  value: any;
  item:any;
  logic: 'and' | 'or';
  filters?: Array<FilterModel>;
}
@Component({
  selector: 'lib-add-setting-conditions',
  templateUrl: './add-setting-conditions.component.html',
  styleUrls: ['./add-setting-conditions.component.scss']
})
export class AddSettingConditionsComponent {
 // @ViewChild('dropdown') dropdown!: DropDownListComponent;
  // @ViewChild('dropdownChild') dropdownChild!: DropDownListComponent;
  @ViewChildren('dropdown') dropdowns!: QueryList<DropDownListComponent>;
  @ViewChildren('dropdownChild')
  dropdownChilds!: QueryList<DropDownListComponent>;
  @Input() funcID: any = '';
  @Input() filters: Filters = new Filters();
  @Input() isAdvance: boolean = true;
  @Input() isPopup: boolean = true;
  @Output() change = new EventEmitter<any>();
  dataStep: any;
  listForm: any;
  dialog: any;
  fields: any[] = [];
  toDay: any = new Date();
  advFilters: Filters = { logic: 'or', filters: [] };
  yesterday: any = moment().subtract(1, 'd').toDate();
  dateConditionValues: any = {};
  numberConditionValues: any = {};
  formModel:any;
  activeNav = 'top0';
  menuItems: MenuItemModel[] = [
    {
      id: 'duplicate',
      iconCss: 'icon-dns',
    },
    {
      id: 'delete',
      iconCss: 'icon-close text-danger',
    },
  ];
  oprOption: any[] = [
    { text: 'Và', value: 'and' },
    { text: 'Hoặc', value: 'or' },
  ];
  vllField: Object = { text: 'text', value: 'value' };
  textField: any = { text: 'headerText', value: 'fieldName' };
  //textField: any = {text: 'headerText', value: 'fieldName', controlType: 'controlType', dataType: 'dataType', referedType:'referedType', referedValue: 'referedValue'}

  predicateV = "";
  dataValueV = [];
  listSteps = [];
  nextStepDefault: any;
  predicateName= "";
  type = "add";
  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private cd: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.filters.logic = 'or';
    this.filters.filters = [];
    let initFilter = new FilterModel();
    initFilter.logic = 'and';
    initFilter.filters = [];
    initFilter.filters.push(new FilterModel());
    this.filters.filters.push(initFilter);
    if(dt?.data?.listSteps) this.listSteps = dt?.data?.listSteps;
    if (dt?.data) {
      if (dt?.data?.dataStep?.paraValues) {
        this.filters = new Filters();
        this.filters = dt.data?.dataStep?.paraValues;
        this.predicateName = dt.data?.dataStep?.predicateName;
        this.nextStepDefault = this.listSteps.filter(x=>x.recID == dt?.data?.dataStep?.nextStepID)[0];
        //this.isAdvance = dt.data[1];
        //this.dateType = dt.data[2];
      } else {
        this.filters = new Filters();
        //this.filters = dt.data;
      }

      if (!this.filters.filters) {
        this.filters.filters = [];
        let initFilter = new FilterModel();
        initFilter.logic = 'and';
        initFilter.filters = [];
        initFilter.filters.push(new FilterModel());
        this.filters.filters.push(initFilter);
      }
    }

    this.listForm = dt?.data?.forms;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isPopup'] && !changes['isPopup'].currentValue){
      this.isPopup = false;
    }
    if(changes['filters'] && changes['filters'].currentValue){
      this.filters = changes['filters'].currentValue;
      this.isPopup = false;
    }
  }
  ngAfterViewInit(): void {
    if (this.filters && this.filters.filters!.length > 0) {
      this.dropdowns &&
        this.dropdowns.forEach((item: DropDownListComponent) => {
          item.change.emit(item);
        });
      this.dropdownChilds &&
        this.dropdownChilds.forEach((item: DropDownListComponent) => {
          item.change.emit(item);
        });
      this.cd.detectChanges();
    }
  }
  ngOnInit(): void {
    if(this.funcID){
      this.cache.functionList(this.funcID).subscribe((func: any) => {
        this.formModel = func;

        this.cache
         .gridViewSetup(
           this.formModel.formName,
           this.formModel.gridViewName
         )
         .subscribe((res) => {
           if (res) {
             for (let i in res) {
               this.fields.push(res[i]);
             }
             this.fields = JSON.parse(JSON.stringify(this.fields));
           }
         });
       });
    }


    if(this.dialog){
      this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          for (let i in res) {
            this.fields.push(res[i]);
          }
          this.fields = JSON.parse(JSON.stringify(this.fields));
        }
      });
    }

  }

  addItem() {
    let objFilter = new FilterModel();
    objFilter.logic = 'and';
    objFilter.filters = [];
    objFilter.filters.push(new FilterModel());
    this.filters.filters?.push(objFilter);
  }

  addChildItem(filter: FilterModel) {
    if (!filter.filters) {
      filter.filters = [];
    }

    filter.filters.push(new FilterModel());
    if (this.filters.filters && this.filters.filters.length > 0) {
      let index = this.filters.filters?.findIndex((x: any) => x == filter);
      this.filters.filters[index] = filter;
    }
  }

  deleteChildItem(filter: FilterModel, index: number) {
    if (this.filters.filters && this.filters.filters.length > 0) {
      let idx = this.filters.filters?.findIndex((x: any) => x == filter);
      if (idx > -1) {
        this.filters.filters[idx].filters?.splice(index, 1);
        if (this.filters.filters[idx].filters?.length == 0) {
          delete this.filters.filters[idx].filters;
          this.filters.filters.splice(idx, 1);
        }
      }
    }
  }

  deleteItem(filter: FilterModel, index: number) {
    if (this.filters.filters && this.filters.filters.length > 0) {
      this.filters.filters.splice(index, 1);
    }
  }

  saveForm() {
    let fields = [];
    this.listSteps.forEach(x=>{
      if(x?.extendInfo)
      {
        fields = fields.concat(x.extendInfo);
      }
    })
    this.advFilters.filters = this.filters.filters;
    this.filters.filters?.forEach((filter: FilterModel, index: number) => {
      let _condition: FilterModel = JSON.parse(JSON.stringify(filter)); //
      filter.filters!.forEach((child: FilterModel) => {
        let item = fields.find((x: any) => x.fieldName == child.field);
        let _newF: FilterModel = JSON.parse(JSON.stringify(child)); //
        let _exFilter: any = undefined;
        if (item) {
          switch (item.dataType) {
            case 'String':
              switch (child.operator) {
                case 'empty':
                  _newF.operator = '=';
                  _newF.value = null;
                  break;
                case 'notempty':
                  _newF.operator = '!=';
                  _newF.value = null;
                  break;
              }
              break;
            case 'Int':
            case 'Decimal':
              if (child.value && typeof child.value == 'object') {
                if (child.value.from != undefined) {
                  _newF.operator = 'gte';
                  _newF.value = child.value.from;
                }
                if (child.value.to != undefined) {
                  if (!_exFilter) _exFilter = new FilterModel();
                  _exFilter.field = child.field;
                  _exFilter.operator = 'lte';
                  _exFilter.value = child.value.to;
                  _exFilter.logic = 'and';
                }
              }
              break;
            case 'DateTime':
              switch (child.operator) {
                case 'duein':
                  if (child.value) {
                    _newF.operator = 'gte';
                    if (!_exFilter) _exFilter = new FilterModel();
                    _exFilter.operator = 'lte';
                    _exFilter.logic = 'and';
                    _exFilter.field = child.field;
                    if (this.dateType[child.field!] == '1') {
                      _newF.value = moment().startOf('d').toDate();
                      _exFilter.value = moment()
                        .add(child.value, 'd')
                        .endOf('d')
                        .toDate();
                    }
                    if (this.dateType[child.field!] == '2') {
                      _newF.value = moment().startOf('h').toDate();
                      _exFilter.value = moment()
                        .add(child.value, 'h')
                        .endOf('h')
                        .toDate();
                    }
                  }
                  break;
                case 'inthelast':
                  if (child.value) {
                    _newF.operator = 'gte';
                    if (!_exFilter) _exFilter = new FilterModel();
                    _exFilter.operator = 'lte';
                    _exFilter.logic = 'and';
                    _exFilter.field = child.field;
                    if (this.dateType[child.field!] == '1') {
                      _newF.value = moment()
                        .subtract(child.value, 'd')
                        .startOf('d')
                        .toDate();
                      _exFilter.value = moment().endOf('d').toDate();
                    }
                    if (this.dateType[child.field!] == '2') {
                      _newF.value = moment()
                        .subtract(child.value, 'h')
                        .startOf('h')
                        .toDate();
                      _exFilter.value = moment().endOf('h').toDate();
                    }
                  }
                  break;
                case 'between':
                  if (!_exFilter) _exFilter = new FilterModel();
                  _exFilter.operator = 'lte';
                  _exFilter.logic = 'and';
                  _exFilter.field = child.field;
                  if (child.value.fromDate && child.value.toDate) {
                    _newF.operator = 'gte';
                    _newF.value = child.value.fromDate;
                    _exFilter.value = child.value.toDate;
                  }
                  break;
                case 'on':
                  if (!_exFilter) _exFilter = new FilterModel();
                  _exFilter.operator = 'lte';
                  _exFilter.logic = 'and';
                  _exFilter.field = child.field;
                  if (child.value) {
                    _newF.operator = 'gte';
                    _newF.value = moment(child.value)
                      .startOf('d')
                      .toDate();
                    _exFilter.value = moment(child.value)
                      .endOf('d')
                      .toDate();
                  }
                  break;
                case 'before':
                  _newF.operator = 'lte';
                  if (child.value.fromDate && child.value.toDate) {
                    _newF.value = moment(child.value.fromDate)
                      .endOf('d')
                      .toDate();
                  }
                  break;
                case 'after':
                  _newF.operator = 'gte';
                  if (child.value.fromDate && child.value.toDate) {
                    _newF.value = moment(child.value.fromDate)
                      .startOf('d')
                      .toDate();
                  }
                  break;
                case 'yesterday':
                  _newF.operator = 'gte';
                  _newF.value = moment(this.yesterday).startOf('d').toDate();
                  if (!_exFilter) _exFilter = new FilterModel();
                  _exFilter.operator = 'lte';
                  _exFilter.logic = 'and';
                  _exFilter.field = child.field;
                  _exFilter.value = moment(this.yesterday)
                    .endOf('d')
                    .toDate();
                  break;
                case 'today':
                  _newF.operator = 'gte';
                  _newF.value = moment(this.toDay).startOf('d').toDate();
                  if (!_exFilter) _exFilter = new FilterModel();
                  _exFilter.operator = 'lte';
                  _exFilter.logic = 'and';
                  _exFilter.field = child.field;
                  _exFilter.value = moment(this.toDay).endOf('d').toDate();
                  break;
              }
              break;
          }
        }
        _condition.filters = _condition.filters?.filter(
          (f: any) => f.field != _newF.field
        );
        _condition.filters?.push(_newF);
        if (_exFilter && _exFilter.value) _condition.filters?.push(_exFilter);
      });

      if (!this.advFilters.filters) this.advFilters.filters = [];
      this.advFilters.filters[index] = _condition;
    });
    //this.isPopup && this.dialog.close(this.advFilters);
    this.genPerdicate();
    var obj = 
    {
      predicateName: this.predicateName,
      paraValues: this.filters,
      predicate: this.predicateV,
      dataValue: this.dataValueV,
      nextStepID: this.nextStepDefault?.recID
    }
    this.isPopup && this.dialog.close(obj);
    if(!this.isPopup){
      this.change.emit(this.filters)
    }
    //this.dialog.close(this.filters);
  }

  restoreForm() {
    this.filters = new Filters();
    this.filters.filters = [];
    this.filters.logic = 'or';
    let initFilter = new FilterModel();
    initFilter.logic = 'and';
    initFilter.filters = [];
    initFilter.filters.push(new FilterModel());
    this.filters.filters.push(initFilter);
  }

  valueChange(filter: FilterModel, evt: any) {
    if (evt.field == 'logic') {
      filter.logic = evt.data;
      if (filter.filters && filter.filters.length > 0) {
        filter.filters.forEach((item: FilterModel) => {
          item.logic = filter.logic;
        });
      }
    }
    if (evt.field == 'operator') {
      filter.operator = evt.data.toLowerCase();;
    }
  }

  numberChange(evt: any, filter: FilterModel) {
    if (evt.field == filter.field) {
      filter.value = evt.data;
    }
    let _value = { from: undefined, to: undefined };
    if (evt.field == 'from') {
      _value.from = evt.data;
      filter.value = _value;
    }
    if (evt.field == 'to') {
      _value.to = evt.data;
      filter.value = _value;
    }
  }

  valueFieldChange(filter: FilterModel, evt: any) {
    if (Array.isArray(evt.data)) {
      filter.value = evt.data.join(';');
    } else {
      filter.value = evt.data;
    }
  }

  fieldChange(filter: FilterModel, evt: any, ele?: any) {
    if (evt && evt) {
      filter.field = evt?.fieldName;
      filter.item = evt;
    } 
  }

  itemSelect(evt: MenuEventArgs, filter?: FilterModel, index?: any) {
    if (evt.item.id == 'duplicate') {
      let newFilter = JSON.parse(JSON.stringify(filter));
      this.filters.filters?.push(newFilter);
      this.filters = JSON.parse(JSON.stringify(this.filters));
      this.cd.detectChanges();
      this.dropdowns &&
        this.dropdowns.forEach((item: DropDownListComponent) => {
          if (Object.keys(item.formContext).length == 0) {
            item.change.emit({
              itemData: this.fields[(item as any).activeIndex],
            });
          } else {
            item.change.emit(item);
          }
        });
    }
    if (evt.item.id == 'delete') {
      this.filters.filters?.splice(index, 1);
    }
  }

  dateConditionSelect(evt: any, item: any) {
    item.value = evt.data;

    // if (!this.filters.filters) this.filters.filters = [];
    // let filterFrom = new FilterModel();
    // filterFrom.field = item.field;
    // filterFrom.logic = 'and';
    // let filterTo = new FilterModel();
    // filterTo.logic ='and';
    // filterTo.field = item.field;
    // filterFrom.operator= 'gte';
    // filterTo.operator ='lte';

    // switch(filterFrom.operator){
    //   case 'inthelast':
    //     filterFrom.operator = 'gte';

    //     if(this.dateType[item.field] == '1'){
    //       filterFrom.value = moment().subtract(evt.data,'d').startOf('d').toDate();
    //       filterTo.value = moment().endOf('d').toDate();
    //     }
    //     if(this.dateType[item.field] == '2'){
    //       filterFrom.value = moment().subtract(evt.data,'h').startOf('h').toDate();
    //       filterTo.value = moment().endOf('h').toDate();
    //     }
    //   break;
    //   case 'duein':
    //     filterFrom.operator = 'gte';

    //     if(this.dateType[item.field] == '1'){
    //       filterFrom.value = moment().startOf('d').toDate();
    //       filterTo.value = moment().add(evt.data,'d').endOf('d').toDate();
    //     }
    //     if(this.dateType[item.field] == '2'){
    //       filterFrom.value = moment().add(evt.data,'h').startOf('h').toDate();
    //       filterTo.value = moment().add(evt.data,'h').endOf('h').toDate();
    //     }

    //   break;
    //   case 'between':
    //     filterFrom.operator ='gte';
    //     filterFrom.value =  moment(evt.data?.fromDate).startOf('d').toDate();

    //     filterTo.operator = 'lte';
    //     filterTo.value = moment(evt.data?.toDate).endOf('d').toDate();

    //   break;
    //   case 'on':
    //     filterFrom.operator ='gte';
    //     filterFrom.value =  moment(evt.data?.fromDate).startOf('d').toDate();

    //     filterTo.operator = 'lte';
    //     filterTo.value = moment(evt.data?.toDate).endOf('d').toDate();

    //   break;
    //   case 'before':
    //     filterFrom.operator = 'lte';
    //     filterFrom.value = evt.data?.toDate;
    //     filterTo.operator = 'lte';
    //     filterTo.value = evt.data?.toDate;
    //   break;
    //   case 'after':
    //     filterFrom.operator = 'gte';
    //     filterFrom.value = evt.data?.toDate;
    //     filterTo.operator = 'gte';
    //     filterTo.value = evt.data?.toDate;
    //   break;
    //   case 'yesterday':
    //     filterFrom.operator ='gte';
    //     filterFrom.value =  moment().subtract(1,'d').startOf('d').toDate();

    //     filterTo.operator = 'lte';
    //     filterTo.value = moment().subtract(1,'d').endOf('d').toDate();

    //   break;
    //   case 'today':
    //     filterFrom.operator ='gte';
    //     filterFrom.value =  moment().startOf('d').toDate();

    //     filterTo.operator = 'lte';
    //     filterTo.value = moment().endOf('d').toDate();

    //   break;
    // }
    //this.dateConditionValues[item.field] = {from: filterFrom.value, to: filterTo.value};
  }
  dateType: any = {};
  dateTypeChanged: boolean = true;
  dateTypeChange(evt: any, fieldName: string) {
    this.dateTypeChanged = false;
    this.dateType[fieldName] = evt.data;
  }

  genPerdicate()
  {
    let number = 0;
    for(var i = 0 ; i < this.filters.filters.length ; i++)
    {
      let p = this.filters.filters[i];
      this.predicateV += i == 0 ? "(" : " " + this.convertLogic(this.filters.logic) + " (";
      for(var y = 0 ; y < p.filters.length ; y++)
      {
        let p2 = p.filters[y];
        this.predicateV += this.convertOperator(p2,number);
        if(p2?.operator && !p2.operator.includes("EMPTY")) 
        {
          number ++;
          this.dataValueV.push(p2.value);
        }

        if(p.filters[y+1]) this.predicateV += " " + this.convertLogic(p.logic) + " ";
      }
      this.predicateV += ")";
    }
  }

  convertOperator(data:any, number:any)
  {
    if(!data?.operator) return "";
    switch(data.operator.toLowerCase())
    {
      case 'eq' : case '=' : return data.field + "==" + "@" + number;
      case 'neq' : case '<>' : case '!=' : return data.field + "!=" + "@" + number;
      case 'contains':  return data.field + ".contains(@" + number + ")";
      case 'nocontains': return "!"+ data.field + ".contains(@" + number + ")";
      case 'startswitch': return data.field + ".startswitch(@" + number + ")";
      case 'nostartswitch': return "!"+ data.field + ".startswitch(@" + number + ")";
      case 'empty': return  data.field + "==" + 'NULL';
      case 'noempty': return data.field + "!=" + 'NULL';
      case 'gte' : case '>=' : return data.field + ">=" + "@" + number;
      case 'lte' : case '<=' : return   data.field + "<=" + "@" + number;
      case '<' : return   data.field + "<" + "@" + number;
      case '>' : return   data.field + ">" + "@" + number;
    }
    return "";
  }

  convertLogic(data:any)
  {
    switch(data)
    {
      case 'and' : return "&&"
      case 'or' : return "||"
    }
    return "";
  }

  changeSteps(data:any)
  {
    this.nextStepDefault = data;
  }
  changeName(e:any)
  {
    this.predicateName = e?.data;
  }
  // applyFilter(implement: boolean = false) {
  //   let filters = new Filters();
  //   let filterForm = new FilterModel();
  //   filterForm.logic = 'and';
  //   filterForm.filters = JSON.parse(JSON.stringify(this.filters.filters));
  //   let filterPinned = new FilterModel();
  //   filterPinned.logic = 'and';
  //   filterPinned.filters = this.pinedFilter.filters;
  //   filters.logic = 'and';
  //   filters.filters = [];
  //   if (this.filters.filters!.length > 0) {
  //     filters.filters.push(filterForm);
  //   }
  //   if (this.pinedFilter.filters!.length > 0) {
  //     filters.filters.push(filterPinned);
  //   }

  //   //filters.filters[0].filters = [...this.filters.filters!,...this.pinedFilter.filters!];
  //   if (this.autoFilter) {
  //     this.dataService.data = [];
  //     let tmpfilters = new Filters();
  //     tmpfilters.logic = 'and';
  //     tmpfilters.filters = [];
  //     filters.filters!.forEach((f: any) => {
  //       if (f.filters && f.filters.length) {
  //         f.filters.forEach((c: any) => {
  //           if (c.filters && c.filters.length) {
  //             c.filters.forEach((_c: any) => {
  //               tmpfilters.filters?.push(_c);
  //             });
  //           } else {
  //             tmpfilters.filters?.push(c);
  //           }
  //         });
  //       }
  //     });

  //     this.dataService.filter = filters;
  //     this.dataService.page = 0;
  //     if (
  //       this.views?.length == 1 &&
  //       (this.views[0].type == ViewType.grid ||
  //         this.views[0].type == ViewType.grid_detail)
  //     ) {
  //       this.applyViewFilterChange(tmpfilters.filters, 'filter');
  //     } else {
  //       this.loadData((x) => {
  //         if (implement && this.isCollapsed) this.isCollapsed = true;
  //         if (implement) {
  //           this.applyViewFilterChange(tmpfilters.filters, 'filter');
  //         }
  //         ScrollComponent.reinitialization();
  //       });
  //     }
  //   } else {
  //     this.filterChange.emit({
  //       filter: this.filters.filters,
  //       predicates: this.fields.join('&&'),
  //       values: this.values.join(';'),
  //     });
  //   }
  // }
}
