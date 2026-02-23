import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding">
      <p class="text-center">raboubla/stephan</p>
    </div>
  `,
})
export class BrandingComponent {
  constructor() { }
}
