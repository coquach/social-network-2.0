'use client';
import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { addDays, startOfWeek } from 'date-fns';

export function CalendarDesktop() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (

      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        today={new Date()}
        className="rounded-md border"
        classNames={{
          day_today: 'bg-sky-100 text-sky-700',
          day_selected:
            'bg-sky-500 text-white hover:bg-sky-500 focus:bg-sky-500',
        }}
      />
   
  );
}

export function CalendarMobile() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const startWeek = startOfWeek(date ?? new Date(), { weekStartsOn: 1 });
  const endWeek = addDays(startWeek, 6);

  return (
    <div className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        fromDate={startWeek}
        toDate={endWeek}
        numberOfMonths={1}
        showOutsideDays={false}
        className="w-full"
        classNames={{
          months: 'flex overflow-x-auto',
          month: 'min-w-full',
          day_today: 'ring-1 ring-sky-300',
          day_selected:
            'bg-sky-500 text-white hover:bg-sky-500 focus:bg-sky-500',
        }}
      />
    </div>
  );
}
