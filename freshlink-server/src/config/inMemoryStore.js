const crypto = require('crypto');

const memoryUsers = [];
const memoryProducts = [];
const memoryOrders = [];

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const buildUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  location: user.location,
  trustScore: user.trustScore,
  farmName: user.farmName,
  primaryProduce: user.primaryProduce,
  shoppingInterest: user.shoppingInterest,
  verifiedSeller: user.verifiedSeller,
});

const findUserByEmail = async (email) => {
  const normalized = normalizeEmail(email);
  return memoryUsers.find((user) => normalizeEmail(user.email) === normalized) || null;
};

const findUserById = async (id) => {
  return memoryUsers.find((user) => String(user._id) === String(id)) || null;
};

const createUser = async (userData) => {
  const user = {
    _id: crypto.randomUUID(),
    name: userData.name,
    email: normalizeEmail(userData.email),
    passwordHash: userData.passwordHash,
    role: userData.role || 'buyer',
    phone: userData.phone || '',
    location: userData.location || '',
    trustScore: userData.trustScore || 100,
    farmName: userData.farmName || '',
    primaryProduce: userData.primaryProduce || '',
    shoppingInterest: userData.shoppingInterest || '',
    verifiedSeller: Boolean(userData.verifiedSeller),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryUsers.push(user);
  return buildUserResponse(user);
};

const updateUserPasswordByEmail = async (email, newPasswordHash) => {
  const normalized = normalizeEmail(email);
  const user = memoryUsers.find((entry) => normalizeEmail(entry.email) === normalized);

  if (!user) return null;

  user.passwordHash = newPasswordHash;
  user.updatedAt = new Date().toISOString();
  return buildUserResponse(user);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPasswordByEmail,
  buildUserResponse,
  memoryUsers,
  memoryProducts,
  memoryOrders,
};
