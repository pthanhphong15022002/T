import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashtransfersAddComponent } from './cashtransfers-add.component';

describe('CashtransfersAddComponent', () => {
  let component: CashtransfersAddComponent;
  let fixture: ComponentFixture<CashtransfersAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashtransfersAddComponent]
    });
    fixture = TestBed.createComponent(CashtransfersAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
