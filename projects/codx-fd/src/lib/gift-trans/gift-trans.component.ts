import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Inject, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthService, ButtonModel, CRUDService, NotificationsService, RequestModel, ResourceModel, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { mode } from 'crypto-js';
import { PopupAddGiftComponent } from './popup-add-gift/popup-add-gift.component';

@Component({
    selector: 'lib-gift-trans',
    templateUrl: './gift-trans.component.html',
    styleUrls: ['./gift-trans.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GiftTransComponent extends UIComponent {
    views: Array<ViewModel>;
    buttonAdd: ButtonModel;
    service: string = "FD";
    assemblyName: string = "ERM.Business.FD";
    className: string = "GiftTransBusiness"
    predicate: string = "";
    dataValue: string = "";
    entityName: string = "FD_GiftTrans";
    //
    listGiftTran: any[] = [];
    selectedGiftID: string = "";
    @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
    @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;
    @ViewChild("panelLefRef") panelLefRef: TemplateRef<any>;


    constructor(
        private injector: Injector,
        private auth: AuthService,
        private notifiSV: NotificationsService,
        private route: ActivatedRoute,
        private dt: ChangeDetectorRef
    ) {
        super(injector);
    }

    onInit() {
        this.funcID = this.route.snapshot.paramMap.get('funcID');
        //console.log('funcID:', this.funcID);
    }

    ngAfterViewInit(): void {
        this.buttonAdd = {
            id: 'btnAdd',
        };
        this.views = [{
            type: ViewType.listdetail,
            active: true,
            sameData: true,
            model: {
                template: this.itemTemplate,
                panelRightRef: this.panelRightRef,
                panelLeftRef: this.panelLefRef
            }
        }];
        this.dt.detectChanges();
    }

    clickMF(event: any, data: any) {
    }


    clickShowAssideRight() {
        if (!this.view) return;
        let option = new SidebarModel();
        option.DataService = (this.view.dataService as CRUDService);
        option.FormModel = this.view.formModel;
        this.callfc.openSide(PopupAddGiftComponent, this.funcID, option, "");
    }
    selectedChange(event: any) {
        if (!event || !event.data) return;
        this.selectedGiftID = event.data.recID;
        this.dt.detectChanges();
    }
}
