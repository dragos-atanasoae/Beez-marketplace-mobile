import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VendorsListPage } from './vendors-list.page';

describe('VendorsListPage', () => {
  let component: VendorsListPage;
  let fixture: ComponentFixture<VendorsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorsListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
