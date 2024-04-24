import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, ChangeDetectorRef, Optional, Input, ViewChild, TemplateRef } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef, CodxListviewComponent, UrlUtil } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";

@Component({
  selector: 'popup-select-user',
  templateUrl: './popup-select-user.component.html',
  styleUrls: ['./popup-select-user.component.scss'],
})
export class PopupSelectUserComponent implements OnInit, AfterViewInit{

  @ViewChild('listview') listview!: CodxListviewComponent;
  @Input() itemTemplate: TemplateRef<any> | null = null;

  @Input() comboboxName = 'Users';
  @Input() service: string = '';
  @Input() assemblyName: string = '';
  @Input() className: string = '';
  @Input() method: string = '';
  @Input() predicate: string = '';
  @Input() dataValue: string = '';
  @Input() formName?: string = '';
  @Input() entityName?: string;
  @Input() gridViewName?: string = '';
  @Input() type: 'listView' | 'treeView' | 'cardView' = 'listView';
  @Input() valueMember = '';
  @Input() viewMember = '';
  @Input() multiple = false;
  @Input() predicates = '';
  @Input() dataValues = '';
  @Input() parentIdField = 'ParentID';

  arrTableField: any[] = [];
  arrDisplay: any[] = [];
  formModel:any;
  dialog:any;
  data:any;
  funcID:string;
  projectMemberType:any;
  projectData:any;
  title:string='';
  fields: any ={ text: 'objectName', value: 'objectID' }
  selectedUser:any=[];
  roleType:any;
  listRoles:any=[];
  crrUser:any;
  selectedRole:any;


  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.crrUser = this.authStore.get();
    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.projectData = dialogData.data.projectData;
    this.predicate = 'ProjectID=="'+this.projectData.projectID+'"'
    this.projectMemberType = dialogData.data.projectMemberType;
    switch (this.projectMemberType) {
      case '1':
        this.comboboxName = 'ProjectMembers';
        this.predicate = 'ProjectID=="'+this.projectData.projectID+'"'
        break;
      case '2':
        this.comboboxName = 'Share_Users';
        this.predicate = 'CompanyName=="'+this.crrUser.employee?.companyName+'"'
        break;
      case '3':
        this.comboboxName = 'Share_Users';
        this.predicate = undefined;
        break;

      default:
        break;
    }
    this.listRoles = dialogData.data.listRoles;
    this.roleType = dialogData.data.roleType;
    this.multiple = this.roleType!='A';
    if(this.listRoles && this.listRoles.length && this.roleType){
      this.selectedRole = this.listRoles.find((x:any)=>x.value==this.roleType);
      this.title = this.selectedRole?.text;
    }
  }
  ngOnInit(): void {
    this.loadSetting();
  }
  ngAfterViewInit(): void {

  }
  valueChange(e:any){
    this.selectedUser = e;
  }

  itemsSelected:any=[];
  cbxChange(e:any){
    this.selectedUser = e.data?.split(';');
    if(e.component){
      this.itemsSelected = [];
      for(let i in this.selectedUser){

        let item = e.component.dataService.data?.find((x:any)=> x[e.component.fields.value]==this.selectedUser[i]);
        if(item) this.itemsSelected.push(item);
      }
    }
  }
  apply(){
    if(this.selectedItems && this.selectedItems.length){
      this.selectedUser = this.selectedItems.map(x=>x[this.valueMember]);
      this.dialog.close(this.selectedUser);
      return;
    }
    if(this.selectedUser.length)
      this.dialog.close(this.selectedUser);
  }

  selectedValues:any=[];
  onSelectionChanged(e:any){
    let value = e.data[this.valueMember] ;
    if(value != undefined){
        if (this.selectedValues.includes(e.data[this.valueMember])){
          if(this.listview){
            if(this.listview.listView){
              let input = this.listview.listView?.element.querySelector(
                'codx-input[data-id="' +
                  e.data[this.valueMember] +
                  '"] ejs-checkbox span.e-icons'
              );
              if (input &&  input.classList.contains('e-check')) input.classList.remove('e-check');
            }
            else if(this.listview.treeView){
              //get element of component
              //let treeEle = this.windowObj.ng.getHostElement(this.listview?.treeView);
              let treeEle = this.listview?.treeView?.treeEle.nativeElement;
              if(treeEle){
                let input =  treeEle.querySelector(
                  'codx-input[data-id="' +
                    e.data[this.valueMember] +
                    '"] ejs-checkbox span.e-icons'
                );
                if(input && input.classList.contains('e-check')){
                  input.classList.remove('e-check');
                }
              }
            }
          }

          let idx = this.selectedItems.findIndex((x :any)=> x[this.valueMember] == e.data[this.valueMember] );
          if(idx > -1){
            this.selectedItems.splice(idx,1);
            this.selectedValues.splice(idx,1);
            this.value = this.selectedValues.join(';')
          }
          //if(!this.multiple) this.onSaveForm(!this.firstChange);
          //if(this.firstChange) this.firstChange=false
          return;
        }
        if (this.multiple) {
          this.value += value + ';';
          if(this.listview){
            if(this.listview.listView){
              let input = this.listview.listView?.element.querySelector(
                'codx-input[data-id="' +
                  e.data[this.valueMember] +
                  '"] ejs-checkbox span.e-icons'
              );
              if (input) input.classList.add('e-check');
            }
            else if(this.listview.treeView){
              //get element of component
              //let treeEle = this.windowObj.ng.getHostElement(this.listview?.treeView);
              let treeEle = this.listview?.treeView?.treeEle.nativeElement;
              if(treeEle){
                let input =  treeEle.querySelector(
                  'codx-input[data-id="' +
                    e.data[this.valueMember] +
                    '"] ejs-checkbox span.e-icons'
                );
                if(input){
                  input.classList.add('e-check');
                }
              }
            }
          }

        } else {
          //this.listviewSelected.dataService.data = [];
          //this.itemsSelected = [];
          if(this.listview ){
            if(this.listview.listView){
              let checkboxes = this.listview.listView.element.querySelectorAll('ejs-checkbox span.e-check');
              Array.prototype.forEach.call(checkboxes, function (el: any) {
                el.classList.remove('e-check');
              });
              let input =  this.listview!.listView!.element.querySelector(
                'codx-input[data-id="' +
                  e.data[this.valueMember] +
                  '"] ejs-checkbox span.e-icons'
              );
              if (input) input.classList.add('e-check');
            }
            else if(this.listview.treeView){
              //get element of component
              //let treeEle = this.windowObj.ng.getHostElement(this.listview?.treeView);
              let treeEle = this.listview?.treeView?.treeEle.nativeElement;
              if(treeEle){
                let checkboxes = treeEle.querySelectorAll('ejs-checkbox span.e-check');
                Array.prototype.forEach.call(checkboxes, function (el: any) {
                  el.classList.contains('e-check') && el.classList.remove('e-check');
                });
                let input =  treeEle.querySelector(
                  'codx-input[data-id="' +
                    e.data[this.valueMember] +
                    '"] ejs-checkbox span.e-icons'
                );
                if(input){
                  input.classList.add('e-check');
                }
              }
            }

          }
          this.value = value + '';

        }

        if(this.multiple){
          if(e.data){
            this.selectedItems.push(e.data);
            this.selectedValues.push(e.data[this.valueMember]);
          }

        }
        else{
          this.selectedItems = [e.data];
          this.selectedValues = [e.data[this.valueMember]];
          //this.onSaveForm(true);
        }
    }
  }

  selectedItems:any=[];
  dataSource:any=[];
  value:any
  cbxLoaded(e:any){
    this.dataSource=e;
    if(this.value){
      let selectedItem = e.find((x:any)=>x[this.valueMember || this.fields.value]==this.value);
      if(selectedItem && selectedItem !=undefined) this.selectedItems.push(selectedItem);
      //this.onSaveForm(this.selectedItems.length >0);
      //this.onSaveForm(false);
    }
    if(this.listview && this.listview.dataService){
      this.listview.dataService.onAction.subscribe((res:any)=>{
        if(res && res.type=='loaded'){
          if(this.selectedItems?.length){
            this.selectedItems.forEach((item:any)=>{
              let input =  this.listview.listView?.element.querySelectorAll(
                'codx-input[data-id="' +
                  item[this.valueMember] +
                  '"] ejs-checkbox span.e-icons'
              )[0];

              if (input && !input.classList.contains('e-check')) input.classList.add('e-check');
            })
          }
        }
      })
    }
  }

  setting:any;
  showAvatar:boolean=false;
  predicateSelected = '@0.Contains(it.';
  dataValueSelected = '';
  model:any;
  displayMembers = [];
  textField:any='';
  isLoad:boolean=false;
  loadSetting() {
    let t = this;
    this.predicates = this.predicate;
    this.cacheService.combobox(this.comboboxName).subscribe((response: any) => {
      if (response) {
        // if (response.linkFunction) {
        //   this.cache.functionList(response.linkFunction).subscribe((res) => {
        //     if (res) this.title = res.customName || res.defaultName;
        //   });
        // }
        this.setting = response;

        if (response.avtControl == '1') this.showAvatar = true;
        this.arrDisplay = response.displayMembers.split(';');
        this.arrTableField = response.tableFields.split(';');
        //if (!this.multiple) this.multiple = response.multiSelect;
        if (response.columnParent) {
          this.parentIdField = response.columnParent;
          this.type = 'treeView';
        }

        this.entityName = response.tableName;
        this.viewMember = response.viewMember;
        this.valueMember = response.valueMember;
        this.textField =
          response.viewMember.charAt(0).toLowerCase() +
          response.viewMember.substring(1);
        this.predicateSelected += t.valueMember + ')';
        this.service = response.service;
        this.displayMembers = response.displayMembers.split(';');
        if (this.model && response.referedSources) {
          if (
            response.referedSources != null &&
            response.referedSources.length > 0
          ) {
            var refSources = response.referedSources.split(',');

            for (var i = 0; i < refSources.length; i++) {
              var refSource = refSources[i];
              var refValue = null;
              var referPredicate = '';

              if (refSource.indexOf('[') > 0) {
                referPredicate = UrlUtil.modifiedUrlByObj(
                  refSource,
                  t.model,
                  '"'
                );
              } else {
                refValue = t.model[refSource];
                if (refValue != null)
                  referPredicate = refSource + '=="' + refValue + '"';
              }
              if (t.predicates && referPredicate != '')
                t.predicates = t.predicates + ' && ' + referPredicate;
              else if (referPredicate != '') t.predicates = referPredicate;
            }
          }
        }
        t.isLoad = true;
        t.changeDetectorRef.detectChanges();



        // if (t.listview) t.listview.dataService.idField = t.valueMember;
        // setTimeout(() => {
        //   if (t.listviewSelected) {
        //     t.listviewSelected.dataService.idField = t.valueMember;
        //     this.listviewSelected.dataService.onAction.subscribe((res) => {
        //       if (res) this.requestEnd(res.type, res.data, t);
        //     });
        //     // (this.listviewSelected.dataService as CRUDService).requestEnd = (
        //     //   type,
        //     //   data
        //     // ) => this.requestEnd(type, data, t);
        //   }
        // }, 100);
      }
    });
  }

  onSearch(evt:any){
    if(this.listview){
      this.listview.dataService.page = 0;
      this.listview.dataService.search(evt,res=>{
        this.isLoad = true;
        let insSetter = setInterval(()=>{
          if(this.listview && this.listview.listView){
            clearInterval(insSetter);
            if(this.selectedItems.length >0){
              this.selectedItems.forEach((item:any)=>{
                let input =  this.listview.listView?.element.querySelectorAll(
                  'codx-input[data-id="' +
                    item[this.valueMember] +
                    '"] ejs-checkbox span.e-icons'
                )[0];

                if (input) input.classList.add('e-check');
              })
            }
          }
        },100)
      });
    }
  }
}
