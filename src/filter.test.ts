import { describe, expect, it } from 'vitest'
import { countByFilter, filterTasks } from './filter'
import { taskReducer, type State, type Task } from './taskReducer'

const tasks: Task[] = [
  { id: 'a', title: 'A', status: 'todo' },
  { id: 'b', title: 'B', status: 'in-progress' },
  { id: 'c', title: 'C', status: 'done' },
  { id: 'd', title: 'D', status: 'done' },
]

describe('filterTasks', () => {
  it('returns every task for all', () => {
    expect(filterTasks(tasks, 'all')).toEqual(tasks)
  })

  it('returns only todo tasks', () => {
    expect(filterTasks(tasks, 'todo')).toEqual([tasks[0]])
  })

  it('returns only in-progress tasks', () => {
    expect(filterTasks(tasks, 'in-progress')).toEqual([tasks[1]])
  })

  it('returns only done tasks', () => {
    expect(filterTasks(tasks, 'done')).toEqual([tasks[2], tasks[3]])
  })

  it('returns an empty list for an empty task list', () => {
    expect(filterTasks([], 'in-progress')).toEqual([])
  })
})

describe('countByFilter', () => {
  it('counts all, todo, in-progress and done', () => {
    expect(countByFilter(tasks)).toEqual({
      all: 4,
      todo: 1,
      'in-progress': 1,
      done: 2,
    })
  })

  it('returns zero for every filter on an empty list', () => {
    expect(countByFilter([])).toEqual({
      all: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
    })
  })

  it('counts correctly after the reducer deletes a task', () => {
    const state: State = { tasks, filter: 'all', past: [] }
    const next = taskReducer(state, { type: 'remove', id: 'c' })

    expect(countByFilter(next.tasks)).toEqual({
      all: 3,
      todo: 1,
      'in-progress': 1,
      done: 1,
    })
  })

  it('counts correctly after clearDone', () => {
    const state: State = { tasks, filter: 'all', past: [] }
    const next = taskReducer(state, { type: 'clearDone' })

    expect(countByFilter(next.tasks)).toEqual({
      all: 2,
      todo: 1,
      'in-progress': 1,
      done: 0,
    })
  })
})
