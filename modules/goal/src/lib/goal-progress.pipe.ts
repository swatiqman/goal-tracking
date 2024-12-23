import { Pipe, PipeTransform } from '@angular/core';
import { GoalModel } from '@goal-tracking/data-types';

@Pipe({
  name: 'goalProgress',
})
export class GoalProgressPipe implements PipeTransform {
  transform(goal: GoalModel): unknown {
    const milestones = goal.milestones || [];
    const completedMileStones = goal.milestones.filter((x) => x.completed);
    return (
      Number(((completedMileStones.length )/ milestones.length).toFixed(2)) * 100
    );
  }  
}
