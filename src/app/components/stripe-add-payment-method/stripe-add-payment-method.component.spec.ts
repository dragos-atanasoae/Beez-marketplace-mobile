import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StripeAddPaymentMethodComponent } from './stripe-add-payment-method.component';

describe('StripeAddPaymentMethodComponent', () => {
  let component: StripeAddPaymentMethodComponent;
  let fixture: ComponentFixture<StripeAddPaymentMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StripeAddPaymentMethodComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StripeAddPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
