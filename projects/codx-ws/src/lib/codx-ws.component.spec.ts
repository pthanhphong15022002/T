import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxWsComponent } from './codx-ws.component';

describe('CodxWsComponent', () => {
  let component: CodxWsComponent;
  let fixture: ComponentFixture<CodxWsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxWsComponent]
    });
    fixture = TestBed.createComponent(CodxWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
