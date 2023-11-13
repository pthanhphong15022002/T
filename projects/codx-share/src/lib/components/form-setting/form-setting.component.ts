import { Component, ViewChild, Injector, Optional } from "@angular/core";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { UIComponent, FormModel, DialogRef, NotificationsService, AuthService, DialogData, Util } from "codx-core";
import { CodxEpService } from "projects/codx-ep/src/public-api";

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
  data: any;
  headerText = '';
  fGroup: any;
  grView: any;
  disableEdit=false;
  hierarchicalData: any = [
    {
        nodeId: '01', nodeText: 'Music', icon: 'folder',
        nodeChild: [
            { nodeId: '01-01', nodeText: 'Gouttes.mp3', icon: 'audio' }
        ]
    },
    {
        nodeId: '02', nodeText: 'Videos', icon: 'folder',
        nodeChild: [
            { nodeId: '02-01', nodeText: 'Naturals.mp4', icon: 'video' },
            { nodeId: '02-02', nodeText: 'Wild.mpeg', icon: 'video' },
        ]
    },
    {
        nodeId: '03', nodeText: 'Documents', icon: 'folder',
        nodeChild: [
            { nodeId: '03-01', nodeText: 'Environment Pollution.docx', icon: 'docx' },
            { nodeId: '03-02', nodeText: 'Global Water, Sanitation, & Hygiene.docx', icon: 'docx' },
            { nodeId: '03-03', nodeText: 'Global Warming.ppt', icon: 'ppt' },
            { nodeId: '03-04', nodeText: 'Social Network.pdf', icon: 'pdf' },
            { nodeId: '03-05', nodeText: 'Youth Empowerment.pdf', icon: 'pdf' },
        ]
    },
    {
        nodeId: '04', nodeText: 'Pictures', icon: 'folder', expanded: true,
        nodeChild: [
            {
                nodeId: '04-01', nodeText: 'Camera Roll', icon: 'folder', expanded: true,
                nodeChild: [
                    { nodeId: '04-01-01', nodeText: 'WIN_20160726_094117.JPG', image: 'https://ej2.syncfusion.com/demos/src/images/employees/9.png' },
                    { nodeId: '04-01-02', nodeText: 'WIN_20160726_094118.JPG', image: 'https://ej2.syncfusion.com/demos/src/images/employees/3.png' },
                ]
            },
            { nodeId: '04-02', nodeText: 'Wind.jpg', icon: 'images' },
            { nodeId: '04-03', nodeText: 'Stone.jpg', icon: 'images' },
        ]
    },
    {
        nodeId: '05', nodeText: 'Downloads', icon: 'folder',
        nodeChild: [
            { nodeId: '05-01', nodeText: 'UI-Guide.pdf', icon: 'pdf' },
            { nodeId: '05-02', nodeText: 'Tutorials.zip', icon: 'zip' },
            { nodeId: '05-03', nodeText: 'Game.exe', icon: 'exe' },
            { nodeId: '05-04', nodeText: 'TypeScript.7z', icon: 'zip' },
        ]
    }
];
isLoaded:boolean=false;
public field:any ={ dataSource: this.hierarchicalData, id: 'nodeId', text: 'nodeText', child: 'nodeChild', iconCss: 'icon', imageUrl: 'image' };
override onInit(): void {

  this.api.execSv('SYS','SYS','FormSettingsBusiness','GetFormSettingAsync','Comments').subscribe((res:any)=>{
    this.data = res;
    let arrButtons:any=[];
    this.data.map((x:any)=> {
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
    //this.data = [...this.data,...arrButtons];
    this.field = {
      dataSource: this.data, id:'recID', text: 'customName', parentID: 'parentID',imageUrl:'smallIcon', hasChildren:'hasChild'
    }
    this.isLoaded = true;
  })
}

  constructor(
    injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.headerText = dialogData?.data[2];
    this.funcID = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.dialogRef.formModel = this.formModel;
  }

  onSaveForm(){

  }

  selectedItem:any;
  onSelected(e:any){
    this.selectedItem = e.nodeData;
    let item = this.data.find((x:any)=>x[this.field.id]==e.nodeData.id);
    if(item){
      if(item.functionType == 'G'){
        this.isEditGroup = true;
        this.isAddFunc = false;
        this.isAddGroup = false;
        this.isEditFunc=false;
      }
      else{
        this.isEditGroup = false;
        this.isAddFunc = false;
        this.isAddGroup = false;
        this.isEditFunc=true;
      }
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

  nodeDropped(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    let item = this.data.find((x:any)=>x[this.field.id] == dragItem.id);

    if(item){
      item[this.field.parentID] = targetNode.id;
      // if(this.tree){
      //   this.data = this.data.sort((x:any)=> x.isButton)
      //   this.tree.fields = this.field;
      //   this.tree.refresh();
      // }
    }


  }
  nodeDragStop(e:any){
    let dragItem = e.draggedNodeData;
    let targetNode = e.droppedNodeData;
    let targetItem = this.data.find((x:any)=>x[this.field.id]==targetNode.id);
    if(targetItem){
      if(targetItem.functionType != 'G' || targetItem[this.field.id] == dragItem.parentID){
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
    if(!e.dragItem.parentID){
      if(e.dropLevel > 1){
        e.dropIndicator='e-no-drop'
      }
    }
    if(!targetNode){
      e.dropIndicator='e-no-drop'
    }
    else{
      let targetItem = this.data.find((x:any)=>x[this.field.id]==targetNode.id);
      if(targetItem){
        if(targetItem.functionType != 'G' || targetItem[this.field.id] == dragItem.parentID){
         e.dropIndicator='e-no-drop'
        }
      }
      else{
        e.dropIndicator='e-no-drop'
      }
    }
  }

  nodeclicked(args: any) {
    if (args.event.which === 3) {
        this.tree.selectedNodes = [args.node.getAttribute('data-uid') as string];
    }
}


  onAddFunc(parentID){
    this.isEditGroup = false;
    this.isAddFunc = true;
    this.isAddGroup = false;
    this.isEditFunc=false;
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
  }
}
