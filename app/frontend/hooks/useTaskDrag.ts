import { useState, useRef, useCallback } from "react";
import {
  Task,
  TaskStatus,
  canChangeToStatus,
  sharedErrorMessages,
} from "../../shared/constants";
import { useDrag } from "../context/dragContext";
import { useSnackbar } from "../context/snackbarContext";
import { useTaskQueries } from "./useTaskQueries";

export const useTaskDrag = (
  task?: Pick<Task, "id" | "title" | "status">,
  columnStatus?: TaskStatus
) => {
  const { setDraggingTask, draggingTask } = useDrag();
  const { showMessage } = useSnackbar();
  const { updateTaskMutation } = useTaskQueries();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [canTaskBeMovedHere, setCanTaskBeMovedHere] = useState(false);
  const dragPreview = useRef<HTMLDivElement | null>(null);

  const handleMoveTask = async () => {
    if (!draggingTask || !columnStatus) return;
    try {
      await updateTaskMutation.mutateAsync({
        id: draggingTask.id,
        status: columnStatus,
      });
    } catch (error) {
      showMessage(`Error: ${(error as Error).message}`);
    } finally {
      setDraggingTask(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!task) return;
    setDraggingTask(task);
    setIsDragging(true);

    // Create custom drag preview element
    dragPreview.current = document.createElement("div");
    dragPreview.current.classList.add("task-card"); // Use the same CSS class for styling
    dragPreview.current.style.position = "absolute"; // Ensure it doesn't interfere with layout
    dragPreview.current.style.top = "-1000px"; // Move it out of view
    dragPreview.current.style.width = `${
      e.currentTarget.getBoundingClientRect().width
    }px`;
    dragPreview.current.innerHTML = task.title; // Set the task title in the preview
    document.body.appendChild(dragPreview.current); // Temporarily add to the DOM

    // Set custom drag image using the hidden element
    e.dataTransfer.setDragImage(
      dragPreview.current,
      dragPreview.current.clientWidth / 2,
      50
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Clean up the drag preview element
    if (dragPreview.current) {
      document.body.removeChild(dragPreview.current);
      dragPreview.current = null;
    }
  };

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (columnStatus && draggingTask) {
        const canMoveHere = canChangeToStatus(
          { status: draggingTask.status },
          columnStatus
        );
        setIsDragOver(true);
        setCanTaskBeMovedHere(canMoveHere);
        e.dataTransfer.dropEffect = canMoveHere ? "move" : "none";
      }
    },
    [draggingTask, columnStatus]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (!draggingTask || draggingTask.status === columnStatus) return;

      if (!canChangeToStatus({ status: draggingTask.status }, columnStatus!)) {
        showMessage(
          sharedErrorMessages.incorrectStatusChange(
            draggingTask.status,
            columnStatus!
          )
        );
        return;
      }

      if (columnStatus === "DONE") setIsConfirmDialogOpen(true);
      else await handleMoveTask();
    },
    [
      draggingTask,
      columnStatus,
      updateTaskMutation,
      showMessage,
      setDraggingTask,
    ]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node))
      setIsDragOver(false);
  }, []);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragLeave,
    handleMoveTask,
    setIsConfirmDialogOpen,
    isConfirmDialogOpen,
    isDragging,
    isDragOver,
    canTaskBeMovedHere,
  };
};
