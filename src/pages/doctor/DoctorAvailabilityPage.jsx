import { CalendarClock, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const clinics = [
  { id: "clinic-colombo", name: "MedStream Colombo Care" },
  { id: "clinic-kandy", name: "MedStream Kandy Center" },
  { id: "clinic-galle", name: "MedStream Galle Plus" },
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildDefaultDay(day) {
  return {
    day,
    active: ["Saturday", "Sunday"].includes(day) ? false : true,
    slots: [
      {
        id: `${day}-slot-1`,
        start: "09:00",
        end: "12:00",
        mode: "in-person",
      },
    ],
  };
}

function buildInitialState() {
  return Object.fromEntries(
    clinics.map((clinic) => [clinic.id, weekdays.map((day) => buildDefaultDay(day))])
  );
}

export default function DoctorAvailabilityPage() {
  const [selectedClinicId, setSelectedClinicId] = useState(clinics[0].id);
  const [availabilityByClinic, setAvailabilityByClinic] = useState(() => buildInitialState());

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === selectedClinicId) || clinics[0],
    [selectedClinicId]
  );

  const days = availabilityByClinic[selectedClinic.id] || [];

  const updateDays = (updater) => {
    setAvailabilityByClinic((prev) => ({
      ...prev,
      [selectedClinic.id]: updater(prev[selectedClinic.id] || []),
    }));
  };

  const toggleDay = (targetDay) => {
    updateDays((currentDays) =>
      currentDays.map((dayItem) =>
        dayItem.day === targetDay ? { ...dayItem, active: !dayItem.active } : dayItem
      )
    );
  };

  const addSlot = (targetDay) => {
    updateDays((currentDays) =>
      currentDays.map((dayItem) => {
        if (dayItem.day !== targetDay) {
          return dayItem;
        }

        const nextIndex = dayItem.slots.length + 1;
        return {
          ...dayItem,
          slots: [
            ...dayItem.slots,
            {
              id: `${targetDay}-slot-${nextIndex}-${Date.now()}`,
              start: "13:00",
              end: "16:00",
              mode: "telemedicine",
            },
          ],
        };
      })
    );
  };

  const removeSlot = (targetDay, slotId) => {
    updateDays((currentDays) =>
      currentDays.map((dayItem) => {
        if (dayItem.day !== targetDay) {
          return dayItem;
        }

        return {
          ...dayItem,
          slots: dayItem.slots.filter((slot) => slot.id !== slotId),
        };
      })
    );
  };

  const updateSlot = (targetDay, slotId, key, value) => {
    updateDays((currentDays) =>
      currentDays.map((dayItem) => {
        if (dayItem.day !== targetDay) {
          return dayItem;
        }

        return {
          ...dayItem,
          slots: dayItem.slots.map((slot) => (slot.id === slotId ? { ...slot, [key]: value } : slot)),
        };
      })
    );
  };

  const saveAvailability = () => {
    toast.success(`Dummy save: availability updated for ${selectedClinic.name}.`);
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-xl">
          <CalendarClock className="size-5 text-primary" />
          Availability Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <label className="text-sm font-medium text-slate-700">Select clinic to manage availability</label>
          <select
            value={selectedClinic.id}
            onChange={(event) => setSelectedClinicId(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-[360px]"
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            One doctor can work across multiple clinics. Availability is configured separately per clinic.
          </p>
        </div>

        {days.map((dayItem) => (
          <div key={dayItem.day} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{dayItem.day}</p>
                <p className="text-xs text-slate-500">
                  {dayItem.active ? "Available" : "Not available"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2">
                <Button type="button" size="xs" variant="outline" onClick={() => toggleDay(dayItem.day)}>
                  {dayItem.active ? "Mark unavailable" : "Mark available"}
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={() => addSlot(dayItem.day)}>
                  <Plus className="size-3" />
                  Add slot
                </Button>
              </div>
            </div>

            {dayItem.active ? (
              <div className="mt-3 space-y-2">
                {dayItem.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(event) => updateSlot(dayItem.day, slot.id, "start", event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    />
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(event) => updateSlot(dayItem.day, slot.id, "end", event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    />
                    <select
                      value={slot.mode}
                      onChange={(event) => updateSlot(dayItem.day, slot.id, "mode", event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="in-person">In-person</option>
                      <option value="telemedicine">Telemedicine</option>
                      <option value="both">Both</option>
                    </select>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeSlot(dayItem.day, slot.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No slots for this day because it is marked unavailable.</p>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="button" onClick={saveAvailability}>
            <Save className="size-4" />
            Save availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
