import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reactionCount'
})
export class ReactionCountPipe implements PipeTransform {
  transform(userReactions: { [userId: string]: string }, reactionType: string): number {
    if (!userReactions) return 0;

    return Object.values(userReactions).filter(reaction => reaction === reactionType).length;
  }
}
