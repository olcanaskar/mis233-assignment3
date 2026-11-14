// Requirement R4: pure helpers. No React in this file.
import type { Filter, Task } from './taskReducer'

// Re-export so components can keep importing Filter from './filter' if they prefer.
export type { Filter } from './taskReducer'

/** All filter values, in the order the buttons should appear. */
export const FILTERS: Filter[] = ['all', 'todo', 'in-progress', 'done']

/** Return the tasks to show for the chosen filter. 'all' returns every task. */
export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((task) => task.status === filter)
}

/** Return how many tasks each filter button would show. */
export function countByFilter(tasks: Task[]): Record<Filter, number> {
  const counts: Record<Filter, number> = {
    all: tasks.length,
    todo: 0,
    'in-progress': 0,
    done: 0,
  }

  for (const task of tasks) {
    counts[task.status] += 1
  }

  return counts
}
