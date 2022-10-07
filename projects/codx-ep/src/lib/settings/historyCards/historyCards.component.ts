import { AfterViewInit, Component, inject, Injector } from '@angular/core';
import { UIComponent, FormModel, ViewType } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'setting-historyCards',
  templateUrl: 'historyCards.component.html',
  styleUrls: ['historyCards.component.scss'],
})
export class HistoryCardsComponent
  extends UIComponent
  implements AfterViewInit
{
  
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_Resources';
  predicate = 'ResourceType=@0';
  dataValue = '1';
  idField = 'recID';
  className = 'ResourcesBusiness';
  method = 'GetListAsync';
  
  funcID:any;
  formModel:FormModel;
  columnGrids:any;
  views:any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
          
  }
  onInit(): void {
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.formModel = res;        
        
      }
    });
  }

  ngAfterViewInit(): void {}
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          //this.grvRooms=gv;
          this.columnGrids = [
            {
              field: 'resourceName',
              headerText: gv['ResourceName'].headerText,
              width: 350,//gv['ResourceID'].width,
              //template: this.resourceNameCol,
            },
            {
              headerText: gv['Location'].headerText,
              width: 200,//gv['Location'].width,
              field: 'location',
              //template: this.locationCol,
              headerTextAlign: 'Center',
            },
            {
              headerText: gv['Equipments'].headerText,
              width: 100,//gv['Equipments'].width,
              field: 'equipments',
              //template: this.equipmentsCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },          
            {
              headerText: gv['Note'].headerText,
              width: 200,//gv['Note'].width,
              field: 'note',
              headerTextAlign: 'Center',           
            },
            {
              headerText: gv['Owner'].headerText,
              //width:gv['Owner'].width,
              width: 200,
              //template: this.ownerCol,
              headerTextAlign: 'Center',
            },
            // {
            //   headerText: 'Người chuẩn bị',//gv['Owner'].headerText,
            //   width:gv['Owner'].width,
            //   //width: 200,
            //   template: this.preparatorCol,
            //   headerTextAlign: 'Center',
            // },
          ];
          this.views = [
            {
              sameData: true,
              type: ViewType.grid,
              active: true,
              model: {
                resources: this.columnGrids,
              },
            },            
          ];
          this.detectorRef.detectChanges();
        });
    }
  }
}
