import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnChooserService, ColumnMenuService, EditService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService, VirtualScrollService } from '@syncfusion/ej2-angular-grids';




@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [ PageService, SortService, FilterService, EditService, ResizeService,ColumnMenuService, ColumnChooserService, ToolbarService,VirtualScrollService]
})
export class TableGripModule { }
