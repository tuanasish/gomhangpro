import { RoutePath } from '../../types';

/**
 * Lấy route mặc định dựa trên role của user
 */
export function getDefaultRouteByRole(role: 'worker' | 'manager' | 'admin'): string {
  switch (role) {
    case 'worker':
      return RoutePath.WORKER_HOME;
    case 'manager':
    case 'admin':
      return RoutePath.MANAGER_DASHBOARD;
    default:
      return RoutePath.LOGIN;
  }
}

/**
 * Kiểm tra xem user có quyền truy cập route không
 */
export function hasAccessToRoute(
  userRole: 'worker' | 'manager' | 'admin',
  requiredRole: 'worker' | 'manager' | 'admin'
): boolean {
  const roleHierarchy: Record<'worker' | 'manager' | 'admin', number> = {
    worker: 1,
    manager: 2,
    admin: 3,
  };

  const userRoleLevel = roleHierarchy[userRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  // User có quyền truy cập nếu role level >= required role level
  return userRoleLevel >= requiredRoleLevel;
}

