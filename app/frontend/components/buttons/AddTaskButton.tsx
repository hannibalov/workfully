import React, { useState } from "react";
import { useTaskQueries } from "../../hooks/useTaskQueries";
import AddTaskDialog from "../dialogs/AddTaskDialog";
import { useSnackbar } from "../../context/snackbarContext";

const AddTaskButton: React.FC = () => {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const { addTaskMutation } = useTaskQueries();
  const { showMessage } = useSnackbar();

  const handleAddTask = (title: string, description: string) => {
    addTaskMutation.mutate(
      { title, description },
      {
        onError: (error) => {
          showMessage(`Error: ${error.message}`);
        },
      }
    );
    setIsAddTaskDialogOpen(false);
  };

  return (
    <>
      {isAddTaskDialogOpen && (
        <AddTaskDialog
          onAddTask={handleAddTask}
          onClose={() => setIsAddTaskDialogOpen(false)}
        />
      )}
      <button
        className="add-task-button"
        onClick={() => setIsAddTaskDialogOpen(true)}
        data-testid="add-task-button"
      >
        + Add task
      </button>
    </>
  );
};

export default AddTaskButton;
