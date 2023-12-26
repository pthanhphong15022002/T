import { AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-salcoeffemp',
  templateUrl: './salcoeffemp.component.html',
  styleUrls: ['./salcoeffemp.component.css']
})
export class SalcoeffempComponent extends UIComponent{
  

  views:ViewModel[];
  buttonAdd:ButtonModel[];
  @ViewChild("tmpLeft") tmpLeft:TemplateRef<any>;
  @ViewChild("tmpRight") tmpRight:TemplateRef<any>;

  constructor
  (
    private injector:Injector
  ) 
  {
    super(injector);
  }

  override onInit(): void {

  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type:ViewType.content,
        showFilter:false,
        sameData:false,
        model:{
          panelLeftRef: this.tmpLeft,
          panelRightRef: this.tmpRight,
          collapsed: true,
          resizable: true
        }
      }
    ];
    this.buttonAdd = [{
      id: 'btnAdd',
    }];
  }
}
