import * as requestService from '../services/requestService.js';

// Create emergency blood request
export const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createBloodRequest(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Emergency request sent successfully!',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve blood requests (filters: urgency, status, bloodGroup, lat/lng distance)
export const getRequests = async (req, res, next) => {
  try {
    const { bloodType, urgency, status, lat, lng, maxDistanceKm, recipientId, page, limit } = req.query;
    const filters = { bloodType, urgency, status, lat, lng, maxDistanceKm, recipientId };
    const pagination = { page: parseInt(page), limit: parseInt(limit) };

    const result = await requestService.getBloodRequests(filters, pagination);
    res.status(200).json({
      success: true,
      message: 'Requests retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Respond (Accept/Pass) to request
export const respondToRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await requestService.respondToRequest(requestId, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Response recorded successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Update request status (Accepted, Traveling, Completed, Cancelled etc.)
export const updateStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, note } = req.body;

    const request = await requestService.updateRequestStatus(requestId, req.user.id, status, note);
    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve single blood request by ID
export const getRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await requestService.getBloodRequestById(requestId);
    if (!request) {
      const error = new Error('Blood request not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      message: 'Request retrieved successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};
