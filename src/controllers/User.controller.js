import {asyncHandler} from '../utils/asyncHandler.js';
const resisterUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User resistered successfully',
  });
}

export {resisterUser};