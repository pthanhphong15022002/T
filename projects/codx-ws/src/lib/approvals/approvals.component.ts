import { AfterViewInit, Component, ComponentRef, Input, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { WSUIComponent } from '../default/wsui.component';
import { components } from './routing';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent extends WSUIComponent implements AfterViewInit {
  
  @Input() modules:any;
  @ViewChild('content', { read: ViewContainerRef, static: false })
  content!: ViewContainerRef;

  private components = components

  override onInit(): void {
    this.getModule();
  }
  

  ngAfterViewInit(): void {
    let component: Type<any> = this.components.cpnApproval;
    this.loadContent(component,null)
  }

  getModule()
  {
    if(!this.modules) this.modules = this.router?.url.split("/")[2].toUpperCase();
  }
  
  loadContent(cpn:any,funcID:any)
  {
    let componentRef = this.content.createComponent<ApprovalsComponent>(cpn);
    if(funcID) componentRef.instance.funcID = funcID;
  }

  clickChange(funcID:any)
  {
    //functionID form xét duyệt (runmode = 1)
    let component:Type<any> = null;

    if(funcID == "All") component = this.components.cpnApproval;
    else
    {
      if(funcID.includes("OD")) {
        funcID = "ODT71";
        component = this.components.cpnDispatches;
      }
      else if(funcID.includes("HR")) {
        funcID = "HRTAppro01";
        component = this.components.cpnEmployeeContract;
      }
      else if(funcID.includes("ES")) {
        funcID = "EST021";
        component = this.components.cpnSignFile;
      }
      else if(funcID.includes("EP")) {
        if(funcID == "EPT11") funcID = "EPT401"; // Duyệt Phòng
        else if(funcID == "EPT21") funcID = "EPT402"; // Duyệt Xe
        else funcID = "EPT403"; // Duyệt VPP
        component = this.components.cpnBooking;
      }
      else if(funcID.includes("AC")) {
        funcID = funcID + "Appro";
        component = this.components.cpnCashPayment;
      }
      // switch(module)
      // {
      //   case "All":
      //   {
      //     component = this.components.cpnApproval;
      //     break;
      //   }
      //   case "OD":
      //   {
      //     funcID = "ODT71";
      //     component = this.components.cpnDispatches;
      //     break;
      //   }
      //   case "HR":
      //   {
      //     funcID = "HRTAppro01";
      //     component = this.components.cpnEmployeeContract;
      //     break;
      //   }
      //   case "ES":
      //   {
      //     funcID = "EST012";
      //     component = this.components.cpnSignFile;
      //     break;
      //   }
      //   case "EP":
      //   {
      //     funcID = "EPT401";
      //     component = this.components.cpnBooking;
      //     break;
      //   }
      //   case "AC":
      //   {
      //     debugger
      //   }
      // }
    }
   
    if(this.content) this.content.clear();
    this.loadContent(component,funcID)
  }
}
