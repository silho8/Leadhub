// This file will contain all the Supabase Storage logic.
import { supabaseClient } from './supabase-config.js';
import { auth } from './firebase-config.js';

// Function to upload a profile picture
export async function uploadProfilePicture(file) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to upload a picture.");
        return null;
    }

    // The path will be the user's UID as a folder, with a consistent file name.
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.uid}/profile.${fileExt}`;

    try {
        const { data, error } = await supabaseClient
            .storage
            .from('profile-pictures') // The name of our storage bucket
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Overwrite file if it exists
            });

        if (error) {
            throw error;
        }

        // Get the public URL of the uploaded file
        const { data: urlData } = supabaseClient
            .storage
            .from('profile-pictures')
            .getPublicUrl(filePath);

        console.log('Successfully uploaded file. Public URL:', urlData.publicUrl);
        return urlData.publicUrl;

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Error uploading picture: " + error.message);
        return null;
    }
}
