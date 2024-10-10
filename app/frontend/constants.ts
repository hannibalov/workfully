import { Task, TaskStatus } from "@/shared/constants";

export const canAddTaskInStatus = (status: TaskStatus) => {
  return status === "BACKLOG";
};
