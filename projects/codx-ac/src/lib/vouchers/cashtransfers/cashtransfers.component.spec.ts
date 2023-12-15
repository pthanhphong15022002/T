import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashtransfersComponent } from './cashtransfers.component';

describe('CashtransfersComponent', () => {
  let component: CashtransfersComponent;
  let fixture: ComponentFixture<CashtransfersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashtransfersComponent]
    });
    fixture = TestBed.createComponent(CashtransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
