import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CallFuncService, DialogModel } from "codx-core";
import { PopupViewContentComponent } from "./popup-view-content.component";

@Component({
  selector: 'codx-view-content',
  templateUrl: './codx-view-content.component.html',
  styleUrls: ['./codx-view-content.component.scss'],
})
export class CodxViewContentComponent implements AfterViewInit {
  @ViewChild('body') body:TemplateRef<any>;
  constructor( private router: Router,
    private route: ActivatedRoute,
    private callfunc: CallFuncService) {


  }
  ngAfterViewInit(){
    this.openDialog();
  }
  openDialog() {
    let option = new DialogModel;
    option.IsFull = true;
    let dialog = this.callfunc.openForm(PopupViewContentComponent,'',10,10,"",null,"",option);
    dialog.closed.subscribe(res=>{
      console.log(res);

    })
  }


}
