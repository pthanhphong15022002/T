import { Component, ViewChild, Injector, Optional, ChangeDetectorRef } from "@angular/core";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { UIComponent, FormModel, DialogRef, NotificationsService, AuthService, DialogData, Util, AuthStore } from "codx-core";
import { Observable, forkJoin, of } from "rxjs";
import { environment } from "src/environments/environment";

@Component({
  selector: 'form-setting',
  templateUrl: 'form-setting.component.html',
  styleUrls: ['form-setting.component.scss'],
})
export class FormSettingComponent extends UIComponent {

  @ViewChild('form') form: any;
  @ViewChild('treeELe') tree?: TreeViewComponent;
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender = false;
  returnData: any;
  data: any=[];
  headerText = 'Danh sách chức năng';
  fGroup: any;
  grView: any;
  disableEdit=false;
  vllShared:any=[]
  editedFunc:any={};
  isLoaded:boolean=false;
  datasource:any=[];
user:any;
functionList:any;
public field:any ={ dataSource: [], id: 'nodeId', text: 'nodeText', child: 'nodeChild', iconCss: 'icon', imageUrl: 'image' };
override onInit(): void {

  //this.initData();
}

initData(isSystem:boolean=false){
  this.isLoaded = false;
  this.selectedData=undefined;
  this.addData= undefined;
  this.isEditing = false;
  let arrButtons:any=[];
  this.api.execSv('SYS','SYS','FormSettingsBusiness','GetFormSettingAsync',['Comments',isSystem]).subscribe((res:any)=>{
    this.data = res;
    let lstRecID:any=[];
    this.data.map((x:any)=> {

      lstRecID.push(x.recID);
      if(x.smallIcon && x.smallIcon.includes('api/')){
        x.smallIcon = environment.urlUpload+'/'+x.smallIcon;
      }
      if(x.functionType == 'G'){
        x.parentID=undefined;
        let objButton:any={};
        objButton.recID = Util.uid();
        objButton.parentID = x.recID;
        objButton.customName = "Thêm chức năng";
        objButton.isButton = true;
        arrButtons.push(objButton);
        x.hasChild = true;
        // if(x.childs && x.childs.length){
        //   x.childs.map((y:any)=>{
        //     if(y.smallIcon && y.smallIcon.includes('api/')){
        //       y.smallIcon = environment.urlUpload+'/'+y.smallIcon;
        //     }
        //     return y;
        //   })
        // }
       }
      return x;
    })

    this.data = [...this.data,...arrButtons];
    this.field = {
      dataSource: this.data, id:'recID', text: 'customName', parentID: 'parentID', hasChildren:'hasChild'
    }
    if(lstRecID.length){
      this.api.execSv('SYS','SYS','FormSettingsBusiness','GetListFormsAsync',{RecID: lstRecID}).subscribe((res:any)=>{
        this.datasource = res;
        if(!this.isSystemEdit){

          this.datasource.map((x:any)=>{
            if(x.userID) return x;
            x.oldID = x.recID;
            x.recID=Util.uid();
            x.userID = this.user.userID;
            return x;
          })
          //remap parentID
          this.datasource.map((x:any)=>{
            if(x.parentID && x.oldID){
              let parent = this.datasource.find((p:any)=>p.oldID==x.parentID);
              if(parent){
                x.parentID = parent.recID;
              }
            }
          })
        }
        this.isLoaded = true;
      })
    }


  })
}
  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private changeDetect: ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.funcID = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.dialogRef.formModel = this.formModel;
    this.loadMenuByModule(this.codxService.module);
    this.cache.valueList('SYS064').subscribe((res: any) => {
      this.vllShared = res.datas;
    })
    if(this.codxService.funcID){
      this.cache.functionList(this.codxService.funcID).subscribe((res:any)=>{
        this.functionList=res;
      })
    }
    this.user = this.authStore.get();
    this.dialogRef.beforeClose.subscribe((res:any)=>{
      if(!this.isSaved){
        if(this.data.findIndex((x:any)=>x.isAddNew) >-1 || this.deleteList.length){
          res.cancel=true;
          this.notificationsService.alertCode('SYS048').subscribe((res:any)=>{
            if(res.event?.status == 'Y'){
              this.onSave();

            }
            else{
              this.isSaved=true;
              this.dialogRef.close();
            }
          })
        }
      }
    })
  }



  selectedItem:any;
  selectedData:any;
  addData:any;
  isPersonal:boolean=false;
  enableEdit:boolean=false;
  selectedEle:any;
  addedDatas:any=[];
  onSelected(e:any){
    this.selectedData = {};
    this.selectedData = this.data.find((x:any)=>x[this.field.id]==e.nodeData.id);
    !this.selectedData.isAddNew && this.getFormSettingItem(this.selectedData);
    setTimeout(()=>{
      if(this.isDeleting){
        e.cancel=true;
        this.isDeleting = false;
        return;
      }
      this.selectedItem = e.nodeData;
      this.selectedEle = e.node;

      if(this.selectedData.functionType =='G'){
        if(this.isAddGroup){
          this.isEditGroup = false;
        }
        else{
          this.isEditGroup = true;
        }
        //this.isEditGroup = true;
        this.isAddFunc = false;
        //this.isAddGroup = false;
        this.isEditFunc=false;
      }
      else{
        this.isEditGroup = false;
        this.isAddFunc = false;
        this.isAddGroup = false;
        this.isEditFunc=true;
      }
      if(this.user.administrator || this.user.funtionAdmin || this.user.systemAdmin){
        this.enableEdit = true;
      }
      else if(this.selectedData.createdBy == this.user.userID){
        this.enableEdit = true
      }
      else this.enableEdit = false;


      let item = this.data.find((x:any)=>x[this.field.id]==e.nodeData.id);
      if(item){
        if(item.isAddNew && item.functionType !='G'){
          this.isEditGroup = false;
          this.isAddFunc = true;
          this.isAddGroup = false;
          this.isEditFunc=false;
          return;
        }
        // if(!this.isSystemEdit){
        //   this.selectedData = this.datasource.find(x=>x.oldID==item.recID);
        //   if(this.selectedData){
        //     if(this.selectedData.refID){
        //       this.isEnableEdit = false;
        //       this.selectedData.url = item.url;
        //     }
        //     else this.isEnableEdit = true;
        //   }
        //   else{
        //     this.selectedData = this.datasource.find(x=>x.recID==item.recID);
        //   if(this.selectedData){
        //     if(this.selectedData.refID){
        //       this.isEnableEdit = false;
        //       this.selectedData.url = item.url;
        //     }
        //     else this.isEnableEdit = true;
        //   }
        //   }
        // }
        // else{
        //   this.selectedData = this.datasource.find(x=>x.recID==item.recID);
        //   if(this.selectedData){
        //     if(this.selectedData.refID){
        //       this.isEnableEdit = false;
        //       this.selectedData.url = item.url;
        //     }
        //     else this.isEnableEdit = true;
        //   }
        // }
        // this.api.execSv('SYS','SYS','FormSettingsBusiness','GetFormAsync',item.recID).subscribe((res:any)=>{
        //   this.selectedData = res;
        //   if(this.selectedData.refID){
        //     this.isEnableEdit = false;
        //     this.selectedData.url = item.url;
        //   }
        //   else this.isEnableEdit = true;
        // })


        // this.api.execSv('SYS','SYS','FormSettingsBusiness','GetListSharedAsync',item.recID).subscribe((res:any)=>{
        //   this.lstShared[item.recID]=res;
        // })
      //   if(item.functionType == 'G'){
      //     this.isEditGroup = true;
      //     this.isAddFunc = false;
      //     this.isAddGroup = false;
      //     this.isEditFunc=false;
      //   }
      //   else{

      //     this.isEditGroup = false;
      //     this.isAddFunc = false;
      //     this.isAddGroup = false;
      //     this.isEditFunc=true;
      //   }
       }
    },100)

  }

  loadMenuByModule(module:string){
    if(module){
      this.isLoaded = false;
      this.selectedData=undefined;
      this.addData= undefined;
      this.isEditing = false;
      let arrButtons:any=[];
          this.api.execSv('SYS','ERM.Business.SYS','FunctionListBusiness','GetByFuncV2Async',module).subscribe((res:any)=>{
            this.data = res;
            let lstRecID:any=[];
            this.data.map((x:any)=> {
              x.name = x.customName;
              x.category=x.functionType;
              x.formName=this.codxService.module;
              if(x.smallIcon){
                x.icon=x.smallIcon;
                lstRecID.push(x.recID);
                if(x.smallIcon.includes('api/')){
                  x.smallIcon = environment.urlUpload+'/'+x.smallIcon;
                }
              }

              if(x.functionType == 'G'){
                x.parentID=undefined;
                let objButton:any={};
                objButton.recID = Util.uid();
                objButton.parentID = x.recID;
                objButton.customName = "Thêm chức năng";
                objButton.isButton = true;
                arrButtons.push(objButton);
                x.hasChild = true;
                // if(x.childs && x.childs.length){
                //   x.childs.map((y:any)=>{
                //     if(y.smallIcon && y.smallIcon.includes('api/')){
                //       y.smallIcon = environment.urlUpload+'/'+y.smallIcon;
                //     }
                //     return y;
                //   })
                // }
              }
              return x;
            })

        this.data = [...this.data,...arrButtons];
        this.field = {
          dataSource: this.data, id:'recID', text: 'customName', parentID: 'parentID', hasChildren:'hasChild'
        }
        // if(lstRecID.length){
        //   this.api.execSv('SYS','SYS','FormSettingsBusiness','GetListFormsAsync',{RecID: lstRecID}).subscribe((res:any)=>{
        //     this.datasource = res;
        //     if(!this.isSystemEdit){

        //       this.datasource.map((x:any)=>{
        //         if(x.userID) return x;
        //         x.oldID = x.recID;
        //         x.recID=Util.uid();
        //         x.userID = this.user.userID;
        //         return x;
        //       })
        //       //remap parentID
        //       this.datasource.map((x:any)=>{
        //         if(x.parentID && x.oldID){
        //           let parent = this.datasource.find((p:any)=>p.oldID==x.parentID);
        //           if(parent){
        //             x.parentID = parent.recID;
        //           }
        //         }
        //       })
        //     }
        //     this.isLoaded = true;
        //   })
        // }
        this.isLoaded = true;

      })
    }
  }

  onCreate(args: TreeViewComponent): void {
    //args.element.querySelector('ul')?.classList.add('h-100')
    args.selectedNodes= [this.data.filter((x:any)=>x.functionType=='G')[0].recID]
    args.expandAll();
    let collapse: NodeListOf<Element> = args?.element.querySelectorAll('.e-icons.e-icon-collapsible') as NodeListOf<Element>;
    let expand: NodeListOf<Element> = args?.element.querySelectorAll('.e-icons.e-icon-expandable') as NodeListOf<Element>;
    this.hideIcon(expand, collapse);
    args?.element.addEventListener('mouseenter', (event:any) => {
      this.showIcon(expand, collapse);
    });
    args?.element.addEventListener('mouseleave', (event:any) => {
      this.hideIcon(expand, collapse);
    });
  }
    // hides expand/collapse icon on hovering the mouse
  hideIcon(expand: NodeListOf<Element>, collapse: NodeListOf<Element>) {
      for(let i: number = 0; i < collapse.length; i++ ){
        collapse[i].setAttribute('style','visibility: hidden');
      }
      for(let j: number = 0; j < expand.length; j++ ){
        expand[j].setAttribute('style','visibility: hidden');
      }
  }

  // shows expand/collapse icon while leaving the mouse
  showIcon(expand: NodeListOf<Element>, collapse: NodeListOf<Element>) {
    for(let i: number = 0; i < collapse.length; i++ ){
      collapse[i].setAttribute('style',"visibility");
    }
    for(let j: number = 0; j < expand.length; j++ ){
      expand[j].setAttribute('style',"visibility");
    }
  }

  isReOrdered:boolean=false;
  nodeDropped(e:any){
    this.isReOrdered = true;
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    let item = this.data.find((x:any)=>x[this.field.id] == dragItem.id);
    let idField = 'recID';
    //if(this.datasource[0].oldID) idField='oldID'
    if(item){
      if(!targetNode.parentID){
        let data = this.data.find((x:any)=>x[idField]==item.recID);
        let targetData = this.data.find((x:any)=>x[idField]==targetNode.id);
        if(data && targetData){
          if(data.category != 'G')
            data.parentID = targetData.recID;
        }
        this.editedFunc[data.recID]=data;
        this.editedFunc[targetData.recID]=targetData;
      }
      else{
        let data = this.data.find((x:any)=>x[idField]==item.recID);
        let targetData = this.data.find((x:any)=>x[idField]==targetNode.parentID);
        if(data && targetData){
          if(data.category != 'G')
            data.parentID = targetData.recID;
        }
        this.editedFunc[data.recID]=data;
        this.editedFunc[targetData.recID]=targetData;
      }


    }

  }

  nodeDragStop(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    let targetItem = this.data.find((x:any)=>x[this.field.id]==targetNode?.id);
    if(dragItem.parentID && e.dropLevel == 1 && !targetNode){
      e.cancel = true;
      return;
    }
    if(dragItem.parentID && e.dropLevel ==1 && (e.position == 'After' || e.position =='Before') ){
      e.cancel = true;
      return;
    }

    if(targetItem){
      if(targetItem.functionType != 'G' && e.position == 'Inside'){
        e.cancel=true;
        return;
      }
      if(targetItem.isButton){
        e.cancel=true;
        return;
      }
    }
    else{
      e.cancel=true;
    }
    console.log(e);

  }

  nodeDragging(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    // if(dragItem?.recID == targetNode?.recID){
    //   e.dropIndicator='e-no-drop';
    //   return;
    // }
    if(!dragItem.parentID){
      // if(e.dropLevel > 1){
      //   e.dropIndicator='e-no-drop'
      // }
    }
    if(!targetNode){
      e.dropIndicator='e-no-drop'
    }
    else{
      let targetItem = this.data.find((x:any)=>x[this.field.id]==targetNode.id);
      if(targetItem){
        // if(targetItem.functionType != 'G' || targetItem[this.field.id] == dragItem.parentID){
        //  e.dropIndicator='e-no-drop'
        // }
      }
      else{
        e.dropIndicator='e-no-drop'
      }
    }
    if(dragItem.parentID && e.dropLevel ==1){
      e.dropIndicator='e-no-drop'
    }
    let dragData = this.data.find((x:any)=>x.recID == dragItem.id);
    if(dragData){
      if(dragData.isButton) e.cancel= true;
    }

  }

  nodeDragStart(e:any){
    let dragItem = e.draggedNodeData;
    let dragData = this.data.find((x:any)=>x.recID == dragItem.id);
    if(dragData){
      if(dragData.isButton) e.cancel= true;
    }
  }

  nodeclicked(args: any) {
    // if (args.node.classList.contains('e-level-1')) {
    //     this.tree.selectedNodes = [args.node.getAttribute('data-uid') as string];
    // }
  }

  valueChange(e:any){
    this.selectedData[e.field] = e.data;
    this.selectedData.name = this.selectedData.customName;
    //this.selectedData.smallIcon = this.selectedData.icon;
    if(e.field=='icon'){
      this.selectedData.smallIcon = e.data;
    }
    this.editedFunc[this.selectedData.recID] = this.selectedData;
    this.isEditing = true;
    setTimeout(()=>{
      if(this.selectedEle && (e.field=='customName' || e.field=='icon')){
        this.tree.updateNode(this.selectedEle,this.selectedData.customName)
      }
    },200)

  }

  valueAddChange(e:any){
    this.addData[e.field] = e.data;
    if(e.field=='icon'){
      this.addData.smallIcon = e.data;
    }
    this.addData.name = this.addData.customName;
    setTimeout(()=>{
      if(this.selectedEle && e.field=='customName'){
        this.tree.updateNode(this.selectedEle,this.selectedData.customName)
      }
    },200)
  }

  lstShared:any={};
  valueShareChange(e:any){
    if(e.data.length){
      this.lstShared[this.selectedData.recID]=[];
      for(let i =0; i< e.data.length;i++){
        let objShare:any={};
        objShare.dataValue=this.selectedData.recID;
        objShare.predicate = 'RecID=@0';
        objShare.shareType='2';
        objShare.entityID='SYS_FormSettings';
        objShare.shareToType = e.data[i].objectType;
        objShare.shareToID= e.data[i].id;
        objShare.text = e.data[i].text;
        objShare.objectName = e.data[i].objectName;
        objShare.icon = this.vllShared.find((x:any)=>x.value==objShare.shareToType)?.icon;
        this.lstShared[this.selectedData.recID].push(objShare);
      }
      this.lstShared = {...this.lstShared}
      this.isEditing = true;
    }

  }


  valueShareAddChange(e:any){
    if(e.data.length){
      this.lstShared[this.addData.recID]=[];
      for(let i =0; i< e.data.length;i++){
        let objShare:any={};
        objShare.dataValue=this.addData.recID;
        objShare.predicate = 'RecID=@0';
        objShare.shareType='2';
        objShare.entityID='CO_FormSettings';
        objShare.objectType = e.data[i].objectType;
        objShare.objectID= e.data[i].id;
        objShare.text = e.data[i].text;
        objShare.objectName = e.data[i].objectName;
        objShare.roleType = e.data[i].roleType;
        objShare.icon = this.vllShared.find((x:any)=>x.value==objShare.shareToType)?.icon;
        this.lstShared[this.addData.recID].push(objShare);
      }
      this.lstShared = {...this.lstShared}
    }
  }

  isEnableEdit:boolean=true;
  valueCbbChange(e:any){
    if(e.data.dataSelected[0]){
      let item = e.data.dataSelected[0].dataSelected;
      if(item.FunctionID) this.isEnableEdit = false;
      else this.isEnableEdit = true;
      this.selectedData.url = item.Url
      this.selectedData.refID=item.FunctionID;
      this.selectedData.customName=item.CustomName;

    }
    this.editedFunc[this.selectedData.recID] = this.selectedData;
    this.isEditing = true;
    this.changeDetect.detectChanges();
  }

  valueCbbAddChange(e:any){
    if(e.data.dataSelected[0]){
      let item = e.data.dataSelected[0].dataSelected;
      if(item.FunctionID) this.isEnableEdit = false;
      else this.isEnableEdit = true;
      this.addData.url = item.Url;
      this.addData.refID=item.FunctionID;
      this.addData.customName=item.CustomName
      this.addData.name=item.CustomName;
      this.addData.category='F';
      this.addData.funtionType='F';


    }
    this.changeDetect.detectChanges();
  }

  onAddFunc(parentID){
    if(this.addData && this.addData.parentID == parentID) return;
    setTimeout(()=>{
      let idField = 'recID';
      if(this.datasource[0].oldID) idField='oldID'
      this.isEnableEdit = true;
      this.isEditGroup = false;
      this.isAddFunc = true;
      this.isAddGroup = false;
      this.isEditFunc=false;
      this.addData={};
      this.addData.formName='Comments';
      this.addData.category='F';
      this.addData.settingType='1';
      //this.addData.userID = this.user.userID;
      this.addData.recID = Util.uid();
      this.addData.oldID = Util.uid();
      this.addData.sorting = this.datasource.length
      let parent = this.datasource.find((x:any)=>x[idField]==parentID);
      if(parent){
        this.addData.parentID = parent.recID;
      }
    },200)
  }


  onAddNewFunc(parentID,nodeData:any){
    if(this.tree){
      let idField = 'recID';
      //if(this.datasource[0].oldID) idField='oldID'

      this.addData = {
        createdBy: this.user.userID,
        recID: Util.uid(),
        parentID: parentID,
        functionType: 'U',
        category:'U',
        name:'Chức năng mới',
        customName: 'Chức năng mới',
        isAddNew:true,
        formName: this.codxService.module,
        sorting: this.data.length

      }
      if(this.user.administrator || this.user.functionAdmin || this.user.systemAdmin) this.addData.createdBy=null;
      let parent = this.data.find((x:any)=>x[idField]==parentID);
      if(parent){
        this.addData.parentID = parent.recID;
      }
      this.tree?.addNodes([this.addData], parentID, null as any);
      this.data.push(this.addData);
      this.data.sort((x:any, y:any)=> {
        return (x.isButton === y.isButton)? 0 : x.isButton? 1 : -1;

      });

      this.tree.refresh()
      setTimeout(()=>{
        this.tree.selectedNodes= [this.addData.recID];
        //this.tree?.beginEdit(this.addData.recID);
        this.isEnableEdit=true;
        this.isEditFunc = false;
        this.isAddGroup = false;
        this.isEditGroup = false;
        this.isAddFunc = true;
      })



    }
  }
  isEditGroup:boolean=false;
  isEditFunc:boolean=false;
  isAddGroup:boolean=false;
  isAddFunc:boolean=false;

  onAddGroup(){

    this.addData = {};
    this.addData.recID = Util.uid();
    this.addData.category = 'G';
    this.addData.functionType = 'G';
    this.addData.formName=this.codxService.module;
    this.addData.settingType='1';
    this.addData.customName='Nhóm chức năng mới';
    this.addData.name='Nhóm chức năng mới';
    //this.addData.userID = this.user.userID;
    this.addData.sorting = this.data.length
    this.addData.isAddNew=true;
    let objButton:any={};
    objButton.recID = Util.uid();
    objButton.parentID =  this.addData.recID;
    objButton.customName = "Thêm chức năng";
    objButton.isButton = true;
    this.addData.hasChild = true;
    this.tree?.addNodes([this.addData,objButton], null, null as any);
    this.data.push(this.addData);
    this.data.push(objButton);
    this.data.sort((x:any, y:any)=> {
      return (x.isButton === y.isButton)? 0 : x.isButton? 1 : -1;

    });
    this.isEnableEdit=true;
    this.isEditGroup = false;
    this.isAddFunc = false;
    this.isAddGroup = true;
    this.isEditFunc=false;
    setTimeout(()=>{
      this.tree.selectedNodes= [this.addData.recID];
      //this.tree?.beginEdit(this.addData.recID);
      this.isEnableEdit=true;
      this.isEditGroup = false;
      this.isAddFunc = false;
      this.isAddGroup = true;
      this.isEditFunc=false;

    })
  }

  imgChanged(e:any){
    if(this.selectedData && e.length){
      this.selectedData.image = e[0].pathDisk;
      this.selectedData.icon = null;
      this.selectedData.color = null;
      this.editedFunc[this.selectedData.recID] = this.selectedData;
    }
    this.isEditing = true;
  }

  imgAddChanged(e:any){
    if(this.addData && e.length){
      this.addData.image = e[0].pathDisk
      this.addData.icon = null;
      this.addData.color = null;
      //this.editedFunc[this.selectedData.recID] = this.selectedData;
    }
  }

  onSaveForm(){
    if(this.isSystemEdit){

    }
    else{
      let idField = 'recID';
      if(this.datasource[0].oldID) idField='oldID'
      if(this.tree && (this.tree as any).liList.length){
        //let newDatasource:any=[];
        for(let i =0;i< (this.tree as any).liList.length;i++){
          let id = (this.tree as any).liList[i].getAttribute('data-uid');

          if(id){
            let dataId = this.data.find((x:any)=>x.recID==id);
          if(dataId && !dataId.isButton){
            let item = this.datasource.find((x:any)=> x[idField] == id);
            if(item){
              item.sorting = i+1;
              //newDatasource.push(item);
            }
          }
          else{
            continue;
          }

          }
        }
        //debugger
        //this.datasource = newDatasource;
      }
      this.api.execAction('SYS_FormSettings',this.datasource,this.datasource[0].oldID ? 'SaveAsync' : 'UpdateAsync',true).subscribe((res:any)=>{

        if(!res.error){
          setTimeout(()=>{
            this.notificationsService.notifyCode('SYS007');
            this.dialogRef.close();
            window.location.reload();
          },1000)
         }

      })
    }
  }

  onSaveAdmin(){
    let idField = 'recID';
    if(this.datasource[0].oldID) idField='oldID'
    if(this.tree && (this.tree as any).liList.length){
      //let newDatasource:any=[];
      for(let i =0;i< (this.tree as any).liList.length;i++){
        let id = (this.tree as any).liList[i].getAttribute('data-uid');

        if(id){
          let dataId = this.data.find((x:any)=>x.recID==id);
        if(dataId && !dataId.isButton){
          let item = this.datasource.find((x:any)=> x[idField] == id);
          if(item){
            item.sorting = i+1;
            //newDatasource.push(item);
          }
        }
        else{
          continue;
        }

        }
      }
      //debugger
      //this.datasource = newDatasource;
    }
    let arrFormSetting:any=[];
    for(let key in this.editedFunc){
      arrFormSetting.push(this.editedFunc[key])
    }
    for(let key in this.lstShared){
      this.api.execSv('SYS','SYS','FormSettingsBusiness','UpdateFormSharedAsync',[key,this.lstShared[key]]).subscribe((res:any)=>{

      })
    }
    this.api.execAction('SYS_FormSettings',this.datasource,'UpdateAsync',true).subscribe((res:any)=>{

     if(!res.error){
      setTimeout(()=>{
        this.notificationsService.notifyCode('SYS007');
        this.dialogRef.close();
        window.location.reload();
      },1000)
     }

    })
  }

    isSaved:boolean=false;
    onSave(){
    let editList:any=[];
    let addList:any=[];
    let deleteList:any=[];
    if(this.isReOrdered){
      if(this.tree && (this.tree as any).liList.length){
        //let newDatasource:any=[];
        for(let i =0;i< (this.tree as any).liList.length;i++){
          let id = (this.tree as any).liList[i].getAttribute('data-uid');

          if(id){
            let dataId = this.data.find((x:any)=>x.recID==id);
          if(dataId && !dataId.isButton){
            let item = this.data.find((x:any)=> x.recID == id);
            if(item){
              item.sorting = i+1;
              editList.push(item);
            }
          }
          else{
            continue;
          }

          }
        }

      }
    }
    else{
      for(let key in this.editedFunc){
        editList.push(this.editedFunc[key])
      }
    }


    //addList = this.data.filter((x:any)=>x.isAddNew);
    this.data = this.data.filter((x:any)=>this.deleteList.findIndex((y:any)=>y.recID == x.recID)==-1);
    addList = this.data.filter((x:any)=>x.isAddNew == true);
    addList = addList.map((x:any)=>{
      if(this.lstShared[x.recID]){
        x.permissions = this.lstShared[x.recID];
      }
      return x;
    })
    deleteList = this.deleteList.filter((x:any)=>!x.isAddNew)
    editList = editList.filter((x:any)=>{ delete x.childs; return deleteList.findIndex((y:any)=>y.recID == x.recID)==-1});
    forkJoin({
      add: addList.length ?this.api.execAction('CO_FormSettings',addList,'SaveAsync') :  of(null),
      edit: editList.length ? this.api.execSv('CO','ERM.Business.CO','FormSettingsBusiness','UpdateFormSettingsAsync',[editList]): of(null),
      delete: deleteList.length ? this.api.execSv('CO','ERM.Business.CO','FormSettingsBusiness','DeleteFormSettingsAsync',[deleteList]) : of(null)
     }).subscribe((res:any)=>{
        this.isSaved = true;
        this.dialogRef.close();
     })
    // if(addList.length){
    //   this.api.execAction('CO_FormSettings',addList,'SaveAsync').subscribe((res:any)=>{
    //     debugger
    //   })

    // }
    // if(editList.length){
    //   this.api.execSv('CO','ERM.Business.CO','FormSettingsBusiness','UpdateFormSettingsAsync',[editList]).subscribe((res:any)=>{
    //     debugger
    //   })
    //   //  this.api.execAction('CO_FormSettings',editList,'UpdateAsync').subscribe((res:any)=>{
    //   //   debugger
    //   // })
    // }
    // if(deleteList.length){
    //    this.api.execAction('CO_FormSettings',deleteList,'DeleteAsync').subscribe((res:any)=>{
    //     debugger
    //   })
    // }
  }

  onAddForm(){
    let idField = 'recID';
    if(this.datasource[0].oldID) idField='oldID'
    if(this.tree && (this.tree as any).liList.length){
      let newDatasource:any=[];
      for(let i =0;i< (this.tree as any).liList.length;i++){
        let id = (this.tree as any).liList[i].getAttribute('data-uid');
        if(id){
          let dataId = this.data.find((x:any)=>x.recID==id);
          if(dataId && !dataId.isButton){
            let item = this.datasource.find((x:any)=> x[idField] == id);
            if(item){
              item.sorting = i+1;
              newDatasource.push(item);
            }
          }
          else{
            continue;
          }
        }
      }
      //debugger
      this.datasource = newDatasource;
    }
    this.api.execAction('SYS_FormSettings',this.datasource,this.datasource[0].oldID ? 'SaveAsync' : 'UpdateAsync',true).subscribe((res:any)=>{

      if(!res.error){
        if(this.isSystemEdit) delete this.addData.userID;
        this.api.execAction('SYS_FormSettings',[this.addData],'SaveAsync',true).subscribe((res:any)=>{
         if(this.isSystemEdit){
          if(Object.keys(this.lstShared).length){
              for(let key in this.lstShared){
                this.api.execSv('SYS','SYS','FormSettingsBusiness','UpdateFormSharedAsync',[key,this.lstShared[key]]).subscribe((res:any)=>{

                })
              }
          }
         }
          if(!res.error){
            setTimeout(()=>{
              this.notificationsService.notifyCode('SYS007');
              this.initData(this.isSystemEdit);
            }
          )}
        })
       }

    })

  }

  onAddPerForm(){
    if(this.user.administrator || this.user.systemAdmin){
      this.datasource.map((x:any)=>{
        if(x.userID) return x;
        x.oldID = x.recID;
        x.recID=Util.uid();
        x.userID = this.user.userID;
        return x;
      })
    }
  }

  onRestore(){
    this.notificationsService.alertCode("SYS046").subscribe((res:any)=>{
      if(res && res.event.status=='Y'){

        this.api.execSv('SYS','SYS','FormSettingsBusiness','RestoreUserSettingsAsync',null).subscribe((res:any)=>{
          if(res){
            this.notificationsService.notifyCode('SYS007');
            this.initData(this.isSystemEdit);
          }
        })
      }
    });
  }

  deleteList:any=[];
  isDeleting:boolean=false;
  onDeleteFunc(recID:any){
    if(recID){
      this.selectedData = {};
      this.isDeleting = true;
      this.isAddFunc = false;
      this.isEditFunc = false;
      this.isAddGroup = false;
      this.isEditGroup = false;
      let item = this.data.find((x:any)=>x.recID==recID)
      if(item){
        //this.data = this.data.filter((x:any)=>x.recID != recID);
        if(item.funtionType=='G'){

          let arrChild = this.data.filter((x:any)=>x.parentID==item.recID);
          if(arrChild.length){
            let arrRecIDs = arrChild.map((x:any)=>x.recID);
            arrRecIDs.push(recID);
            arrChild = arrChild.filter((x:any)=>!x.isButton);
            this.deleteList.push(item);
            this.deleteList = [...this.deleteList,...arrChild];
            this.tree.removeNodes(arrRecIDs);
           // this.data = this.data.filter((x:any)=> x.parentID != item.recID)
          }
        }
        else{
          this.deleteList.push(item)
          this.tree.removeNodes([recID]);
        }
        //this.tree?.refresh();
      }
      // let idField = 'recID';
      // if(this.datasource[0].oldID) idField='oldID';
      // let item = this.datasource.find((x:any)=>x[idField]==recID);
      // if(item){
      //   if(item.oldID){
      //     let idx = this.datasource.indexOf(item);
      //     if(idx>-1){
      //       this.datasource.splice(idx,1);
      //       this.api.execAction('SYS_FormSettings',this.datasource,'SaveAsync',true).subscribe((res:any)=>{

      //         if(!res.error){

      //           setTimeout(()=>{
      //             this.initData();
      //           }
      //         )}
      //       })
      //     }
      //     return;
      //   }
      //   else{
      //     let arrRelated = this.datasource.filter((x:any)=>x.parentID==item.recID);
      //     arrRelated.push(item)
      //     this.api.execAction('SYS_FormSettings',[item],'DeleteAsync',true).subscribe((res:any)=>{
      //       if(!res.error){
      //         this.api.execSv('SYS','SYS','FormSettingsBusiness','DeleteFormSharingAsync',[{RecID:arrRelated.map((x:any)=> x.recID)}]).subscribe((res:any)=>{
      //           if(res){
      //             this.initData();
      //           }
      //         })

      //       }
      //     })
      //   }
      // }
      // else{
      //   let dataIdx= this.data.findIndex((x:any)=>x.recID==recID)
      //   if(dataIdx >-1){
      //     this.data.splice(dataIdx,1);
      //     this.tree?.refresh();
      //   }
      // }
    }
  }

  onUndo(){
    if(this.addData){
      let dataIdx= this.data.findIndex((x:any)=>x.recID==this.addData.recID)
        if(dataIdx >-1){
          this.data.splice(dataIdx,1);
          this.tree?.refresh();
          this.isAddFunc=false;
          this.isAddGroup=false;
          if(this.tree && (this.tree as any).liList.length){
            let id = (this.tree as any).liList[0].getAttribute('data-uid');
            this.tree.selectedNodes=[id];
          }

        }
        else if(this.addData.category=='G'){
          this.isAddFunc=false;
          this.isAddGroup=false;
          if(this.tree && (this.tree as any).liList.length){
            let id = (this.tree as any).liList[0].getAttribute('data-uid');
            this.tree.selectedNodes=[id];
          }
        }
        this.addData=undefined;
    }
  }

  nodeEdited(e:any){
    this.isEnableEdit=true;
    if(this.addData) this.addData.customName = e.newText;
  }
  isEditing:boolean=false;
  onEdit(){
    let arrFormSetting:any=[];
    for(let key in this.editedFunc){
      arrFormSetting.push(this.editedFunc[key])
    }
    debugger
    // if(this.selectedData){
    //   if(this.selectedData.oldID){
    //     this.api.execAction('SYS_FormSettings',this.datasource,'SaveAsync',true).subscribe((res:any)=>{

    //       if(!res.error){
    //         setTimeout(()=>{
    //           this.initData(this.isSystemEdit);
    //         })
    //        }

    //     })
    //     return;
    //   }
    //   else{
    //     this.api.execAction('SYS_FormSettings',[this.selectedData],'UpdateAsync',true).subscribe((res:any)=>{

    //       if(!res.error){

    //         setTimeout(()=>{
    //           this.initData(this.isSystemEdit);
    //         })
    //       }
    //     })
    //   }

    // }
  }

  isSystemEdit:boolean=false;
  onSystemEdit(){
    this.isSystemEdit=true;
    this.initData(true);
  }
  onPersonalEdit(){
    this.isSystemEdit=false;
    this.initData();
  }
  onInputFocus(e:any){
    this.isEditing = true;
  }

  checkUserPermission(data:any){
    if(this.user.administrator || this.user.funtionAdmin || this.user.systemAdmin){
      return true;
    }
    else{
      if(data.createdBy != this.user.userID){
        return false;
      }
    }
    return false;
  }

  getFormSettingItem(item:any){

    if(!item?.recID) return;
    this.api.execSv('CO','ERM.Business.CO','FormSettingsBusiness','GetFormSettingsByIDAsync',[item.recID]).subscribe((res:any)=>{
      if(res){
        item.permissions = res.permissions;
        item.settingType=res.settingType;
        this.lstShared[item.recID]=res.permissions;
        item = JSON.parse(JSON.stringify(item))
      }
    })
  }
}
