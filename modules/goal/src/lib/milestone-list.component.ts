import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MileStoneComponent } from './milestone.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { exhaustMap, Subject, tap } from 'rxjs';
import { MilestoneModel } from '@goal-tracking/data-types';
import { toSignal } from '@angular/core/rxjs-interop';
import { TextareaModule } from 'primeng/textarea';
import { GoalService } from './goal.service';
import { suspensify } from '@jscutlery/operators';

@Component({
  selector: 'lib-milestone-list',
  imports: [
    ButtonModule,
    MileStoneComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
  ],
  template: `
    @let gId= goalId();
    <div class="p-6 flex gap-4 flex-col">
      <div class="flex gap-2">
        <input
          class=" flex-1"
          pInputText
          id="on_label"
          autocomplete="off"
          placeholder="Add a Milestone"
          (keydown.enter)="addMileStone(gId)"
          fluid
          [formControl]="mileStoneFormCtrl"
        />

        <p-button
          icon="pi pi-plus"
          label="Add"
          severity="info"
          [disabled]="!mileStoneFormCtrl.valid"
          [loading]="addMilestoneRes()?.pending ?? false"
          (onClick)="addMileStone(gId)"
        />
      </div>
      <div class="flex flex-col gap-1">
      @for (milestone of mileStones(); track milestone.id) {
      <lib-milestone [goalId]="gId" [mileStone]="milestone" />
      }
      </div>
      
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MileStoneListComponent {
  srv = inject(GoalService);

  mileStones = input.required<MilestoneModel[]>();
  goalId = input.required<number>();
  mileStoneFormCtrl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  addMilestone$ = new Subject<{
    goalId: number;
    data: MilestoneModel;
  }>();
  addMilestoneRes = toSignal(
    this.addMilestone$.pipe(
      exhaustMap(({ goalId, data }) =>
        this.srv.addMilestone(goalId, data).pipe(tap(() => this.mileStoneFormCtrl.reset() ) , suspensify())
      )
    )
  );

  addMileStone(goalId: number) {
    const milestone = this.mileStoneFormCtrl.value?.trim();
    if (!this.mileStoneFormCtrl.valid || !milestone) return;

    this.addMilestone$.next({
      goalId: goalId,
      data: {
        title: milestone,
        completed: false,
      } as MilestoneModel,
    });
  }
}
