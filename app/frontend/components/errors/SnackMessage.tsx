import React, { useEffect } from "react";

interface SnackMessageProps {
  snackMessage: string;
  onClose: () => void;
}

const SnackMessage: React.FC<SnackMessageProps> = ({
  snackMessage,
  onClose,
}) => {
  useEffect(() => {
    if (snackMessage) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      // Clean up the timer on unmount or when snackMessage changes
      return () => clearTimeout(timer);
    }
  }, [snackMessage, onClose]);

  if (!snackMessage) return null;

  return (
    <div className="snack-bar" data-testid="snackbar">
      {snackMessage}
      <button
        className="snack-message-button"
        onClick={onClose}
        data-testid="close-snackbar"
      >
        Close
      </button>
    </div>
  );
};

export default SnackMessage;
