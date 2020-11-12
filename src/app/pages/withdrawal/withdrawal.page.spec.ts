import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WithdrawalPage } from './withdrawal.page';

describe('WithdrawalPage', () => {
  let component: WithdrawalPage;
  let fixture: ComponentFixture<WithdrawalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
