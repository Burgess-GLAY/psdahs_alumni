import api from './api';

const classGroupService = {
  // Group operations
  fetchGroups: async (params = {}) => {
    const response = await api.get('/class-groups', { params });
    return response.data;
  },

  fetchGroupById: async (id) => {
    const response = await api.get(`/class-groups/${id}`);
    return response.data;
  },

  // Post operations
  fetchPosts: async (groupId, page = 1, limit = 10) => {
    const response = await api.get(`/class-groups/${groupId}/posts`, {
      params: { page, limit }
    });
    return response.data;
  },

  createPost: async (groupId, { content, images = [] }) => {
    const formData = new FormData();
    formData.append('content', content);

    // Append each image file
    images.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await api.post(`/class-groups/${groupId}/posts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Comment operations
  addComment: async (groupId, postId, content) => {
    const response = await api.post(
      `/class-groups/${groupId}/posts/${postId}/comments`,
      { content }
    );
    return response.data;
  },

  // Reaction operations
  addReaction: async (groupId, targetType, targetId, type = 'like') => {
    const response = await api.post(
      `/class-groups/${groupId}/react/${targetType}/${targetId}`,
      { type }
    );
    return response.data;
  },

  // Event operations
  fetchEvents: async (groupId, upcoming = true) => {
    const response = await api.get(`/class-groups/${groupId}/events`, {
      params: { upcoming: upcoming.toString() }
    });
    return response.data;
  },

  createEvent: async (groupId, eventData) => {
    const response = await api.post(
      `/class-groups/${groupId}/events`,
      eventData
    );
    return response.data;
  },

  // Album operations
  fetchAlbums: async (groupId) => {
    const response = await api.get(`/class-groups/${groupId}/albums`);
    return response.data;
  },

  createAlbum: async (groupId, { title, description, isPublic = true }) => {
    const response = await api.post(`/class-groups/${groupId}/albums`, {
      title,
      description,
      isPublic
    });
    return response.data;
  },

  uploadToAlbum: async (groupId, albumId, { image, caption = '' }) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    const response = await api.post(
      `/class-groups/${groupId}/albums/${albumId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Member operations
  fetchMembers: async (groupId) => {
    const response = await api.get(`/class-groups/${groupId}/members`);
    return response.data;
  },

  joinGroup: async (groupId) => {
    const response = await api.post(`/class-groups/${groupId}/join`);
    return response.data;
  },

  leaveGroup: async (groupId) => {
    const response = await api.post(`/class-groups/${groupId}/leave`);
    return response.data;
  },

  // Search and filter
  searchMembers: async (groupId, query) => {
    const response = await api.get(`/class-groups/${groupId}/members/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Group stats
  fetchGroupStats: async (groupId) => {
    const response = await api.get(`/class-groups/${groupId}/stats`);
    return response.data;
  },

  // Photo upload (admin only)
  uploadClassPhoto: async (groupId, formData) => {
    const response = await api.post(`/class-groups/${groupId}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default classGroupService;
