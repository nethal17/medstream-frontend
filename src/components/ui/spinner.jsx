import { cn } from "@/lib/utils"
import { LoaderIcon } from "lucide-react"

function Spinner({
  className,
  ...props
}) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin text-muted-foreground", className)}
      {...props} />
  );
}

export { Spinner }
