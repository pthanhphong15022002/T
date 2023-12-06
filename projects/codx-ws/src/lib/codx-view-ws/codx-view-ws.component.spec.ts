import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxViewWsComponent } from './codx-view-ws.component';

describe('CodxViewWsComponent', () => {
  let component: CodxViewWsComponent;
  let fixture: ComponentFixture<CodxViewWsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxViewWsComponent]
    });
    fixture = TestBed.createComponent(CodxViewWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
