export class DataRequest {
    pageLoading: boolean = true
    page: number = 0
    pageSize: number = 20
    entityName?: string
    entityPermission? : string
    formName?: string
    gridViewName?: string
    funcID?: string
    searchText?: string
    srtColumns?: string
    srtDirections?: string
    parentField?: string
    parentValue?: string
    predicate?: string
    dataValue?: string
    predicates?: string
    dataValues?: string
    favoriteID?: string
    unFavorite?: boolean
    entryMode?: string
    treeField?: string
    treeIDValue?: string
    dataObj: string // Current value / object datas
    predicateSearch?:string
    //cross gridview
    dataModel?: string
    baseField?: string
    splitField?: string
    groupFields?: string
    sort?: Array<object>
    //combobox
    comboboxName?: string
    currentValue?: string
    filter?: object
    constructor(formName?: string, gridViewName?: string,entityName?:string,predicate?:string,dataValue?:string,page?:number,pageSize?:number) {
      this.pageLoading = true;
      this.formName = formName;
      this.gridViewName = gridViewName;
      this.entityName =entityName;
      this.dataValue = dataValue;
      this.page = page;
      this.pageSize = pageSize;
    }
  }