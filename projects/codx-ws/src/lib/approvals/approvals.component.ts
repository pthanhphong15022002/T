import { AfterViewInit, Component, ComponentRef, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { components } from './routing';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent extends WSUIComponent implements AfterViewInit {
 
  @ViewChild('content', { read: ViewContainerRef, static: false })
  content!: ViewContainerRef;
  private components = components
  
  override onInit(): void {
  }
  
  ngAfterViewInit(): void {
    let component: Type<any> = this.components.cpnApproval;
    this.loadContent(component,null)
  }

  loadContent(cpn:any,funcID:any)
  {
    let componentRef = this.content.createComponent<ApprovalsComponent>(cpn);
    if(funcID) componentRef.instance.funcID = funcID;
  }

  menuChange(menuID:any)
  {
    let funcID = ""; //functionID form xét duyệt (runmode = 1)
    let component:Type<any> = null;
    switch(menuID)
    {
      case "All":
      {
        component = this.components.cpnApproval;
        break;
      }
      case "OD":
      {
        funcID = "ODT71";
        component = this.components.cpnDispatches;
        break;
      }
    }
    this.content.clear();
    this.loadContent(component,funcID)
  }
}
