import React, { useState } from 'react';

export function ReviewActionModal({ type, onClose, onSubmit }) {
  const [remarks, setRemarks] = useState('');

  const isApprove = type === 'approve';
  const isReject = type === 'reject';
  const isReview = type === 'review';

  let title = '';
  let desc = '';
  let btnText = '';
  let btnClass = '';
  let requireRemarks = false;

  if (isApprove) {
    title = 'Approve Insurance Application?';
    desc = 'This will approve the farmer\'s insurance application.';
    btnText = 'Approve';
    btnClass = 'cim-btn-approve';
  } else if (isReject) {
    title = 'Reject Insurance Application';
    desc = 'Please provide a reason for rejecting this application.';
    btnText = 'Reject Application';
    btnClass = 'cim-btn-reject';
    requireRemarks = true;
  } else if (isReview) {
    title = 'Request Changes';
    desc = 'Tell the farmer what needs to be corrected in their application.';
    btnText = 'Request Changes';
    btnClass = 'cim-btn-review';
    requireRemarks = true;
  }

  const handleSubmit = () => {
    if (requireRemarks && !remarks.trim()) {
      alert('Remarks are required for this action.');
      return;
    }
    onSubmit(remarks);
  };

  return (
    <div className="cim-modal-overlay">
      <div className="cim-modal">
        <h3>{title}</h3>
        <p>{desc}</p>
        
        {(!isApprove || true) && (
          <textarea
            className="cim-modal-textarea"
            placeholder={isReject ? "Reason for rejection..." : isReview ? "What needs to be corrected?..." : "Optional remarks..."}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        )}
        
        <div className="cim-modal-actions">
          <button className="cim-btn cim-btn-outline" onClick={onClose}>Cancel</button>
          <button className={`cim-btn ${btnClass}`} onClick={handleSubmit}>{btnText}</button>
        </div>
      </div>
    </div>
  );
}
