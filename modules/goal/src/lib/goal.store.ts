import {
  CommentModel,
  GoalModel,
  MilestoneModel,
} from '@goal-tracking/data-types';
import { createStore, filterNil } from '@ngneat/elf';
import {
  addEntities,
  deleteEntities,
  selectAllEntities,
  selectEntity,
  selectLast,
  setEntities,
  updateEntities,
  withEntities,
} from '@ngneat/elf-entities';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { map, shareReplay } from 'rxjs';

const store = createStore({ name: 'goal' }, withEntities<GoalModel>());

export const persist = persistState(store, {
  key: 'goal-trackin',
  storage: localStorageStrategy,
});

export const goal$ = store.pipe(
  selectAllEntities(),
  filterNil(),
  shareReplay({ refCount: true })
);

export const nextGoalId$ = store.pipe(
  selectLast(),
  map((x) => (x?.id ?? 0) + 1)
);
export const nextGoalMileStoneId$ = (goalId: number) =>
  store.pipe(
    selectEntity(goalId, { pluck: 'milestones' }),
    map((x) => (x?.[x.length - 1]?.id ?? 0) + 1)
  );

export const nextGoalMileStoneCommentId$ = (
  goalId: number,
  mileStoneId: number
) =>
  store.pipe(
    selectEntity(goalId, { pluck: 'milestones' }),
    map((x) => {
      const comments = x?.find((x) => x.id === mileStoneId)?.comments || [];
      return (comments[comments.length - 1]?.id ?? 0) + 1;
    })
  );

export function setGoals(goals: GoalModel[]) {
  store.update(setEntities(goals));
}

export function addGoal(goal: GoalModel) {
  store.update(addEntities(goal));
}

export function updateGoal(id: number, goal: Partial<GoalModel>) {
  store.update(updateEntities(id, (entity) => ({ ...entity, ...goal })));
}

export function deleteGoal(id: number) {
  store.update(deleteEntities(id));
}

export function addGoalMileStone(goalId: number, milestone: MilestoneModel) {
  store.update(
    updateEntities(goalId, (entity) => ({
      ...entity,
      milestones: [...(entity.milestones || []), milestone],
    }))
  );
}

export function updateGoalMileStone(
  goalId: number,
  milestone: Partial<MilestoneModel>
) {
  store.update(
    updateEntities(goalId, (entity) => ({
      ...entity,
      milestones: [
        ...(entity.milestones || []).map((item) =>
          item.id === milestone.id ? { ...item, ...milestone } : item
        ),
      ],
    }))
  );
}

export function deleteGoalMileStone(goalId: number, mileStoneId: number) {
  store.update(
    updateEntities(goalId, (entity) => ({
      ...entity,
      milestones: entity.milestones.filter((x) => x.id !== mileStoneId),
    }))
  );
}

export function addGoalMileStoneComment(
  goalId: number,
  milestoneId: number,
  comment: CommentModel
) {
  store.update(
    updateEntities(goalId, (entity) => ({
      ...entity,
      milestones: [
        ...(entity.milestones || []).map((item) =>
          item.id === milestoneId
            ? { ...item, comments: [...(item.comments || []), comment] }
            : item
        ),
      ],
    }))
  );
}

export function resetGoalStore() {
  store.reset();
}
