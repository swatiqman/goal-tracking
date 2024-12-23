import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { exhaustMap, Subject, tap } from 'rxjs';
import { GoalModel } from '@goal-tracking/data-types';
import { goal$ } from './goal.store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TextareaModule } from 'primeng/textarea';
import { Dialog } from 'primeng/dialog';
import { GoalService } from './goal.service';
import { suspensify } from '@jscutlery/operators';
import { MileStoneListComponent } from './milestone-list.component';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { GoalProgressPipe } from './goal-progress.pipe';

@Component({
  selector: 'lib-goal',
  imports: [
    ButtonModule,
    MileStoneListComponent,
    InputTextModule,
    ReactiveFormsModule,
    TextareaModule,
    Dialog,
    ConfirmDialog,
    ProgressSpinner,
    GoalProgressPipe,
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-2">
          <h1 class="text-3xl font-bold">Goal Tracker</h1>
          @if(deleteGoalRes()?.pending) {
          <p-progress-spinner
            strokeWidth="4"
            ariaLabel="loading"
            styleClass="w-6 h-6"
          />
          }
        </div>

        <p-button label="New" icon="pi pi-plus" (onClick)="openGoal()" />
      </div>

      <!-- Goals Container -->
      @for (goal of goal(); track goal.id) {

      <div class="container mx-auto p-6 max-w-4xl">
        <!-- Goal Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ goal.title }}
                </h2>
                @if (goal?.description) {
                <p class="text-gray-600 mt-1">
                  {{ goal.description }}
                </p>
                }
              </div>
              <div class="flex gap-1">
                <p-button
                  icon="pi pi-pencil"
                  (onClick)="openGoal(goal)"
                  severity="secondary"
                  rounded
                  text
                >
                </p-button>

                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  (onClick)="confirmGoalDelete($event, goal)"
                  rounded
                  text
                ></p-button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="flex flex-col gap-3">
              @let gProgress = (goal | goalProgress) ?? 0;
              <span
                class="px-3 py-1  self-start bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >{{ gProgress }}%</span
              >
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 rounded-full h-2"
                  [style.width.%]="gProgress"
                ></div>
              </div>
            </div>
          </div>

          <!-- Milestones Section -->
          <lib-milestone-list
            [mileStones]="goal.milestones || []"
            [goalId]="goal.id"
          />
        </div>
      </div>
      } @empty {

      <div class="flex justify-center items-center h-full">
        <h1 class=" text-2xl font-bold">No Goal Set Yet</h1>
      </div>

      }
    </div>
    <p-confirmdialog />
    <p-dialog
      header="Add Goal"
      [modal]="true"
      [(visible)]="showGoalDialog"
      [style]="{ width: '30rem' }"
    >
      <form [formGroup]="goalForm" (submit)="addGoal()">
        <div class="flex items-center gap-4 mb-4">
          <label for="goal_title" class="font-semibold w-24">Title</label>
          <input
            pInputText
            id="goal_title"
            class="flex-auto"
            autocomplete="off"
            formControlName="title"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="goal_description" class="font-semibold w-24"
            >Description</label
          >
          <textarea
            class=" flex-1"
            pTextarea
            formControlName="description"
            id="goal_description"
          ></textarea>
        </div>
        <div class="flex justify-end mt-4 gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            (click)="showGoalDialog.set(false)"
          />
          <p-button
            [label]="goalForm.value.id ? 'Edit' : 'Add'"
            type="submit"
            [disabled]="!goalForm.valid"
            [loading]="goalLoading()"
          />
        </div>
      </form>
    </p-dialog>
  `,
  styles: `
    :host {
      display: block;
      height: 100%
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class GoalComponent {
  srv = inject(GoalService);
  confrimSrv = inject(ConfirmationService);

  goal = toSignal(goal$, { initialValue: [] });

  showGoalDialog = signal(false);
  goalForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl('', { validators: [Validators.minLength(5)] }),
  });
  goalLoading = signal(false);

  addGoal$ = new Subject<GoalModel>();
  updateGoal$ = new Subject<{ id: number; data: GoalModel }>();
  deleteGoal$ = new Subject<number>();

  addGoalRes = this.addGoal$
    .pipe(
      takeUntilDestroyed(),
      exhaustMap((x) =>
        this.srv.add(x).pipe(
          tap(() => this.showGoalDialog.set(false)),
          suspensify(),
          tap((res) => this.goalLoading.set(res.pending))
        )
      )
    )
    .subscribe();

  updateGoalRes = this.updateGoal$
    .pipe(
      takeUntilDestroyed(),
      exhaustMap((x) =>
        this.srv.edit(x.id, x.data).pipe(
          tap(() => this.showGoalDialog.set(false)),
          suspensify(),
          tap((res) => this.goalLoading.set(res.pending))
        )
      )
    )
    .subscribe();

  deleteGoalRes = toSignal(
    this.deleteGoal$.pipe(
      takeUntilDestroyed(),
      exhaustMap((x) => this.srv.delete(x).pipe(suspensify()))
    )
  );

  addGoal() {
    if (!this.goalForm.valid) return;

    const goalId = this.goalForm.value?.id;

    if (!goalId) {
      this.addGoal$.next(this.goalForm.value as GoalModel);
    } else {
      this.updateGoal$.next({
        id: goalId,
        data: this.goalForm.value as GoalModel,
      });
    }
  }

  openGoal(goal?: GoalModel) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { milestones, ..._goal } = goal || ({} as GoalModel);

    this.goalForm.setValue({
      id: goal?.id ?? 0,
      description: _goal?.description ?? '',
      title: _goal?.title ?? '',
    });

    this.showGoalDialog.set(true);
  }

  confirmGoalDelete(event: Event, goal: GoalModel) {
    this.confrimSrv.confirm({
      target: event.target as EventTarget,
      message: `Are you sure that you want to proceed Delete Goal 
        ${goal.title}`,
      header: 'Confirm to Delete Goal',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: () => {
        this.deleteGoal$.next(goal.id);
      },
    });
  }
}
