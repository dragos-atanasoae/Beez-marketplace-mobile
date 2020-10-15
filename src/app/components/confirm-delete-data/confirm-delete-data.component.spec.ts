import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteDataComponent } from './confirm-delete-data.component';

describe('ConfirmDeleteDataComponent', () => {
  let component: ConfirmDeleteDataComponent;
  let fixture: ComponentFixture<ConfirmDeleteDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
