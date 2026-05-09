
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from 'lucide-react';
import { Toast as ToastType } from '../../hooks/useToast';
interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}
export function ToastContainer({
  toasts,
  onRemove
}: ToastContainerProps) {
  return <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => <Toast key={toast.id} toast={toast} onRemove={onRemove} />)}
    </div>;
}
function Toast({
  toast,
  onRemove
}: {
  toast: ToastType;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
    error: <XCircleIcon className="w-5 h-5 text-red-600" />,
    info: <InfoIcon className="w-5 h-5 text-blue-600" />
  };
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };
  return <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toast.type]} min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-dark-gray">
        {toast.message}
      </p>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 hover:scale-110 hover:rotate-90 transition-all duration-200">
        <XIcon className="w-4 h-4" />
      </button>
    </div>;
}