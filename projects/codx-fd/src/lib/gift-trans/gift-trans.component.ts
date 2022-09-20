import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Inject, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthService, ButtonModel, NotificationsService, RequestModel, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { mode } from 'crypto-js';

@Component({
  selector: 'lib-gift-trans',
  templateUrl: './gift-trans.component.html',
  styleUrls: ['./gift-trans.component.scss']
})
export class GiftTransComponent extends UIComponent implements OnInit,AfterViewInit {
    views:Array<ViewModel>;
    buttonAdd: ButtonModel;
    service:string = "FD";
    assemblyName:string = "ERM.Business.FD";
    className:string = "GiftTransBusiness"
    predicate:string ="";
    dataValue:string ="";
    entityName:string ="FD_GiftTrans";
    funcID:string ="";
    //
    listGiftTran:any[] = [];
    selectedGiftID:string = "";
    @ViewChild("itemTemplate") itemTemplate:TemplateRef<any>;
    @ViewChild("panelRightRef") panelRightRef:TemplateRef<any>;
    @ViewChild("panelLefRef") panelLefRef:TemplateRef<any>;
    
    constructor(
        private injector:Injector,
        private auth:AuthService,
        private notifiSV:NotificationsService,
        private route:ActivatedRoute,
        private dt:ChangeDetectorRef
    ) 
    {
        super(injector);
    }

    onInit() {
    }

    ngAfterViewInit(): void {
        this.buttonAdd = {
            id: 'btnAdd',
            };
        this.views = [{
            type : ViewType.listdetail,
            active : true,
            sameData: true,
            model:{
                template: this.itemTemplate,
                panelRightRef: this.panelRightRef,
                panelLeftRef :this.panelLefRef
            }
        }];
        this.dt.detectChanges();
    }

    clickMF(event:any,data:any){

    }


    clickShowAssideRight() {
    }
    selectedChange(event:any){
        if(!event || !event.data) return;
        this.selectedGiftID = event.data.recID;
        this.dt.detectChanges();
    }
}
