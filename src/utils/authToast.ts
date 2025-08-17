import toast from 'react-hot-toast';

export const authToast = {
    success: (message: string, provider?: string) => {
        const emoji = provider === 'facebook' ? '🎉' : provider === 'google' ? '🎊' : '✅';
        toast.success(`${message} ${emoji}`, {
            duration: 3000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: 'white',
                fontWeight: '500',
            },
        });
    },

    error: (message: string, errorCode?: string) => {
        const displayMessage = errorCode ? `${message} (Mã lỗi: ${errorCode})` : message;
        toast.error(displayMessage, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#EF4444',
                color: 'white',
                fontWeight: '500',
                maxWidth: '400px',
            },
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            position: 'top-right',
            style: {
                background: '#3B82F6',
                color: 'white',
                fontWeight: '500',
            },
        });
    },

    info: (message: string) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#0EA5E9',
                color: 'white',
                fontWeight: '500',
            },
        });
    }
};
