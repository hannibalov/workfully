import { TaskStatus } from "../../shared/constants";
import React from "react";
import { useDrag } from "../context/dragContext";

type ConfirmationDialogProps = {
  columnStatus: TaskStatus;
  handleMoveTask: () => void;
  onClose: () => void;
};

const StatusChangeConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  columnStatus,
  handleMoveTask,
  onClose,
}) => {
  const { draggingTask } = useDrag();

  if (!draggingTask) return null;

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <p>
          Are you sure you want to change {draggingTask.title} from{" "}
          {draggingTask.status} to {columnStatus}?
        </p>
        <div className="confirmation-dialog-actions">
          <button onClick={handleMoveTask} data-testid="move-task">
            Accept
          </button>
          <button onClick={onClose} data-testid="cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfirmationDialog;
