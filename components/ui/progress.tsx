import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

function Progress({ className, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn("h-2 w-full overflow-hidden rounded-full bg-stone-100", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full rounded-full bg-[#7d9477] transition-all duration-500"
      />
    </ProgressPrimitive.Track>
  )
}

export { Progress, ProgressTrack }