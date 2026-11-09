const CustomMaterial = require('../models/CustomMaterial');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getMessage } = require('../i18n/messages');

const getMaterials = asyncHandler(async (req, res) => {
  const { materialType, includeInactive, search } = req.query;
  const filter = {};

  if (includeInactive !== 'true') {
    filter.isActive = true;
  }

  if (materialType && materialType !== 'all') {
    filter.materialType = String(materialType);
  }

  if (search && String(search).trim() !== '') {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ name: regex }, { code: regex }, { description: regex }];
  }

  const materials = await CustomMaterial.find(filter).sort({ materialType: 1, unitPrice: 1 }).lean();

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('GET_MATERIALS_SUCCESS', {}, req),
    data: materials,
    meta: {
      total: materials.length,
    },
  });
});

const createMaterial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.code && payload.name) {
    payload.code = `MAT-${Date.now().toString().slice(-5)}`;
  }

  const material = await CustomMaterial.create(payload);
  return sendSuccess(res, {
    statusCode: 201,
    message: getMessage('CREATE_MATERIAL_SUCCESS', {}, req),
    data: material,
  });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const material = await CustomMaterial.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!material) {
    throw new AppError(getMessage('MATERIAL_NOT_FOUND', {}, req), 404, 'MATERIAL_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('UPDATE_MATERIAL_SUCCESS', {}, req),
    data: material,
  });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const material = await CustomMaterial.findByIdAndDelete(id).lean();
  if (!material) {
    throw new AppError(getMessage('MATERIAL_NOT_FOUND', {}, req), 404, 'MATERIAL_NOT_FOUND');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('DELETE_MATERIAL_SUCCESS', {}, req),
    data: { _id: id },
  });
});

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
