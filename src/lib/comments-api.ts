// src/lib/comments-api.ts

// Function to integrate Facebook Comments API

import axios from 'axios';

// Replace with your Facebook access token
const ACCESS_TOKEN = 'YOUR_FACEBOOK_ACCESS_TOKEN';

// Function to post a comment
export const postComment = async (postId, message) => {
    try {
        const response = await axios.post(`https://graph.facebook.com/v12.0/${postId}/comments`, {
            message,
            access_token: ACCESS_TOKEN
        });
        return response.data;
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
};

// Function to fetch comments
export const fetchComments = async (postId) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v12.0/${postId}/comments`, {
            params: {
                access_token: ACCESS_TOKEN
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

// Function to delete a comment
export const deleteComment = async (commentId) => {
    try {
        const response = await axios.delete(`https://graph.facebook.com/v12.0/${commentId}`, {
            params: {
                access_token: ACCESS_TOKEN
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};