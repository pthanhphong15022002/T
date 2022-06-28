import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  Injector,
} from '@angular/core';
import { ApiHttpService, AuthStore, DataRequest, UserModel, ViewType, ViewModel, UIComponent, ButtonModel } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import {
  AccPoints,
  IAccAnimationCompleteEventArgs,
  ILoadedEventArgs,
  AccumulationChartComponent,
  AccumulationChart,
  AnimationModel,
} from '@syncfusion/ej2-angular-charts';
import { SelectweekComponent } from 'projects/codx-share/src/lib/components/selectweek/selectweek.component';
import { CodxDMService } from '../codx-dm.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
}) 
export class HomeComponent extends UIComponent {
  @ViewChild('templateMain') templateMain: TemplateRef<any>;  
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  path: string;
  button?: ButtonModel;
  views: Array<ViewModel> = [];
  constructor(
    inject: Injector,
    private tmService: CodxDMService,
  ) { 
    super(inject);
  }

  // ngOnInit() {
  // }

  onInit(): void {  
    this.path = this.getPath();
    this.button = {
                      id: "btnAdd"
                  };  

  }

  getPath() {
    var url = window.location.origin;
    return url;
  }

  setFullHtmlNode(folder, text) {
    var item1 = '';
    var item2 = '';

    if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
      item1 = '<img class="max-h-18px" src="../../../assets/demos/dms/folder.svg">';
    else {
      if (folder.icon.indexOf(".") == -1)
        item1 = `<i class="${folder.icon}" role="presentation"></i>`;
      else {
        var path = `${this.path}/${folder.icon}`;
        item1 = `<img class="max-h-18px" src="${path}">`;
      }
    }

    if (!folder.read)
      item2 = `<i class="icon-per no-permission" role="presentation"></i>`;
    var fullText = `${item1}
                    ${item2} 
                    <span class="mytree_node"></span>
                    ${text}`;

    return fullText;
  }

  onSelectionChanged($data) { 
    console.log($data);
  }

  checkUserForder(data) {
    return false;
  }
  // displayData(data) {
  //   console.log(data);
  //   return "test";
  // }

  ngAfterViewInit(): void {   
  //   this.views = [
  //   {
  //     type: ViewType.listdetail,
  //     active: true,
  //     sameData: true,
  //     model: {
  //       template: this.template,
  //       panelLeftRef: this.panelLeft,
  //       panelRightRef: this.panelRight,
  //       contextMenu: '',
  //     },
  //   },
  // ];

  // this.views = [
  //   {
  //     type: ViewType.list,
  //     active: true,
  //     sameData: true,
  //     model: {
  //       template: this.itemTemplate,

  //     },
  //   },
  //   {
  //     type: ViewType.listdetail,
  //     active: false,
  //     sameData: true,
  //     model: {
  //       template: this.itemTemplate,
  //       panelRightRef: this.panelRight,
  //     },
  //   },
  //   {
  //     type: ViewType.kanban,
  //     active: false,
  //     sameData: true,
  //     request2: this.resourceKanban,
  //     model: {
  //       template: this.cardKanban,
  //     },
  //   },
  //   {
  //     type: ViewType.schedule,
  //     active: false,
  //     sameData: true,
  //     request2: this.modelResource,
  //     model: {
  //       eventModel: this.fields,
  //       resourceModel: this.resourceField,
  //       template: this.eventTemplate,
  //       template3: this.cellTemplate
  //     },
  //   },
  // ];

    this.views = [
      {
        type: ViewType.treedetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateMain,  
       //   panelRightRef: this.templateRight
        }
      },
      // {
      //   type: ViewType.list,
      //   active: true,
      //   sameData: true,
      //   model: {
      //     template: this.templateMain,
      //     panelRightRef: this.templateRight,
      //   },
      // },
    ]    
   }
}
