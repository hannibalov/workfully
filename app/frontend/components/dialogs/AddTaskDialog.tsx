import React, { useState } from "react";

type AddTaskDialogProps = {
  onAddTask: (title: string, description: string) => void;
  onClose: () => void;
};

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  onAddTask,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (title && description) {
      onAddTask(title, description);
      onClose();
    }
  };

  return (
    <div className="add-task-dialog-overlay">
      <div className="add-task-dialog">
        <h2>Add Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="task-title-input"
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="task-description-input"
        />
        <div className="add-task-dialog-actions">
          <button
            onClick={handleSubmit}
            data-testid="add-task-confirm"
            disabled={!title || !description}
          >
            Add
          </button>
          <button onClick={onClose} data-testid="cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskDialog;
