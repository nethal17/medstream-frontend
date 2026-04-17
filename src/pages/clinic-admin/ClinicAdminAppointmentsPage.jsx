import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dummyDailyLoad = {
  3: 6,
  5: 2,
  8: 9,
  12: 5,
  14: 11,
  17: 4,
  19: 8,
  24: 7,
  27: 3,
};

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return cells;
}

export default function ClinicAdminAppointmentsPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const selectedCount = dummyDailyLoad[selectedDay] || 0;

  const shiftMonth = (direction) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDay(1);
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <CalendarDays className="size-5 text-primary" />
          Appointments Calendar (Dummy)
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="w-44 text-center text-sm font-semibold text-slate-700">{monthLabel(viewDate)}</p>
          <Button type="button" size="icon" variant="outline" onClick={() => shiftMonth(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {weekdayLabels.map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-16 rounded-md bg-slate-50" />;
            }

            const isSelected = selectedDay === day;
            const dailyCount = dummyDailyLoad[day] || 0;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={[
                  "h-16 rounded-md border p-2 text-left transition-colors",
                  isSelected
                    ? "border-teal-300 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <p className="text-sm font-semibold">{day}</p>
                <p className="text-xs">{dailyCount} booked</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-sm font-semibold text-slate-800">{selectedDay}th day summary</p>
          <p className="mt-1 text-sm text-slate-600">Total appointments scheduled: {selectedCount}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>9:00 AM - GP consultation block</li>
            <li>11:00 AM - Pediatric follow-up cluster</li>
            <li>2:30 PM - Telemedicine review slots</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
