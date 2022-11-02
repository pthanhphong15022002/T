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

  @ViewChild('tranTypeCol') tranTypeCol: TemplateRef<any>;
  @ViewChild('userIDCol') userIDCol: TemplateRef<any>;
  @ViewChild('createByCol') createByCol: TemplateRef<any>;  
  @ViewChild('transDateCol') transDateCol: TemplateRef<any>;
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
              field: 'transType',
              headerText: gv?.TransType?.headerText,
              width: "15%",
              template: this.tranTypeCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },
            {
              field: 'transDate',
              headerText: gv?.TransDate?.headerText,
              width: 200,
              template : this.transDateCol,
            },
            {
              field: 'userID',
              headerText: gv?.UserID?.headerText,
              width: 250,
              template: this.userIDCol,
            },          
            {
              field: 'note',
              headerText: gv?.Note?.headerText,
              width: "20%",          
            },
            {
              field: 'createdBy',
              headerText: "Người tạo",//gv?.CreateBy?.headerText,
              width: 250,
              template: this.createByCol,
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
