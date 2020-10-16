import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MissingProductsPage } from './missing-products.page';

describe('MissingProductsPage', () => {
  let component: MissingProductsPage;
  let fixture: ComponentFixture<MissingProductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissingProductsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MissingProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
