// api/_response.js
function sendError(res, statusCode, message) {
    res.statusCode = statusCode;
    return res.json({ message });
}

function sendSuccess(res, data, statusCode = 200) {
    res.statusCode = statusCode;
    return res.json(data);
}

module.exports = { sendError, sendSuccess };
