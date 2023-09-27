import {
    Component,
    Injector,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    ComponentRef,
    ChangeDetectorRef,
  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxWsService } from '../codx-ws.service';
import { ApiHttpService, AuthStore, CodxService, NotificationsService } from 'codx-core';

@Component({ template: '' })
export abstract class WSUIComponent implements OnInit {
    funcID:any;
    module:string = "WS";
    userInfo:any;

    abstract onInit(): void;
    protected route!: ActivatedRoute;
    protected codxWsService!: CodxWsService;
    protected api: ApiHttpService;
    protected codxService: CodxService;
    protected authStore: AuthStore;
    protected changeDetectorRef: ChangeDetectorRef;
    protected notifySvr: NotificationsService;
    constructor(inject: Injector) 
    {
        this.route = inject.get(ActivatedRoute);
        this.codxWsService = inject.get(CodxWsService);
        this.api = inject.get(ApiHttpService);
        this.codxService = inject.get(CodxService);
        this.authStore = inject.get(AuthStore);
        this.changeDetectorRef = inject.get(ChangeDetectorRef);
        this.notifySvr = inject.get(NotificationsService);
    }
      
    ngOnInit(): void {
        this.getFuncID();
        this.getUserInfo();
        this.onInit();
    }
    
    getFuncID()
    {
        this.funcID = this.route.snapshot.paramMap.get('funcID');
        this.codxWsService.funcChange.next(this.funcID);
    }

    getUserInfo()
    {
        this.userInfo = this.authStore.get();
    }
}