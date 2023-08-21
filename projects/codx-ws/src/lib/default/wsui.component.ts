import {
    Component,
    Injector,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    ComponentRef,
  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxWsService } from '../codx-ws.service';

@Component({ template: '' })
export abstract class WSUIComponent implements OnInit {
    abstract onInit(): void;
    protected route!: ActivatedRoute;
    protected codxWsService!: CodxWsService;
    constructor(inject: Injector) 
    {
        this.route = inject.get(ActivatedRoute);
        this.codxWsService = inject.get(CodxWsService);
    }
      
    ngOnInit(): void {
        this.getFuncID();
        this.onInit();
    }
    
    getFuncID()
    {
        var funcID = this.route.snapshot.paramMap.get('funcID');
        this.codxWsService.funcChange.next(funcID);
    }
}