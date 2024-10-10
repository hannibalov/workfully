import React from "react";
import { Task } from "../../../shared/constants";
import { useTaskDrag } from "../../hooks/useTaskDrag";

const TaskCard: React.FC<
  Pick<Task, "id" | "title" | "status" | "description">
> = ({ id, title, status, description }) => {
  const { handleDragStart, handleDragEnd, isDragging } = useTaskDrag({
    id,
    title,
    status,
  });

  return (
    <div
      className={`task-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-testid={`task-card-${id}`}
    >
      <div>{title}</div>
      <div className="task-card-description">{description}</div>
    </div>
  );
};

export default TaskCard;
