import { Component, HostBinding } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxService, SidebarModel } from 'codx-core';
import { NoteSliderComponent } from '../note-slider/note-slider.component';

@Component({
  selector: 'codx-notes',
  templateUrl: './codx-notes.component.html',
  styleUrls: ['./codx-notes.component.css']
})
export class CodxNotesComponent {
  @HostBinding('class') get class() {
    return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
 }
 funcID:string = "WPT08";
 function:any = null;
 constructor(
  private api:ApiHttpService,
  private callFc:CallFuncService,
  private cache:CacheService,
  public codxService:CodxService
) 
{ }


  ngOnInit(): void {
    // get function
    if (this.funcID) {
      this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func){
          this.function = JSON.parse(JSON.stringify(func));
        }
      });
    }
  }


  ngAfterViewInit(): void {

  }
  openNoteSilder() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.callFc.openSide(NoteSliderComponent, '', option);
  }
}
