import { AfterViewInit, Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, FormModel, ViewType, ButtonModel } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'booking-cardTran',
  templateUrl: 'cardTrans.component.html',
  styleUrls: ['cardTrans.component.scss'],
})
export class CardTransComponent
  extends UIComponent
  implements AfterViewInit
{
  
  @ViewChild('subTitle') tranTypeCol: TemplateRef<any>;
  @ViewChild('subTitle') userIDCol: TemplateRef<any>;
  @ViewChild('subTitle') createByCol: TemplateRef<any>;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_ResourceTrans';
  idField = 'recID';
  className = 'ResourceTransBusiness';
  method = 'GetListAsync';
  viewType = ViewType;
  funcID:any;
  formModel:FormModel;
  columnGrids:any;
  views:any;
  button:ButtonModel;
  id:any;
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
    this.button={
      id:'btnAdd',
    }
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
              headerText: gv?.TranType?.headerText,
              width: '15%',
              template: this.tranTypeCol,
            },
            {
              field: 'createOn',
              headerText: gv?.CreateOn?.headerText,
              width: '20%',
              headerTextAlign: 'Center',
            },
            {
              field: 'userID',
              headerText: gv?.UserID?.headerText,
              template: this.userIDCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
              width: '30%',
            },          
            {
              field: 'note',
              headerText: gv?.Note?.headerText,
              width: '35%',
              headerTextAlign: 'Center',           
            },
            {
              field: 'createBy',
              headerText: gv?.CreateBy?.headerText,
              width: '30%',
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
