import { apiClient } from '../api/client';

export const meetupsService = {
    getMeetups: () => apiClient.get('/meetups').then(res => res.data.data || res.data),
    createMeetup: (data) => apiClient.post('/meetups', data).then(res => res.data.data || res.data),
    joinMeetup: (id) => apiClient.patch(`/meetups/${id}/join`),
    getAttendees: (id) => apiClient.get(`/meetups/${id}/attendees`).then(res => res.data.data || res.data),
};
