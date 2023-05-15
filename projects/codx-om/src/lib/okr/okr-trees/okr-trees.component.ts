declare var window: any;
import { CodxOmService } from '../../codx-om.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  AuthStore,
} from 'codx-core';

@Component({
  selector: 'lib-okr-trees',
  templateUrl: './okr-trees.component.html',
  styleUrls: ['./okr-trees.component.scss'],
})
export class OkrTreesComponent implements OnInit, AfterViewInit {
  @Input() funcID: any;
  @Input() dataOKRPlans: any;
  @Input() okrFM: any;
  @Input() okrVll: any;
  @Input() orgUnitTree: any;
  @Input() okrGrv: any;
  @Input() currentOrgID: any;
  dataTree: any;
  listDistribute: any;
  isAfterRender: boolean;
  curUser: any;
  openAccordionAlign = [];
  loadedData=false;
  constructor(
    private codxOmService: CodxOmService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore
  ) {
    this.curUser = authStore.get();
  }
  ngOnInit(): void {
    this.getOrgTreeOKR();
  }
  ngAfterViewInit() {}

  clickMF(e: any, data: any) {}
  selectionChange(parent) {
    if (!parent.isItem) {
      parent.data.items = parent.data.items;
    }
  }
  getOrgTreeOKR() {
    this.loadedData=false;
    this.codxOmService
      .getOrgTreeOKR(this.dataOKRPlans?.recID, this.currentOrgID)
      .subscribe((listOrg: any) => {
        if (listOrg) {
          this.orgUnitTree = [listOrg];
          this.isAfterRender = true;
          this.loadedData=true;
          this.changeDetectorRef.detectChanges();
        }
        else{          
          this.loadedData=true;
        }
      });
  }

  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }
}
