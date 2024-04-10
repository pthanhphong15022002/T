import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, UIComponent, UserModel, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'wp-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.css']
})
export class KnowledgeComponent extends UIComponent implements AfterViewInit {


  user:UserModel;
  views:ViewModel[];
  @ViewChild("tmpContent") tmpContent : TemplateRef<any>;
  constructor
  (
    private injector : Injector,
    private auth:AuthStore    
  ) 
  {
    super(injector);
    this.user = auth.get();
  }

  override onInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.views = [
      {
        type : ViewType.content,
        showFilter : false,
        sameData : true,
        model : {
          panelLeftRef : this.tmpContent
        }
      }
    ]
  }

}
