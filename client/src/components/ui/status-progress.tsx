import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle, Package } from "lucide-react";

type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface StatusProgressProps {
  status: ServiceStatus;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const statusConfig = {
  pending: {
    label: 'في الانتظار',
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    progressColor: 'bg-orange-500',
    step: 1,
  },
  in_progress: {
    label: 'قيد التنفيذ',
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    progressColor: 'bg-blue-500',
    step: 2,
  },
  completed: {
    label: 'مكتمل',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    progressColor: 'bg-green-500',
    step: 3,
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    progressColor: 'bg-red-500',
    step: 0,
  },
};

const steps = [
  { key: 'pending', label: 'استلام الطلب', icon: Package },
  { key: 'in_progress', label: 'قيد الإصلاح', icon: AlertCircle },
  { key: 'completed', label: 'جاهز للتسليم', icon: CheckCircle2 },
];

export function StatusProgress({ 
  status, 
  className, 
  showLabel = true, 
  size = 'md',
  animate = true 
}: StatusProgressProps) {
  const [mounted, setMounted] = useState(false);
  const config = statusConfig[status];
  const currentStep = config.step;

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: {
      container: 'h-2',
      icon: 'w-6 h-6',
      text: 'text-xs',
      padding: 'p-1',
      gap: 'gap-2',
    },
    md: {
      container: 'h-3',
      icon: 'w-8 h-8',
      text: 'text-sm',
      padding: 'p-1.5',
      gap: 'gap-3',
    },
    lg: {
      container: 'h-4',
      icon: 'w-10 h-10',
      text: 'text-base',
      padding: 'p-2',
      gap: 'gap-4',
    },
  };

  const sizes = sizeClasses[size];

  if (status === 'cancelled') {
    const Icon = config.icon;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "rounded-full flex items-center justify-center transition-all duration-500",
          sizes.padding,
          config.bgColor,
          animate && mounted && "animate-pulse"
        )}>
          <Icon className={cn(sizes.icon, config.color)} />
        </div>
        {showLabel && (
          <span className={cn(sizes.text, "font-medium", config.color)}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Steps */}
      <div className={cn("flex items-center justify-between", sizes.gap)}>
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-700 transform",
                  sizes.padding,
                  isCompleted && "bg-green-100 scale-100",
                  isActive && cn(config.bgColor, animate && mounted && "scale-110 animate-pulse"),
                  isPending && "bg-gray-100 scale-90",
                  mounted && "transition-transform"
                )}>
                  <StepIcon className={cn(
                    sizes.icon,
                    "transition-all duration-500",
                    isCompleted && "text-green-500",
                    isActive && config.color,
                    isPending && "text-gray-400",
                    mounted && isActive && animate && "animate-bounce"
                  )} />
                </div>
                
                {/* Animated Ring for Active Step */}
                {isActive && animate && (
                  <div className={cn(
                    "absolute inset-0 rounded-full border-2 animate-ping",
                    config.borderColor,
                    "opacity-75"
                  )} />
                )}
              </div>

              {/* Step Label */}
              {showLabel && (
                <span className={cn(
                  sizes.text,
                  "mt-2 font-medium text-center transition-colors duration-500",
                  isCompleted && "text-green-600",
                  isActive && config.color,
                  isPending && "text-gray-400"
                )}>
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative px-8">
        <div className={cn(
          "w-full rounded-full overflow-hidden",
          sizes.container,
          "bg-gray-200"
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              config.progressColor,
              mounted && animate && "animate-pulse"
            )}
            style={{
              width: mounted ? `${(currentStep / 3) * 100}%` : '0%',
              transition: mounted ? 'width 1s ease-out' : 'none'
            }}
          />
        </div>
        
        {/* Progress Percentage */}
        {showLabel && (
          <div className={cn(
            "absolute -top-8 transition-all duration-1000",
            sizes.text,
            config.color
          )}
          style={{
            left: mounted ? `${(currentStep / 3) * 100}%` : '0%',
            transform: 'translateX(-50%)'
          }}>
            <span className="font-bold">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Current Status Label */}
      {showLabel && (
        <div className={cn(
          "text-center font-medium transition-colors duration-500",
          sizes.text,
          config.color
        )}>
          الحالة الحالية: {config.label}
        </div>
      )}
    </div>
  );
}

// Compact version for tables
export function StatusBadge({ status, animate = false }: { status: ServiceStatus; animate?: boolean }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-500",
      config.bgColor,
      config.color,
      animate && mounted && status === 'in_progress' && "animate-pulse"
    )}>
      <Icon className={cn(
        "w-3.5 h-3.5",
        animate && mounted && status === 'in_progress' && "animate-spin"
      )} />
      <span>{config.label}</span>
    </div>
  );
}