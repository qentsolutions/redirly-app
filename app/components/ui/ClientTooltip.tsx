"use client";
import * as React from "react";
import { createPortal } from "react-dom";

/* -------------------------------------------------------------------------------------------------
 * This is a basic tooltip created for the chart demos. Customize as needed or bring your own solution.
 * -----------------------------------------------------------------------------------------------*/

type TooltipContextValue = {
  tooltip: { x: number; y: number; content: React.ReactNode } | undefined;
  setTooltip: (tooltip: { x: number; y: number; content: React.ReactNode } | undefined) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
};

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

function useTooltipContext(componentName: string): TooltipContextValue {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip must be used within a Tooltip Context");
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; content: React.ReactNode }>();
  const [isActive, setIsActive] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ tooltip, setTooltip, isActive, setIsActive }}>
      {children}
    </TooltipContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "TooltipTrigger";

type TooltipTriggerProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  as?: 'div' | 'g';
};

const TooltipTrigger = React.forwardRef<HTMLDivElement | SVGGElement, TooltipTriggerProps>(
  (props, forwardedRef) => {
    const { children, content, as: Component = 'div' } = props;
    const context = useTooltipContext(TRIGGER_NAME);
    const triggerRef = React.useRef<HTMLDivElement | SVGGElement | null>(null);

    const handlers = {
      onPointerMove: (event: React.PointerEvent) => {
        if (event.pointerType === "mouse") {
          context.setTooltip({ x: event.clientX, y: event.clientY, content });
          context.setIsActive(true);
        }
      },
      onPointerLeave: (event: React.PointerEvent) => {
        if (event.pointerType === "mouse") {
          context.setIsActive(false);
        }
      },
      onTouchStart: (event: React.TouchEvent) => {
        context.setTooltip({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
          content
        });
        context.setIsActive(true);
        setTimeout(() => {
          context.setIsActive(false);
        }, 2000);
      },
    };

    const ref = (node: HTMLDivElement | SVGGElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node as any);
      } else if (forwardedRef) {
        (forwardedRef as any).current = node;
      }
    };

    if (Component === 'g') {
      return (
        <g ref={ref as any} {...handlers}>
          {children}
        </g>
      );
    }

    return (
      <div ref={ref as any} {...handlers}>
        {children}
      </div>
    );
  }
);

TooltipTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "TooltipContent";

const TooltipContent = React.forwardRef<HTMLDivElement, {}>((props, forwardedRef) => {
  const context = useTooltipContext(CONTENT_NAME);
  const runningOnClient = typeof document !== "undefined";
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  // Update position smoothly when tooltip moves
  React.useEffect(() => {
    if (!tooltipRef.current || !context.tooltip) return;

    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine if tooltip should be on left or right
    const willOverflowRight = context.tooltip.x + tooltipWidth + 20 > viewportWidth;
    const willOverflowBottom = context.tooltip.y + tooltipHeight + 10 > viewportHeight;

    const newPosition = {
      top: willOverflowBottom ? context.tooltip.y - tooltipHeight - 10 : context.tooltip.y + 10,
      left: willOverflowRight ? context.tooltip.x - tooltipWidth - 20 : context.tooltip.x + 20,
    };

    setPosition(newPosition);
  }, [context.tooltip]);

  // Handle visibility with smooth transition
  React.useEffect(() => {
    if (context.isActive && context.tooltip) {
      setIsVisible(true);
    } else {
      // Add a small delay before hiding to prevent flicker
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [context.isActive, context.tooltip]);

  if (!context.tooltip || !runningOnClient || !isVisible) {
    return null;
  }

  const isMobile = window.innerWidth < 768;

  return createPortal(
    <div
      ref={tooltipRef}
      className="bg-white border border-zinc-200 px-3.5 py-2 rounded-sm fixed z-50 pointer-events-none shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transition: 'top 0.15s ease-out, left 0.15s ease-out, opacity 0.15s ease-out',
        opacity: context.isActive ? 1 : 0,
      }}
    >
      {context.tooltip.content}
    </div>,
    document.body
  );
});

TooltipContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export { Tooltip as ClientTooltip, TooltipTrigger, TooltipContent };
