import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MileStoneComponent } from './milestone.component';

@Component({
  selector: 'lib-goal',
  imports: [ButtonModule, MileStoneComponent],
  template: ` <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Goal Tracker</h1>
      <p-button label="New" icon="pi pi-plus"  />
    </div>

    <!-- Goals Container -->
    <div class="container mx-auto p-6 max-w-4xl">
      <!-- Goal Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                Learn React Development
              </h2>
              <p class="text-gray-600 mt-1">
                Master React and its ecosystem through practical projects
              </p>
            </div>
            <span
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >60%</span
            >
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 rounded-full h-2 w-[60%]"></div>
          </div>
        </div>

        <!-- Milestones Section -->
        <div class="p-6">
          <lib-milestone />
        </div>
      </div>
    </div>
  </div>`,
  styles: `
    :host {
      display: block;
      height: 100%
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalComponent {}
