import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxWsHeaderComponent } from './codx-ws-header.component';

describe('CodxWsHeaderComponent', () => {
  let component: CodxWsHeaderComponent;
  let fixture: ComponentFixture<CodxWsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxWsHeaderComponent]
    });
    fixture = TestBed.createComponent(CodxWsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
