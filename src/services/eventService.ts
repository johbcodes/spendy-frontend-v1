/**
 * Event Service
 * Handles all event-related data operations using backend API
 */

import { Event } from '../types';
import { eventAPI, Event as BackendEvent } from './backendAPI';

class EventService {
  /**
   * Convert backend event to app event format
   */
  private convertToAppEvent(backendEvent: BackendEvent): Event {
    return {
      id: backendEvent.id,
      name: backendEvent.name,
      type: backendEvent.type,
      category: backendEvent.category || '',
      client: backendEvent.client || '',
      brand: backendEvent.brand || '',
      projectLead: backendEvent.projectLead || '',
      budget: backendEvent.budget,
      spent: backendEvent.spent,
      startDate: backendEvent.startDate,
      endDate: backendEvent.endDate || '',
      status: backendEvent.status,
      location: backendEvent.location || '',
      documents: backendEvent.documents || [],
    };
  }

  /**
   * Get all events from backend
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await eventAPI.getAll();
      return response.data.map(e => this.convertToAppEvent(e));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | undefined> {
    try {
      const response = await eventAPI.getById(eventId);
      return this.convertToAppEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      return undefined;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(event: Event): Promise<Event> {
    try {
      const response = await eventAPI.create({
        name: event.name,
        type: event.type,
        category: event.category,
        client: event.client,
        brand: event.brand,
        projectLead: event.projectLead,
        budget: event.budget,
        spent: event.spent,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        location: event.location,
        documents: event.documents,
      });
      return this.convertToAppEvent(response.data);
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event | null> {
    try {
      const response = await eventAPI.update(eventId, {
        name: updates.name,
        type: updates.type,
        category: updates.category,
        client: updates.client,
        brand: updates.brand,
        projectLead: updates.projectLead,
        budget: updates.budget,
        spent: updates.spent,
        startDate: updates.startDate,
        endDate: updates.endDate,
        status: updates.status,
        location: updates.location,
        documents: updates.documents,
      });
      return this.convertToAppEvent(response.data);
    } catch (error) {
      console.error('Failed to update event:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await eventAPI.delete(eventId);
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  /**
   * Update event budget
   */
  async updateEventBudget(eventId: string, budgetChange: number): Promise<Event | null> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) {
        return null;
      }

      return await this.updateEvent(eventId, {
        spent: event.spent + budgetChange
      });
    } catch (error) {
      console.error('Failed to update event budget:', error);
      return null;
    }
  }

  /**
   * Get events by status
   */
  async getEventsByStatus(status: string): Promise<Event[]> {
    try {
      const response = await eventAPI.getAll({ status });
      return response.data.map(e => this.convertToAppEvent(e));
    } catch (error) {
      console.error('Failed to fetch events by status:', error);
      return [];
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: string): Promise<Event[]> {
    try {
      const response = await eventAPI.getAll({ type });
      return response.data.map(e => this.convertToAppEvent(e));
    } catch (error) {
      console.error('Failed to fetch events by type:', error);
      return [];
    }
  }

  /**
   * Get events by client
   */
  async getEventsByClient(client: string): Promise<Event[]> {
    try {
      const response = await eventAPI.getAll({ client });
      return response.data.map(e => this.convertToAppEvent(e));
    } catch (error) {
      console.error('Failed to fetch events by client:', error);
      return [];
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string): Promise<any> {
    try {
      const response = await eventAPI.getStats(eventId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
      return null;
    }
  }
}

export const eventService = new EventService();
