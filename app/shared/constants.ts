export type Task = {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "DOING" | "DONE" | "BACKLOG";
};

export const taskStatuses = ["BACKLOG", "TODO", "DOING", "DONE"] as const;
export type TaskStatus = Pick<Task, "status">["status"];

export const canChangeToStatus = (
  task: Pick<Task, "status">,
  status: TaskStatus
) => {
  if (task.status === "BACKLOG" && status === "TODO") return true;
  if (task.status === "TODO" && (status === "BACKLOG" || status === "DOING"))
    return true;
  if (task.status === "DOING" && (status === "TODO" || status === "DONE"))
    return true;
  return false;
};

export const sharedErrorMessages = {
  incorrectStatusChange: (statusFrom: TaskStatus, statusTo: TaskStatus) =>
    statusFrom === "DONE"
      ? "Cannot change status of a DONE task"
      : `Cannot change status to ${statusTo} from ${statusFrom}`,
};
