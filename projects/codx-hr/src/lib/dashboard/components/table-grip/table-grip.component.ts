import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Input, OnInit, QueryList, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ColumnModel, EditSettingsModel, GridColumn, GridComponent, RowSelectEventArgs, SearchSettingsModel, TextAlign, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { DialogComponent, Tooltip } from '@syncfusion/ej2-angular-popups';
import { EmitType } from '@syncfusion/ej2-base';



interface Field {
  id: string,
  name: string,
  field: string,
  width: string,
  textAlign: string,
  type: string,

  // template?:
}

@Component({
  selector: 'lib-table-grip',
  templateUrl: './table-grip.component.html',
  styleUrls: ['./table-grip.component.scss']
})
export class TableGripComponent {
  @ViewChild('grid') public grid?: GridComponent;
  @ContentChildren(TemplateRef) templates: QueryList<TemplateRef<any>>;
  @ViewChild('ejDialog') ejDialog: DialogComponent | any;
  @Input() popupTemplate: TemplateRef<any>;
  @Input() isShowHeader: boolean = false;
  @Input() title: string = '';
  @Input() titleIcon:string = '';
  public isShow: boolean = false;
  @Input() height: string | number = 'auto';
  ngAfterViewInit(): void {
    // (this.grid as GridComponent).pageSettings.pageCount = this.pageSize;
    (this.grid as GridComponent).editSettings.showDeleteConfirmDialog = this.enableShowDeleteConfirmDialog;
    (this.grid as GridComponent).pageSettings.pageSize = this.pageSize;
    (this.grid as GridComponent).searchSettings.ignoreAccent = true;
    // console.log('vantuankiet',this.grid?.getSelectedRows());
   this.templates.forEach(x => {
    console.log('templates',x);
   })
  }
  @Input() data: any[] = [];
  @Input() listFields: Field[] = [];
  @Input() allowResizing: boolean = false;
  @Input() pageSize: number = 4;
  public toolbar?: ToolbarItems[];
  @Input() allowFiltering: boolean = false;
  @Input() allowPaging: boolean = true;
  @Input() selectedRowIndex: number = 0;
  testvalue:any = {name2:''};
  public editSettings?: EditSettingsModel;
  public enableShowDeleteConfirmDialog: boolean = true;
  public animationSettings: Object = { effect: 'SlideRight', duration: 400, delay: 0 };
  public isAdd:boolean = false;
  public selectedItem:any;
  public itemform:any;
  public searchSettings?: SearchSettingsModel
  @Input()  multiple: boolean = false;
  // public searchInput: TextBoxComponent = '';
  ngOnInit() {
    this.toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
    this.editSettings = { allowEditing: false, allowAdding: true, allowDeleting: true };
    this.searchSettings = { operator: 'contains' };
    
  }


  constructor(private render: Renderer2
              
    ) {

  }
  search() {
    // const searchText: string = (this.searchInput as TextBoxComponent).value;
    // (this.grid as GridComponent).search(searchText);
  }
  valueChange(args: ChangeEventArgs): void {
    (this.grid as GridComponent).searchSettings.operator = args.value as string; 
  }
  onRowSelected(item: any): void {
    if (item.data) {
      this.selectedItem = item.data;
      console.log('selectedRecords',item.data);
    }
  }

  public onBeforeOpen(args: any): void {
    args.maxHeight = '100vh';
    this.render.removeClass(document.body, 'e-scroll-disabled');

  }
  public onRecordDoubleClick(event:any){
        var doubleClickItem = event.rowData;
        this.isAdd = false;
        this.itemform = doubleClickItem;
        this.onOpenDialog(event);
        console.log('onRecordDoubleClick',event);
  }
  public onOverlayClick: EmitType<object> = () => {
    this.isShow = false;
    this.ejDialog.hide();
  }
  public onOpenDialog = (event: any): void => {
    this.isShow = true;
    if (this.ejDialog) {
      this.ejDialog.show();
    }
  };
  onCheckType(fielditem: Field) {
    if (fielditem.type == 'text') {
      return 'stringedit';
    }
    else if (fielditem.type == 'datetime') {
      return 'datepickeredit';
    }

    return 'stringedit';
  }
  protected onCloseDialog(){
      this.isShow = false;
      this.ejDialog.hide();
  }
  protected onInitPopupTemplate() {
    if (this.popupTemplate) {

    }
  }


  ngAfterContentInit() {
    //console.log('kiettest',this.templates); 
  }
  toggleShowDeleteConfirmDialog() {
    debugger;
    (this.grid as GridComponent).editSettings.showDeleteConfirmDialog = this.enableShowDeleteConfirmDialog;
  }
  protected MappingTemplate(field: string): TemplateRef<any> {

    var itemTemplate = this.templates.filter(template => {
      var temp: any = template;
      console.log('MappingTemplate', temp._declarationTContainer.localNames[0]);
      return temp._declarationTContainer.localNames[0] == field;
    });
    return itemTemplate[0];
  }
  protected getFieldTemplate(index: number): TemplateRef<any> | null {
    return this.templates.get(index) ?? null;
  }

  clickEvents(event:any,type:string){
    debugger; 
        if(type == 'add'){
            this.isAdd = true;
            this.itemform = {};
            this.onOpenDialog(event);
        }
        else if( type == 'edit'){ 
            this.isAdd = false;
            this.itemform = this.selectedItem;
            this.onOpenDialog(event);
        }
        else if(type == 'delete'){
          if(this.multiple){

          }
          else{
            (this.grid as GridComponent).deleteRecord();
          }
        }
  }
  public onSaveItem(){
      if(this.isAdd){
        var saveItem = this.itemform;
        // validation
  
        // call save api  
  
        // add record to grid
       
        (this.grid as GridComponent).addRecord(saveItem);    
      }
      else{
        var saveItem = this.itemform;
        (this.grid as GridComponent).updateRow((this.grid as GridComponent).getSelectedRowIndexes()[0], this.itemform);
      }
      this.onCloseDialog();
  }
  
  headerCellInfo(args:any){
   
      const toolcontent = args.cell.column.headerText; 
      const tooltip: Tooltip = new Tooltip({ 
        content: toolcontent,
      })
     tooltip.appendTo(args.node); 
     } 
}
