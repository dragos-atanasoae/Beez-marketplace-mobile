import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabOrdersPage } from './tab-orders.page';

describe('TabOrdersPage', () => {
  let component: TabOrdersPage;
  let fixture: ComponentFixture<TabOrdersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabOrdersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
