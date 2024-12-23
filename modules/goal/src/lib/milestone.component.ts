import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';

import { Checkbox } from 'primeng/checkbox';
import { CommentModel, MilestoneModel } from '@goal-tracking/data-types';
import { GoalService } from './goal.service';
import { exhaustMap, Subject, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { suspensify } from '@jscutlery/operators';
import { DatePipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'lib-milestone',
  imports: [
    PanelModule,
    ButtonModule,
    Checkbox,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabel,
    DatePipe,
    ProgressSpinner,
  ],
  template: `
    @let mstone=mileStone(); @let updRes= updateRes();
    <p-panel
      [toggleable]="true"
      [(collapsed)]="collapsed"
      [toggleButtonProps]="{
               styleClass: 'hidden',
            }"
    >
      <ng-template #header>
        <div class="flex justify-center items-end gap-2">
          @if(!(updRes?.pending ?? false)) {
          <p-checkbox
            inputId="size_large"
            name="size"
            [binary]="true"
            [ngModel]="!!mstone.completed"
            [readonly]="true"
            (click)="updateMileStone(!mstone.completed)"
          />
          } @else {
          <p-progress-spinner
            strokeWidth="4"
            ariaLabel="loading"
            styleClass="w-6 h-6"
          />
          }

          <label for="size_large" [class.line-through]="!!mstone.completed">{{ mstone.title }}</label>
        </div>
      </ng-template>

      <ng-template pTemplate="icons">
        <!-- Add custom toggle button to handle position -->
        <div class="flex items-center">
          <!-- Default toggle button -->
          <p-button
            icon="pi pi-comment"
            (onClick)="toggleCollapse()"
            severity="secondary"
            rounded
            text
          >
          </p-button>

          <!-- Additional icons after toggle button -->
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [loading]="deleteRes()?.pending ?? false"
            (onClick)="deleteMileStone()"
            rounded
            text
          ></p-button>
        </div>
      </ng-template>

      <ul class="space-y-1">
        @for (item of (mileStone().comments || []); track $index) {
        <li
          class="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded transition-colors duration-200"
        >
          <span class="flex items-center space-x-2">
            <span class="w-1 h-1 rounded-full bg-blue-500"></span>
            <span class="text-sm text-gray-600">{{ item.text }}</span>
          </span>
          <span class="text-xs text-gray-400">{{
            item.date | date : 'short'
          }}</span>
        </li>
        }
      </ul>

      <ng-template #footer>
        <div class="flex gap-2">
          <p-floatlabel variant="on" class="flex-1">
            <input
              pInputText
              id="on_label"
              autocomplete="off"
              (keydown.enter)="addMileStoneComment()"
              fluid
              [formControl]="mileStoneFormCommentCtrl"
            />
            <label for="on_label">Comment</label>
          </p-floatlabel>
          <p-button
            icon="pi pi-plus"
            [rounded]="true"
            severity="info"
            [disabled]="!mileStoneFormCommentCtrl.valid"
            (onClick)="addMileStoneComment()"
            [loading]="addCommentRes()?.pending ?? false"
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
  srv = inject(GoalService);
  mileStone = input.required<MilestoneModel>();
  goalId = input.required<number>();
  collapsed = signal(true);
  addComment$ = new Subject<{
    goalId: number;
    id: number;
    data: CommentModel;
  }>();
  delete$ = new Subject<{ goalId: number; id: number }>();
  update$ = new Subject<{
    goalId: number;
    id: number;
    data: Partial<MilestoneModel>;
  }>();
  mileStoneFormCommentCtrl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });

  addCommentRes = toSignal(
    this.addComment$.pipe(
      exhaustMap((x) =>
        this.srv.addMilestoneComment(x.goalId, x.id, x.data).pipe(
          tap(() => this.mileStoneFormCommentCtrl.reset()),
          suspensify()
        )
      )
    )
  );

  deleteRes = toSignal(
    this.delete$.pipe(
      exhaustMap((x) =>
        this.srv.deleteMilestone(x.goalId, x.id).pipe(suspensify())
      )
    )
  );

  updateRes = toSignal(
    this.update$.pipe(
      exhaustMap((x) =>
        this.srv
          .editMilestone(x.goalId, { ...x.data, id: x.id })
          .pipe(suspensify())
      )
    )
  );

  addMileStoneComment() {
    const comment = this.mileStoneFormCommentCtrl.value?.trim();
    if (!this.mileStoneFormCommentCtrl.valid || !comment) return;

    this.addComment$.next({
      goalId: this.goalId(),
      id: this.mileStone().id,
      data: {
        text: comment,
        date: new Date(),
      } as CommentModel,
    });
  }

  deleteMileStone() {
    this.delete$.next({
      goalId: this.goalId(),
      id: this.mileStone().id,
    });
  }

  updateMileStone(completed: boolean) {
    console.log({ completed });
    this.update$.next({
      goalId: this.goalId(),
      id: this.mileStone().id,
      data: { completed, dueDate: completed ? new Date() : undefined },
    });
  }

  toggleCollapse() {
    this.collapsed.update((value) => !value);
  }
}
