import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApplyBeezVoucherPage } from './apply-beez-voucher.page';

describe('ApplyBeezVoucherPage', () => {
  let component: ApplyBeezVoucherPage;
  let fixture: ComponentFixture<ApplyBeezVoucherPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyBeezVoucherPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplyBeezVoucherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
