import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'lib-property-datetime',
  templateUrl: './property-datetime.component.html',
  styleUrls: ['./property-datetime.component.css']
})
export class PropertyDatetimeComponent extends BasePropertyComponent implements AfterViewInit , OnChanges{
  @ViewChild('cbbDependence') combobox!: ComboBoxComponent;

  fields: Object = {text: 'text', value: 'id'};
  dependenceData: { [key: string]: Object }[] = [];

  ngAfterViewInit(): void {
    this.getDataDependence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.data?.currentValue != changes?.data?.previousValue) {
      this.getDataDependence();
    }
  }

  getDataDependence()
  {
    this.dependenceData = [];
    let dtTable = JSON.parse(JSON.stringify(this.dataTable));
    dtTable = dtTable.slice(0,(this.data.columnOrder + 1));
    dtTable.forEach(element => {
      if(element.columnOrder <= this.data.columnOrder)
      {
        if(element.columnOrder == this.data.columnOrder)
        {
          element.children = element.children.slice(0,this.data.columnNo);
        }

        element.children.forEach(elm2=>{
          if(elm2.dataType == "DateTime")
          {
            var obj =  { id: elm2.fieldName , text: elm2.title };
            this.dependenceData.push(obj);
          }
        })
      }
    });
    
    this.combobox.dataSource = this.dependenceData;
    this.combobox.value = this.data?.dependence || "";
    
    this.combobox.refresh();
    this.ref.detectChanges();
  }

  changeValueDate(e:any)
  {
    this.data[e?.field] = e?.data?.fromDate;
    this.dataChange.emit(this.data);
  }
 
}
