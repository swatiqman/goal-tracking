import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';

import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'lib-milestone',
  imports: [
    PanelModule,
    ButtonModule,
    Checkbox,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabel,
  ],
  template: `
    <h3 class="text-lg font-semibold mb-4">Milestones</h3>
    <p-panel
      [toggleable]="true"
      [(collapsed)]="collapsed"
      [toggleButtonProps]="{
               styleClass: 'hidden',
            }"
    >
      <ng-template #header>
        <div class="flex justify-center items-end gap-2">
          <p-checkbox inputId="size_large" name="size" value="Learn Ng State" />
          <label for="size_large">Large</label>
        </div>
      </ng-template>

      <ng-template pTemplate="icons">
        <!-- Add custom toggle button to handle position -->
        <div class="flex items-center">
          <!-- Default toggle button -->
          <p-button
            icon="pi pi-comment"
            (click)="collapsed = !collapsed"
            severity="secondary"
            rounded
            text
          >
          </p-button>

          <!-- Additional icons after toggle button -->
          <p-button
            icon="pi pi-trash"
            severity="danger"
            rounded
            text
          ></p-button>
        </div>
      </ng-template>
      <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>

      <ng-template #footer>
        <div class="flex gap-2">
          <p-floatlabel variant="on" class="flex-1">
            <input
              pInputText
              id="on_label"
              autocomplete="off"
              (keydown.enter)="addMileStone()" 
              fluid
              [formControl]="mileStoneFormCtrl"
            />
            <label for="on_label">Comment</label>
          </p-floatlabel>
          <p-button
            icon="pi pi-plus"
            [rounded]="true"
            severity="info"
            [disabled]="!mileStoneFormCtrl.valid"
            (onClick)="addMileStone()"
          />
        </div>
      </ng-template>
    </p-panel>
  `,
  styles: `
    :host {
      display: block;
      height: 100%
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MileStoneComponent {
  collapsed = false;
  mileStoneFormCtrl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    // updateOn: 'submit',
  });

  addMileStone() {
    const mileStone = this.mileStoneFormCtrl.value?.trim();
    if (!this.mileStoneFormCtrl.valid || !mileStone) return;
  }
}
