import React, { useState } from "react";
import { Task } from "../../shared/constants";
import { useDrag } from "../context/dragContext";

const TaskCard: React.FC<
  Pick<Task, "id" | "title" | "status" | "description">
> = ({ title, id, status, description }) => {
  const { setDraggingTask } = useDrag();
  const [isDragging, setIsDragging] = useState(false);
  let dragPreview: HTMLDivElement | null = null;

  const handleDragStart = (e: React.DragEvent) => {
    setDraggingTask({ id, status, title });
    setIsDragging(true);

    // Create custom drag preview element
    dragPreview = document.createElement("div");
    dragPreview.classList.add("task-card"); // Use the same CSS class for styling
    dragPreview.style.position = "absolute"; // Ensure it doesn't interfere with layout
    dragPreview.style.top = "-1000px"; // Move it out of view
    dragPreview.style.width = `${
      e.currentTarget.getBoundingClientRect().width
    }px`;
    dragPreview.innerHTML = title; // Set the task title in the preview
    document.body.appendChild(dragPreview); // Temporarily add to the DOM

    // Set custom drag image using the hidden element
    e.dataTransfer.setDragImage(dragPreview, dragPreview.clientWidth / 2, 50);
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Clean up the drag preview element
    if (dragPreview) {
      document.body.removeChild(dragPreview);
      dragPreview = null;
    }
  };

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
