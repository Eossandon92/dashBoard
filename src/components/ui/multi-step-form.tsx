import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { X } from "lucide-react";

const multiStepFormVariants = cva(
  "flex flex-col",
  {
    variants: {
      size: {
        default: "md:w-[700px]",
        sm: "md:w-[550px]",
        lg: "md:w-[850px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const MultiStepForm = React.forwardRef(
  ({
    className,
    size,
    currentStep,
    totalSteps,
    title,
    description,
    onBack,
    onNext,
    onClose,
    backButtonText = "Atrás",
    nextButtonText = "Siguiente",
    footerContent,
    children,
    progress: explicitProgress,
    progressText,
    fullWidthButton = false,
    accentColor = "blue", // "orange", "emerald", "blue"
    icon: Icon,
    ...props
  }, ref) => {
    const calculatedProgress = Math.round((currentStep / totalSteps) * 100);
    const progressValue = explicitProgress !== undefined ? explicitProgress : calculatedProgress;

    const variants = {
      hidden: { opacity: 0, x: 100 },
      enter: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
    };

    // Mapeo de estilos dinámicos
    // Mapeo de estilos dinámicos (Asegúrate de incluir violet aquí)
    const themes = {
      orange: {
        border: "border-t-4 border-t-orange-500",
        progress: "bg-orange-500",
        button: "bg-orange-600 hover:bg-orange-700",
        icon: "bg-orange-100 text-orange-600",
        text: "text-orange-600"
      },
      emerald: {
        border: "border-t-4 border-t-emerald-500",
        progress: "bg-emerald-500",
        button: "bg-emerald-600 hover:bg-emerald-700",


        icon: "bg-emerald-100 text-emerald-600",
        text: "text-emerald-600"
      },
      blue: {
        border: "border-t-4 border-t-blue-500",
        progress: "bg-blue-500",
        button: "bg-blue-600 hover:bg-blue-700",
        icon: "bg-blue-100 text-blue-600",
        text: "text-blue-600"
      },
      // === AGREGAMOS VIOLET ===
      violet: {
        border: "border-t-4 border-t-violet-500",
        progress: "bg-violet-500",
        button: "bg-violet-600 hover:bg-violet-700",
        icon: "bg-violet-100 text-violet-600",
        text: "text-violet-600"
      },
      // === AGREGAMOS RED (Por si acaso para urgencias) ===
      red: {
        border: "border-t-4 border-t-red-500",
        progress: "bg-red-500",
        button: "bg-red-600 hover:bg-red-700",
        icon: "bg-red-100 text-red-600",
        text: "text-red-600"
      },
      // === AGREGAMOS AMBER (Por si acaso para urgencias) ===
      amber: {
        border: "border-t-4 border-t-amber-500",
        progress: "bg-amber-500",
        button: "bg-amber-600 hover:bg-amber-700",
        icon: "bg-amber-100 text-amber-600",
        text: "text-amber-600"
      }
    };

    const currentTheme = themes[accentColor] || themes.blue;

    return (
      <Card ref={ref} className={cn(multiStepFormVariants({ size }), currentTheme.border, className)} {...props}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn("p-2 rounded-lg", currentTheme.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <CardTitle>{title}</CardTitle>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
          <div className="flex items-center gap-2 mb-2 mt-2">
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
              Progreso del registro
            </p>

            <p className={cn("text-xs font-black uppercase tracking-tighter", currentTheme.text)}>
              {progressText || `${progressValue}% Completado`}
            </p>
          </div>

          <Progress
            value={progressValue}
            className="h-1.5 w-full"
            indicatorClassName={cn(progressValue === 100 ? "bg-green-500" : currentTheme.progress)}
          />
        </CardHeader>

        <CardContent className="min-h-[300px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={variants}
              initial="hidden"
              animate="enter"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <div className="flex-1">{footerContent}</div>
          <div className={cn("flex gap-2", fullWidthButton && "w-full")}>
            {onBack && currentStep > 1 && (
              <Button variant="outline" onClick={onBack} className={cn(fullWidthButton && "flex-1")}>
                {backButtonText}
              </Button>
            )}
            <Button
              onClick={onNext}
              className={cn(currentTheme.button, "text-white", fullWidthButton && "w-full flex-1")}
            >
              {nextButtonText}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
);

MultiStepForm.displayName = "MultiStepForm";

export { MultiStepForm };