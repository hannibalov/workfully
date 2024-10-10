import React, { useState } from "react";
import TaskCard from "./TaskCard";
import {
  canChangeToStatus,
  sharedErrorMessages,
  Task,
  TaskStatus,
} from "../../shared/constants";
import { canAddTaskInStatus } from "../constants";
import AddTaskButton from "./AddTaskButton";
import StatusChangeConfirmationDialog from "./StatusChangeConfirmationDialog";
import { useDrag } from "../context/dragContext";
import { useSnackbar } from "../context/snackbarContext";
import { useTasks } from "../hooks/useTasks";

type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
};

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks }) => {
  const { updateTaskMutation } = useTasks();
  const { showMessage } = useSnackbar();
  const { draggingTask, setDraggingTask } = useDrag();

  const [isDragOver, setIsDragOver] = useState(false);
  const [canTaskBeMovedHere, setCanTaskBeMovedHere] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleMoveTask = async () => {
    if (!draggingTask) return;
    try {
      await updateTaskMutation.mutateAsync({
        id: draggingTask.id,
        status,
      });
    } catch (error) {
      showMessage(`Error: ${(error as Error).message}`);
    } finally {
      setDraggingTask(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!draggingTask || draggingTask.status === status) return;

    if (!canChangeToStatus({ status: draggingTask.status }, status)) {
      showMessage(
        sharedErrorMessages.incorrectStatusChange(draggingTask.status, status)
      );
      return;
    }
    if (status === "DONE") setIsConfirmDialogOpen(true);
    else await handleMoveTask();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    setCanTaskBeMovedHere(
      !!draggingTask &&
        (draggingTask.status === status ||
          canChangeToStatus({ status: draggingTask.status }, status))
    );
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  return (
    <div
      className={`task-column ${
        isDragOver
          ? canTaskBeMovedHere
            ? "task-column-dragged-over-ok"
            : "task-column-dragged-over-not-ok"
          : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      data-testid={`task-column-${status}`}
    >
      <h2>{status}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          title={task.title}
          id={task.id}
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
