import type { Status, Task } from './taskReducer'

const STATUS_LABELS: Record<Status, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  return (
    <li className="task-row">
      <span className="task-title">{task.title}</span>
      <span className={`badge ${task.status}`}>{STATUS_LABELS[task.status]}</span>
      <button type="button" className="next" onClick={onNext}>
        Next
      </button>
      <button type="button" className="delete" onClick={onDelete}>
        Delete
      </button>
    </li>
  )
}
