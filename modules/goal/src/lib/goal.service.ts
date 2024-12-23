import { Injectable } from '@angular/core';
import { delay, tap, withLatestFrom } from 'rxjs/operators';
import {
  CommentModel,
  GoalModel,
  MilestoneModel,
} from '@goal-tracking/data-types';
import { of } from 'rxjs';
import {
  addGoal,
  addGoalMileStone,
  addGoalMileStoneComment,
  deleteGoal,
  deleteGoalMileStone,
  nextGoalId$,
  nextGoalMileStoneCommentId$,
  nextGoalMileStoneId$,
  updateGoal,
  updateGoalMileStone,
} from './goal.store';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private duration = 1000;

  add(body: GoalModel) {
   return of(body).pipe(
      delay(this.duration),
      withLatestFrom(nextGoalId$),
      tap({
        next: ([goal, id]) => {
          addGoal({ ...goal, id });
        },
      })
    );
  }

  edit(id: number, body: Partial<GoalModel>) {
    return of(body).pipe(
      delay(this.duration),
      tap({
        next: (res) => {
          updateGoal(id, res);
        },
      })
    );
  }

  delete(id: number) {
    return of(id).pipe(
      delay(this.duration),
      tap({
        next: () => {
          deleteGoal(id);
        },
      })
    );
  }

  addMilestone(goalId: number, body: MilestoneModel) {
    return of(body).pipe(
      delay(this.duration),
      withLatestFrom(nextGoalMileStoneId$(goalId)),
      tap({
        next: ([milstone, id]) => {
          addGoalMileStone(goalId, { ...milstone, id });
        },
      })
    );
  }

  editMilestone(id: number, body: Partial<MilestoneModel>) {
    return of(body).pipe(
      delay(this.duration),
      tap({
        next: (res) => {
          updateGoalMileStone(id, res);
        },
      })
    );
  }

  deleteMilestone(goalId: number, id: number) {
    return of(id).pipe(
      delay(this.duration),
      tap({
        next: () => {
          deleteGoalMileStone(goalId, id);
        },
      })
    );
  }

  addMilestoneComment(
    goalId: number,
    milestoneId: number,
    comment: CommentModel
  ) {
    return of(comment).pipe(
      delay(this.duration),
      withLatestFrom(nextGoalMileStoneCommentId$(goalId, milestoneId)),
      tap({
        next: ([cm, id]) => {
          addGoalMileStoneComment(goalId, milestoneId, { ...cm, id });
        },
      })
    );
  }
}
