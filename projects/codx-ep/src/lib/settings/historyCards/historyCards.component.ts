import { AfterViewInit, Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
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
  
  @ViewChild('subTitle') tranTypeCol: TemplateRef<any>;
  @ViewChild('subTitle') userIDCol: TemplateRef<any>;
  @ViewChild('subTitle') createByCol: TemplateRef<any>;
  // service = 'EP';
  // assemblyName = 'EP';
  // entityName = 'EP_ResourceTrans';
  // predicate = 'ResourceType=@0';
  // dataValue = '1';
  // idField = 'recID';
  // className = 'ResourceTransBusiness';
  // method = 'GetAsync';
  
  funcID:any;
  formModel:FormModel;
  columnGrids:any;
  views:any;
  id:any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.id = this.router.snapshot.params['id'];
          
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
          this.columnGrids = [
            {
              field: 'tranType',
              headerText: gv['tranType'].headerText,
              width: 350,
              template: this.tranTypeCol,
            },
            {
              field: 'createOn',
              headerText: gv['CreateOn'].headerText,
              width: 200,
              headerTextAlign: 'Center',
            },
            {
              field: 'userID',
              headerText: gv['UserID'].headerText,
              template: this.userIDCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },          
            {
              field: 'note',
              headerText: gv['Note'].headerText,
              width: 200,
              headerTextAlign: 'Center',           
            },
            {
              field: 'createBy',
              headerText: gv['CreateBy'].headerText,
              width: 200,
              template: this.createByCol,
              headerTextAlign: 'Center',
            },
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
