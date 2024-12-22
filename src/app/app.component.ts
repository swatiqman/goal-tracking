import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [RouterOutlet, ButtonModule],
  selector: 'app-root',
  template: `<router-outlet />
    <div class="card flex justify-center">
      <p-button label="Check" />
    </div> `,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
