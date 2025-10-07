const resetRequests = {};

function setResetRequest(email, otp, expires) {
  resetRequests[email] = { otp, expires };
}

function getResetRequest(email) {
  return resetRequests[email];
}

function deleteResetRequest(email) {
  delete resetRequests[email];
}

module.exports = {
  setResetRequest,
  getResetRequest,
  deleteResetRequest
};
