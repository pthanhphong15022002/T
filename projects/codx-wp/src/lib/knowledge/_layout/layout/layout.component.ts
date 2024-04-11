import { Component, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';


@Component({
  selector: 'wp-knowledge-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  constructor(
    inject: Injector,
  ) 
  {
    super(inject);
    this.module = 'WP4';
    this.codxService.asideMode = "2";
    this.layoutModel.toolbarDisplay = false;
  }

  onInit() {
  }
  
  onAfterViewInit(): void {}
  
  asideClick(event:any){
    if(event)
    {
      event.cancel = true;
      this.codxService.navigate("", event.function.url, { category: event.function.recID } );
    }
  }
}
