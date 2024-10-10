import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTaskQueries } from "../../hooks/useTaskQueries";
import TaskColumn from "../tasks/TaskColumn";
import { useSnackbar } from "../../context/snackbarContext";
import SnackMessage from "../errors/SnackMessage";
import "../../../styles.css";
import { Task, TaskStatus, taskStatuses } from "../../../shared/constants";
import { DragProvider } from "../../context/dragContext";

const Board = () => {
  const { showMessage } = useSnackbar();
  const { tasks, isLoading, error } = useTaskQueries({
    onError: (err: Error) => {
      showMessage(`Error fetching tasks: ${err.message}`);
    },
  });

  if (isLoading || error)
    return (
      <div className="container">
        <div className="top-bar" data-testid="page-title">
          <img src="/icon.png" alt="Logo" className="logo" />
          <h1>Kanban Board</h1>
        </div>
        <div>
          {isLoading ? "Loading..." : "Something wrong happened, try reloading"}
        </div>
      </div>
    );

  const groupedTasks = tasks?.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="container">
      <div className="top-bar">
        <img src="/icon.png" alt="Logo" className="logo" />
        <h1>Kanban Board</h1>
      </div>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <SnackMessage
            snackMessage={`Something went wrong: ${error.message}`}
            onClose={resetErrorBoundary}
          />
        )}
      >
        <DragProvider>
          <div className="columns-container">
            {taskStatuses.map((status) => (
              <TaskColumn
                key={status}
                status={status as TaskStatus}
                tasks={groupedTasks?.[status as TaskStatus] || []}
              />
            ))}
          </div>
        </DragProvider>
      </ErrorBoundary>
    </div>
  );
};

export default Board;
