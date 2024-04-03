import {
  AfterViewInit,
  Component,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { isObservable } from 'rxjs';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'lib-property-cbb-dependence',
  templateUrl: './property-cbb-dependence.component.html',
  styleUrls: ['./property-cbb-dependence.component.css'],
})
export class PropertyCbbDependenceComponent
  extends BasePropertyComponent
  implements OnChanges, AfterViewInit
{
  @ViewChild('cbbDependence') combobox!: ComboBoxComponent;
  @ViewChild('cbb2') combobox2!: ComboBoxComponent;

  fields: Object = { text: 'text', value: 'id' };
  dependenceCBBData: { [key: string]: Object }[] = [];
  cbbData: { [key: string]: Object }[] = [];
  dtCbb: any;
  vaidateControl: any;

  ngAfterViewInit(): void {
    this.getDataDependenceCBB();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.data?.currentValue != changes?.data?.previousValue) {
      this.vaidateControl =
        typeof this.data?.validateControl == 'string'
          ? JSON.parse(this.data.validateControl)
          : this.data.validateControl;
      if (!this.vaidateControl) this.vaidateControl = {};
      this.getDataDependenceCBB();
    }
  }

  getDataDependenceCBB() {
    if (!this.dataTable) return;
    this.dependenceCBBData = [];
    let dtTable = JSON.parse(JSON.stringify(this.dataTable));
    dtTable = dtTable.slice(0, this.data.columnOrder + 1);
    dtTable.forEach((element) => {
      if (element.columnOrder <= this.data.columnOrder) {
        if (element.columnOrder == this.data.columnOrder) {
          element.children = element.children.slice(0, this.data.columnNo);
        }

        element.children.forEach((elm2) => {
          if (elm2.fieldType == 'ComboBox') {
            var obj = {
              id: elm2.refValue,
              text: elm2.title,
              columnOrder: elm2.columnOrder,
              columnNo: elm2.columnNo,
            };
            this.dependenceCBBData.push(obj);
          }
        });
      }
    });

    if (this.combobox) {
      this.combobox.dataSource = this.dependenceCBBData;
      this.combobox.value = this.vaidateControl?.dependenceID || '';
      this.combobox.refresh();
      if (this.combobox.value) this.changeValueCBB(this.combobox.value);
    }

    if (this.combobox) {
      this.cbbData = [];
      this.combobox2.dataSource = [];
      this.combobox2.value = this.vaidateControl?.dependenceValue || '';
      this.combobox2.refresh();
    }

    this.ref.detectChanges();
  }

  changeValueCBB(refValue: any) {
    if (!refValue) return;
    this.vaidateControl.dependenceID = refValue;
    this.dtCbb = this.dependenceCBBData.filter((x) => x.id == refValue)[0];
    let cbb = this.shareService.loadCombobox(refValue);
    if (isObservable(cbb)) {
      cbb.subscribe((item) => {
        this.genCbb(item);
      });
    } else this.genCbb(cbb);
  }

  changeValueCCBB(dt: any) {
    this.vaidateControl.dependenceValue = dt;
    let index = this.cbbData.findIndex((x) => x.id == dt);
    var str = this.data.fieldName + '={' + index + '}';
    if (this.dtCbb) {
      let de =
        this.dataTable[this.dtCbb.columnOrder].children[this.dtCbb.columnNo]
          ?.dependences;
      if (!de) de = str;
      else {
        let omd = de.indexOf(this.data.fieldName + '={');
        if (omd >= 0) {
          let startIndex = de.indexOf('{', omd);
          let endIndex = de.indexOf('}', omd);
          de = this.replaceBetween(de, startIndex + 1, endIndex, index);
        } else de += ';' + str;
      }

      this.dataTable[this.dtCbb.columnOrder].children[
        this.dtCbb.columnNo
      ].dependences = de;
    }

    this.data.validateControl = JSON.stringify(this.vaidateControl);
    this.dataChange.emit(this.data);
    this.dataChangeTableEmit.emit(this.dataTable);
  }

  replaceBetween(origin: any, startIndex: any, endIndex: any, insertion: any) {
    return (
      origin.substring(0, startIndex) + insertion + origin.substring(endIndex)
    );
  }

  genCbb(data: any) {
    let arr = data.tableFields.split(';');
    arr.forEach((element) => {
      var obj = { id: element, text: element };
      this.cbbData.push(obj);
    });
    this.combobox2.dataSource = this.cbbData;
    this.combobox2.value = this.vaidateControl?.dependenceValue || '';
    this.combobox2.refresh();
  }
}
