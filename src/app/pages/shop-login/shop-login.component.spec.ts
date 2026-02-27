import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopLoginComponent } from './shop-login.component';

describe('ShopLoginComponent', () => {
  let component: ShopLoginComponent;
  let fixture: ComponentFixture<ShopLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
