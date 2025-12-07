import { Router } from 'express';
import { getShiftsList, getShiftById, getCurrentShift, createShift, startShift, endShift } from '../controllers/shifts.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/shifts
 * @desc    Lấy danh sách ca làm việc
 * @access  Private (Manager/Admin)
 */
router.get('/', authenticate, authorize('manager', 'admin'), getShiftsList);

/**
 * @route   GET /api/shifts/current
 * @desc    Lấy ca hiện tại của worker
 * @access  Private (Worker)
 */
router.get('/current', authenticate, authorize('worker'), getCurrentShift);

/**
 * @route   GET /api/shifts/:id
 * @desc    Lấy chi tiết ca làm việc
 * @access  Private (Worker/Manager/Admin)
 */
router.get('/:id', authenticate, authorize('worker', 'manager', 'admin'), getShiftById);

/**
 * @route   POST /api/shifts
 * @desc    Tạo ca mới
 * @access  Private (Manager/Admin)
 */
router.post('/', authenticate, authorize('manager', 'admin'), createShift);

/**
 * @route   PUT /api/shifts/:id/start
 * @desc    Bắt đầu ca
 * @access  Private (Worker)
 */
router.put('/:id/start', authenticate, authorize('worker'), startShift);

/**
 * @route   PUT /api/shifts/:id/end
 * @desc    Kết thúc ca
 * @access  Private (Worker)
 */
router.put('/:id/end', authenticate, authorize('worker'), endShift);

export default router;

