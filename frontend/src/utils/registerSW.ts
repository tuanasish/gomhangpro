import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Có bản cập nhật mới, có thể hiển thị thông báo
      console.log('New content available, please refresh.');
      // Có thể hiển thị notification cho user
      if (window.confirm('Có phiên bản mới. Bạn có muốn tải lại trang?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    }
  });
  
  return updateSW;
}

