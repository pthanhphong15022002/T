import { AfterViewInit, Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, FormModel, ViewType } from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'ep-history-card',
  templateUrl: 'ep-history-card.component.html',
  styleUrls: ['ep-history-card.component.scss'],
})
export class EPHistoryCardComponent
  extends UIComponent
  implements AfterViewInit
{
  
  @ViewChild('tranTypeCol') tranTypeCol: TemplateRef<any>;
  @ViewChild('userIDCol') userIDCol: TemplateRef<any>;
  @ViewChild('createByCol') createByCol: TemplateRef<any>;  
  @ViewChild('transDateCol') transDateCol: TemplateRef<any>;
  @ViewChild('noteCol') noteCol: TemplateRef<any>;
  service = 'EP';
  assemblyName = 'EP';
  entityName = 'EP_ResourceTrans';
  idField = 'recID';
  className = 'ResourceTransBusiness';
  method = 'GetAsync';
  dataValue='';
  predicate='ResourceID=@0'
  viewType = ViewType;
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
    this.dataValue = this.router.snapshot.params['id'];
          
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
              field: 'transType',
              headerText: gv?.TransType?.headerText || 'TransType',
              width: "15%",
              template: this.tranTypeCol,
              headerTextAlign: 'Center',
              textAlign: 'Center',
            },
            {
              field: 'transDate',
              headerText: gv?.TransDate?.headerText || 'TransDate',
              width: 200,
              template : this.transDateCol,
            },
            {
              field: 'userID',
              headerText: gv?.UserID?.headerText || 'UserID',
              width: 250,
              template: this.userIDCol,
            },          
            {
              field: 'note',
              headerText: gv?.Note?.headerText || 'Note',
              width: "20%",   
              template: this.noteCol,       
            },
            {
              field: 'createdBy',
              headerText: gv?.CreatedBy?.headerText || 'CreatedBy',
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
