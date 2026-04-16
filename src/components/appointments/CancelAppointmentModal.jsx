import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CancelAppointmentModal({
  open,
  title = "Cancel appointment",
  requireReason = false,
  confirmLabel = "Confirm cancel",
  initialReason = "",
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState(initialReason);

  if (!open) {
    return null;
  }

  const canSubmit = !requireReason || reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <Card className="w-full max-w-md border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            This will update appointment status immediately.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reason</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="Enter cancellation reason"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => onConfirm(reason.trim())}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
