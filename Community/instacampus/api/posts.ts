import { storage } from '@/utils/storage';
import { Platform } from 'react-native';

const API_URL = 'https://jr3qx5z4-5000.inc1.devtunnels.ms'; // Replace with your actual API URL

// Ensure filename has valid extension
function ensureValidFileExtension(filename: string): string {
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
  const extensionMatch = /\.([^.]+)$/.exec(filename.toLowerCase());
  
  if (extensionMatch && allowedExtensions.includes(extensionMatch[1])) {
    return filename; // File already has valid extension
  }
  
  // Default to jpg if no valid extension
  return filename.includes('.') ? 
    filename.substring(0, filename.lastIndexOf('.')) + '.jpg' : 
    filename + '.jpg';
}

// Upload a new post
export async function uploadPost(image: string, imageFile: any, formFields: Record<string, string>) {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Create form data
    const formData = new FormData();
    
    // Add the file to form data differently based on platform
    if (Platform.OS === 'web') {
      // On web, create a properly named file with valid extension
      if (!imageFile || !imageFile.file) {
        throw new Error('Invalid image file');
      }
      
      // Get the file object and ensure it has a valid filename extension
      const file = imageFile.file;
      const validFileName = ensureValidFileExtension(file.name || 'image.jpg');
      
      // Create a new file object with the valid filename
      const validFile = new File(
        [file], 
        validFileName, 
        { type: file.type || 'image/jpeg' }
      );
      
      formData.append('file', validFile);
      console.log('Web file appended:', validFile.name, validFile.type, validFile.size);
    } else {
      // On native platforms, create the file object in the format expected by the server
      // Extract extension from URI or default to jpg
      const uriParts = image.split('.');
      const fileExt = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'jpg';
      
      // Make sure we have a valid extension
      const validExt = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExt || '') ? 
        fileExt : 'jpg';
      
      const fileName = `image.${validExt}`;
      
      formData.append('file', {
        uri: image,
        name: fileName,
        type: `image/${validExt === 'jpg' ? 'jpeg' : validExt}`,
      } as any);
      
      console.log('Native file appended:', fileName, `image/${validExt === 'jpg' ? 'jpeg' : validExt}`);
    }
    
    // Append all other form fields
    Object.entries(formFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    console.log('Sending upload request with form data...');
    
    // Send the request
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log('Upload response status:', response.status);
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server error response:', data);
      throw new Error(data.error || 'Failed to upload post');
    }
    
    return data.post;
  } catch (error) {
    console.error('Error uploading post:', error);
    throw error;
  }
}
