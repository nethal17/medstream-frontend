import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RescheduleAppointmentModal({
  open,
  initialDate = "",
  initialStartTime = "",
  initialConsultationType = "physical",
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [consultationType, setConsultationType] = useState(initialConsultationType || "physical");

  if (!open) {
    return null;
  }

  const canSubmit = Boolean(date && startTime && consultationType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <Card className="w-full max-w-md border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Reschedule appointment</CardTitle>
          <p className="text-sm text-muted-foreground">Choose a new slot and consultation mode.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Consultation type</label>
            <select
              value={consultationType}
              onChange={(event) => setConsultationType(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="physical">In-person</option>
              <option value="telemedicine">Telemedicine</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              onClick={() =>
                onConfirm({
                  new_date: date,
                  new_start_time: startTime,
                  new_consultation_type: consultationType,
                })
              }
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Rescheduling..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
