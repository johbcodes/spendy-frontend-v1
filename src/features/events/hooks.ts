import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventFeatureApi } from './api';
import { toEvent } from './mappers';
import {
  appendEventDocument,
  applyEventUpdate,
  buildEventCreatePayload,
  buildEventUpdatePayload,
  filterEvents,
  incrementEventSpent,
  summarizeEvents,
} from './rules';
import type { Event, Payment, User } from '../../types';
import type { EventFilters } from './types';

export function useEvents(currentUser: User | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setEvents([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const dtos = await eventFeatureApi.list();
      setEvents(dtos.map(toEvent));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load events'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, setEvents, isLoading, error, refresh };
}

export function useEventView(
  events: Event[],
  payments: Payment[],
  filters: EventFilters,
) {
  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const summary = useMemo(() => summarizeEvents(events, payments), [events, payments]);

  return { filteredEvents, summary };
}

export function useEventController(currentUser: User | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const persistEvents = useCallback((nextEvents: Event[]) => {
    setEvents(nextEvents);
    localStorage.setItem('spendy_events', JSON.stringify(nextEvents));
  }, []);

  const refreshEvents = useCallback(async () => {
    if (!currentUser) {
      setEvents([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const dtos = await eventFeatureApi.list();
      persistEvents(dtos.map(toEvent));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load events'));
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, persistEvents]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const addEvent = useCallback(async (eventData: Partial<Event>) => {
    const savedEvent = toEvent(await eventFeatureApi.create(buildEventCreatePayload(eventData) as any));
    setEvents(previous => {
      const nextEvents = [...previous, savedEvent];
      localStorage.setItem('spendy_events', JSON.stringify(nextEvents));
      return nextEvents;
    });
    return savedEvent;
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>) => {
    const savedEvent = toEvent(await eventFeatureApi.update(eventId, buildEventUpdatePayload(eventData) as any));
    setEvents(previous => {
      const nextEvents = applyEventUpdate(previous, savedEvent);
      localStorage.setItem('spendy_events', JSON.stringify(nextEvents));
      return nextEvents;
    });
    return savedEvent;
  }, []);

  const archiveEvent = useCallback((eventId: string) => {
    return updateEvent(eventId, { status: 'Archived' as Event['status'] });
  }, [updateEvent]);

  const updateEventStatus = useCallback((eventId: string, status: string) => {
    return updateEvent(eventId, { status: status as Event['status'] });
  }, [updateEvent]);

  const uploadEventDocument = useCallback((eventId: string, documentName: string) => {
    setEvents(previous => {
      const nextEvents = appendEventDocument(previous, eventId, documentName);
      localStorage.setItem('spendy_events', JSON.stringify(nextEvents));
      return nextEvents;
    });
  }, []);

  const addEventSpend = useCallback((eventId: string, amount: number) => {
    setEvents(previous => {
      const nextEvents = incrementEventSpent(previous, eventId, amount);
      localStorage.setItem('spendy_events', JSON.stringify(nextEvents));
      return nextEvents;
    });
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    localStorage.removeItem('spendy_events');
  }, []);

  return {
    events,
    setEvents,
    isLoading,
    error,
    refreshEvents,
    clearEvents,
    addEvent,
    updateEvent,
    archiveEvent,
    updateEventStatus,
    uploadEventDocument,
    addEventSpend,
  };
}
