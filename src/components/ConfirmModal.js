import React from 'react';

const ConfirmModal = ({
  open,
  title,
  description,
  showInput = false,
  inputLabel,
  inputPlaceholder,
  defaultValue = '',
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  autoClose = false,
  autoCloseDuration = 2000,
}) => {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (open) {
      setValue(defaultValue || '');
    }
  }, [open, defaultValue]);

  React.useEffect(() => {
    if (!open || !autoClose) return;
    const timer = setTimeout(() => {
      if (onConfirm) {
        onConfirm(undefined);
      }
      if (onCancel) {
        onCancel();
      }
    }, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [open, autoClose, autoCloseDuration, onConfirm, onCancel]);

  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(showInput ? value : undefined);
    }
  };

  return (
    <div className="modal-overlay confirm-modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body confirm-modal-body">
          {description && <p className="confirm-description">{description}</p>}
          {showInput && (
            <div className="form-group">
              {inputLabel && <label>{inputLabel}</label>}
              <textarea
                className="confirm-textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputPlaceholder}
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!autoClose && (
            <>
              <button className="btn-cancel-modal" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                className="btn-submit-modal"
                onClick={handleConfirm}
                disabled={confirmDisabled}
              >
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
