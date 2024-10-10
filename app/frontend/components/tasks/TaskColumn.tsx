import React from "react";
import { Task, TaskStatus } from "../../../shared/constants";
import TaskCard from "./TaskCard";
import { useTaskDrag } from "../../hooks/useTaskDrag";
import { canAddTaskInStatus } from "../../constants";
import StatusChangeConfirmationDialog from "../dialogs/StatusChangeConfirmationDialog";
import AddTaskButton from "../buttons/AddTaskButton";

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
};

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks }) => {
  const {
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleMoveTask,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    isDragOver,
    canTaskBeMovedHere,
  } = useTaskDrag(undefined, status);

  return (
    <div
      className={`task-column ${
        isDragOver
          ? canTaskBeMovedHere
            ? "task-column-dragged-over-ok"
            : "task-column-dragged-over-not-ok"
          : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e)} // Pass the status here
      data-testid={`task-column-${status}`}
    >
      <h2>{status}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          status={task.status}
          description={task.description}
        />
      ))}
      {canAddTaskInStatus(status) && <AddTaskButton />}

      {isConfirmDialogOpen && (
        <StatusChangeConfirmationDialog
          columnStatus={status}
          handleMoveTask={handleMoveTask}
          onClose={() => setIsConfirmDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default TaskColumn;
