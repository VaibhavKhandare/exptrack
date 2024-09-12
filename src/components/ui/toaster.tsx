"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && <ToastTitle className="text-lg font-semibold mb-1">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm text-gray-600">{description}</ToastDescription>
                )}
              </div>
              <ToastClose className="ml-4 -mt-1" />
            </div>
            {action && <div className="mt-2">{action}</div>}
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-full max-w-sm sm:max-w-md" />
    </ToastProvider>
  )
}
