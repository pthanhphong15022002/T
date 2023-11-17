import { Component, ViewChild, Injector, Optional, ChangeDetectorRef } from "@angular/core";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { UIComponent, FormModel, DialogRef, NotificationsService, AuthService, DialogData, Util, AuthStore } from "codx-core";
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
public field:any ={ dataSource: [], id: 'nodeId', text: 'nodeText', child: 'nodeChild', iconCss: 'icon', imageUrl: 'image' };
override onInit(): void {

  this.initData();
}

initData(){
  this.isLoaded = false;
  this.selectedData=undefined;
  this.addData= undefined;
  let arrButtons:any=[];
  this.api.execSv('SYS','SYS','FormSettingsBusiness','GetFormSettingAsync','Comments').subscribe((res:any)=>{
    this.data = res;
    let lstRecID:any=[];
    this.data.map((x:any)=> {

      lstRecID.push(x.recID);
      if(x.smallIcon && x.smallIcon.includes('api/')){
        x.smallIcon = environment.urlUpload+'/'+x.smallIcon;
      }
      if(x.functionType == 'G'){
        let objButton:any={};
        objButton.recID = Util.uid();
        objButton.parentID = x.recID;
        objButton.customName = "Thêm chức năng";
        objButton.isButton = true;
        arrButtons.push(objButton);
        x.hasChild = true;
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
        if(!this.user.administrator && !this.user.systemAdmin){

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
    this.headerText = dialogData?.data[2];
    this.funcID = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.dialogRef.formModel = this.formModel;
    this.cache.valueList('SYS064').subscribe((res: any) => {
      this.vllShared = res.datas;
    })
    this.user = this.authStore.get();

  }



  selectedItem:any;
  selectedData:any;
  addData:any;
  isPersonal:boolean=false;
  onSelected(e:any){
    this.selectedItem = e.nodeData;
    this.selectedData = undefined;
    setTimeout(()=>{
      let item = this.data.find((x:any)=>x[this.field.id]==e.nodeData.id);
      if(item){
        if(item.isAddNew){
          this.isEditGroup = false;
          this.isAddFunc = true;
          this.isAddGroup = false;
          this.isEditFunc=false;
          return;
        }
        if(!this.user.administrator && !this.user.systemAdmin){
          this.selectedData = this.datasource.find(x=>x.oldID==item.recID);
          if(this.selectedData){
            if(this.selectedData.refID){
              this.isEnableEdit = false;
              this.selectedData.url = item.url;
            }
            else this.isEnableEdit = true;
          }
          else{
            this.selectedData = this.datasource.find(x=>x.recID==item.recID);
          if(this.selectedData){
            if(this.selectedData.refID){
              this.isEnableEdit = false;
              this.selectedData.url = item.url;
            }
            else this.isEnableEdit = true;
          }
          }
        }
        else{
          this.selectedData = this.datasource.find(x=>x.recID==item.recID);
          if(this.selectedData){
            if(this.selectedData.refID){
              this.isEnableEdit = false;
              this.selectedData.url = item.url;
            }
            else this.isEnableEdit = true;
          }
        }
        // this.api.execSv('SYS','SYS','FormSettingsBusiness','GetFormAsync',item.recID).subscribe((res:any)=>{
        //   this.selectedData = res;
        //   if(this.selectedData.refID){
        //     this.isEnableEdit = false;
        //     this.selectedData.url = item.url;
        //   }
        //   else this.isEnableEdit = true;
        // })


        if(item.functionType == 'G'){
          this.isEditGroup = true;
          this.isAddFunc = false;
          this.isAddGroup = false;
          this.isEditFunc=false;
        }
        else{
          this.api.execSv('SYS','SYS','FormSettingsBusiness','GetListSharedAsync',item.recID).subscribe((res:any)=>{
            this.lstShared[item.recID]=res;
          })
          this.isEditGroup = false;
          this.isAddFunc = false;
          this.isAddGroup = false;
          this.isEditFunc=true;
        }
      }
    },100)

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

  nodeDropped(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    let item = this.data.find((x:any)=>x[this.field.id] == dragItem.id);
    let idField = 'recID';
    if(this.datasource[0].oldID) idField='oldID'
    if(item){
      if(!targetNode.parentID){
        let data = this.datasource.find((x:any)=>x[idField]==item.recID);
        let targetData = this.datasource.find((x:any)=>x[idField]==targetNode.id);
        if(data && targetData){
          if(data.category == 'F')
            data.parentID = targetData.recID;
        }
      }
      else{
        let data = this.datasource.find((x:any)=>x[idField]==item.recID);
        let targetData = this.datasource.find((x:any)=>x[idField]==targetNode.parentID);
        if(data && targetData){
          if(data.category == 'F')
            data.parentID = targetData.recID;
        }

      }


    }

  }

  nodeDragStop(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    if(dragItem.parentID && e.dropLevel == 1 && !targetNode){
      e.cancel = true;
      return;
    }
    let targetItem = this.data.find((x:any)=>x[this.field.id]==targetNode?.id);
    if(targetItem){
      if(targetItem.functionType != 'G' && e.position == 'Inside'){
        e.cancel=true;
        return;
      }
    }
    else{
      e.cancel=true;
    }
  }

  nodeDragging(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
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
  }

  nodeclicked(args: any) {
    // if (args.node.classList.contains('e-level-1')) {
    //     this.tree.selectedNodes = [args.node.getAttribute('data-uid') as string];
    // }
  }

  valueChange(e:any){
    this.selectedData[e.field] = e.data;
    this.editedFunc[this.selectedData.recID] = this.selectedData;
  }

  valueAddChange(e:any){
    this.addData[e.field] = e.data;
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
        objShare.entityID='SYS_FormSettings';
        objShare.shareToType = e.data[i].objectType;
        objShare.shareToID= e.data[i].id;
        objShare.text = e.data[i].text;
        objShare.objectName = e.data[i].objectName;
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
      this.selectedData.name=item.CustomName;
    }
    this.editedFunc[this.selectedData.recID] = this.selectedData;
    this.changeDetect.detectChanges();
  }

  valueCbbAddChange(e:any){
    if(e.data.dataSelected[0]){
      let item = e.data.dataSelected[0].dataSelected;
      if(item.FunctionID) this.isEnableEdit = false;
      else this.isEnableEdit = true;
      this.addData.url = item.Url;
      this.addData.refID=item.FunctionID;
      this.addData.name=item.CustomName
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
      this.addData.userID = this.user.userID;
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
      if(this.datasource[0].oldID) idField='oldID'

      this.addData = {
        userID: this.user.userID,
        recID: Util.uid(),
        parentID: parentID,
        category: 'F',
        formName:'Comments',
        settingType:'1',
        sorting: this.datasource.length,
        name:'Chức năng mới'
      }
      let parent = this.datasource.find((x:any)=>x[idField]==parentID);
      if(parent){
        this.addData.parentID = parent.recID;
      }
      let item: { [key: string]: Object } = { recID: this.addData.recID, customName: "Chức năng mới",parentID:parentID, functionType:'F',isAddNew:true };
      this.tree?.addNodes([item], parentID, null as any);
      this.data.push(item);
      this.data.sort((x:any, y:any)=> {
        return (x.isButton === y.isButton)? 0 : x.isButton? 1 : -1;

      });

      this.tree.refresh()
      setTimeout(()=>{
        this.tree.selectedNodes= [this.addData.recID];
        this.tree?.beginEdit(this.addData.recID);
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
    this.isEditGroup = false;
    this.isAddFunc = false;
    this.isAddGroup = true;
    this.isEditFunc=false;
    this.addData = {};
    this.addData.recID = Util.uid();
    this.addData.category = 'G';
    this.addData.formName='Comments';
    this.addData.settingType='1';
    this.addData.userID = this.user.userID;
    this.addData.sorting = this.datasource.length
  }
  imgChanged(e:any){
    if(this.selectedData && e.length){
      this.selectedData.image = e[0].pathDisk
      this.editedFunc[this.selectedData.recID] = this.selectedData;
    }
  }

  imgAddChanged(e:any){
    if(this.addData && e.length){
      this.addData.image = e[0].pathDisk
      //this.editedFunc[this.selectedData.recID] = this.selectedData;
    }
  }

  onSaveForm(){

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

  onSaveAdmin(){
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
        if(this.user.administrator || this.user.systemAdmin) delete this.addData.userID;
        this.api.execAction('SYS_FormSettings',[this.addData],'SaveAsync',true).subscribe((res:any)=>{
         if(this.user.systemAdmin || this.user.administrator){
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
              this.initData();
            }
          )}
        })
       }

    })

  }
  onRestore(){
    this.notificationsService.alertCode("SYS046").subscribe((res:any)=>{
      if(res && res.event.status=='Y'){

        this.api.execSv('SYS','SYS','FormSettingsBusiness','RestoreUserSettingsAsync',null).subscribe((res:any)=>{
          if(res){
            this.notificationsService.notifyCode('SYS007');
            this.initData();
          }
        })
      }
    });
  }

  onDeleteFunc(recID:any){
    if(recID){
      let idField = 'recID';
      if(this.datasource[0].oldID) idField='oldID';
      let item = this.datasource.find((x:any)=>x[idField]==recID);
      if(item){
        if(item.oldID){
          let idx = this.datasource.indexOf(item);
          if(idx>-1){
            this.datasource.splice(idx,1);
            this.api.execAction('SYS_FormSettings',this.datasource,'SaveAsync',true).subscribe((res:any)=>{

              if(!res.error){

                setTimeout(()=>{
                  this.initData();
                }
              )}
            })
          }
          return;
        }
        else{
          let arrRelated = this.datasource.filter((x:any)=>x.parentID==item.recID);
          arrRelated.push(item)
          this.api.execAction('SYS_FormSettings',[item],'DeleteAsync',true).subscribe((res:any)=>{
            if(!res.error){
              this.api.execSv('SYS','SYS','FormSettingsBusiness','DeleteFormSharingAsync',{RecID:[arrRelated.map((x:any)=> x.recID)]}).subscribe((res:any)=>{
                if(res){
                  this.initData();
                }
              })

            }
          })
        }
      }
      else{
        let dataIdx= this.data.findIndex((x:any)=>x.recID==recID)
        if(dataIdx >-1){
          this.data.splice(dataIdx,1);
          this.tree?.refresh();
        }
      }
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
    this.addData.name = e.newText;
  }
}
