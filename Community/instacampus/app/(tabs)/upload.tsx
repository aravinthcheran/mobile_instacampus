import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, ActivityIndicator, Alert, View } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DateTimePickerModal } from '@/components/DateTimePickerModal';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostContext';
import { storage } from '@/utils/storage';

// Replace with your API URL
const API_URL = 'https://jr3qx5z4-5000.inc1.devtunnels.ms';
const EVENT_TYPES = ['Conference', 'Workshop', 'Hackathon', 'Webinar', 'Meetup', 'Other'];

export default function UploadScreen() {
  const { user } = useAuth();
  const { loadPosts } = usePosts();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [eventName, setEventName] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<{ type: 'start' | 'end', mode: 'date' | 'time' } | null>(null);

  // Format date for display and API
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Combine date and time for API
  const combineDateAndTime = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours || 0, minutes || 0);
    return newDate.toISOString();
  };

  // Get MIME type for the file
  const getMimeType = (uri: string) => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg'; // Default fallback
    }
  };

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageFile(result.assets[0]);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    if (!image || !imageFile) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setLoading(true);

    try {
      const token = await storage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create FormData object
      const formData = new FormData();

      // Combine date and time
      const startDateTime = combineDateAndTime(startDate, startTime);
      const endDateTime = combineDateAndTime(endDate, endTime);

      // Add post details
      formData.append('event_name', eventName);
      formData.append('caption', caption || '');
      formData.append('location', location || '');
      formData.append('registration_link', registrationLink || '');
      formData.append('event_type', eventType || '');
      formData.append('start_date', startDateTime);
      formData.append('end_date', endDateTime);

      // Add image file
      if (Platform.OS === 'web') {
        // Web handling
        if (imageFile) {
          const response = await fetch(image);
          const blob = await response.blob();

          let fileName = image.split('/').pop() || 'image.jpg';
          if (!fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
            fileName = `${fileName}.jpg`;
          }

          const file = new File([blob], fileName, { type: getMimeType(fileName) });
          formData.append('file', file);
        }
      } else {
        // Native handling
        const fileUri = imageFile.uri;
        const fileName = fileUri.split('/').pop() || 'image.jpg';
        const fileType = getMimeType(fileName);

        // @ts-ignore - React Native specific
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      }

      console.log('Uploading post with formData:', Object.fromEntries(formData));

      // Send API request
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type here, it's set automatically with boundary for FormData
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload post');
      }

      console.log('Upload successful:', responseData);

      Alert.alert(
        'Success',
        'Event posted successfully!',
        [{
          text: 'OK', onPress: () => {
            // Reset form
            setImage(null);
            setImageFile(null);
            setEventName('');
            setCaption('');
            setLocation('');
            setRegistrationLink('');
            setEventType('');
            setStartDate(new Date());
            setEndDate(new Date());
            setStartTime('09:00');
            setEndTime('17:00');

            // Refresh posts and navigate back to dashboard
            loadPosts();
            router.replace('/(tabs)');
          }
        }]
      );
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload post');
    } finally {
      setLoading(false);
    }
  };

  const DateInput = ({ label, value, onChange }: { label: string, value: Date, onChange: (date: Date) => void }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>{label}</ThemedText>
          <input
            type="date"
            value={formatDateString(value)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onChange(newDate);
              }
            }}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#fff',
              fontSize: 16,
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>{label}</ThemedText>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setActivePicker({
                type: label.toLowerCase().includes('start') ? 'start' : 'end',
                mode: 'date'
              });
              setDatePickerVisible(true);
            }}
          >
            <View style={styles.dateButtonContent}>
              <ThemedText style={styles.dateButtonText}>{formatDateString(value)}</ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#0a7ea4" />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const TimeInput = ({ label, value, onChange }: { label: string, value: string, onChange: (time: string) => void }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>{label}</ThemedText>
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#fff',
              fontSize: 16,
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>{label}</ThemedText>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setActivePicker({
                type: label.toLowerCase().includes('start') ? 'start' : 'end',
                mode: 'time'
              });
              setTimePickerVisible(true);
            }}
          >
            <View style={styles.dateButtonContent}>
              <ThemedText style={styles.dateButtonText}>{value}</ThemedText>
              <Ionicons name="time-outline" size={20} color="#0a7ea4" />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const handleDateConfirm = (dateString: string) => {
    if (!activePicker) return;

    const newDate = new Date(dateString);
    if (!isNaN(newDate.getTime())) {
      if (activePicker.type === 'start') {
        setStartDate(newDate);
      } else {
        setEndDate(newDate);
      }
    }
  };

  const handleTimeConfirm = (timeString: string) => {
    if (!activePicker) return;

    if (activePicker.type === 'start') {
      setStartTime(timeString);
    } else {
      setEndTime(timeString);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Create Event' }} />

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.form}>
          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={pickImage}
                >
                  <ThemedText style={styles.changeImageText}>Change Image</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <ThemedView style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={50} color="#999" />
                <ThemedText style={styles.imagePlaceholderText}>Tap to add event image*</ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>

          {/* Event Name */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Event Name*</ThemedText>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="Enter event name"
            />
          </View>

          {/* Event Type */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Event Type</ThemedText>
            {Platform.OS === 'web' ? (
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  backgroundColor: '#fff',
                  fontSize: 16,
                }}
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  Alert.alert(
                    "Select Event Type",
                    "Choose type:",
                    [
                      ...EVENT_TYPES.map(type => ({
                        text: type,
                        onPress: () => setEventType(type)
                      })),
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }}
              >
                <ThemedText>{eventType || 'Select Event Type'}</ThemedText>
                <Ionicons name="chevron-down" size={20} color="#666" style={styles.inputIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Event Description */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={caption}
              onChangeText={setCaption}
              placeholder="Describe your event"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Location</ThemedText>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Event location"
            />
          </View>

          {/* Registration Link */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Registration Link</ThemedText>
            <TextInput
              style={styles.input}
              value={registrationLink}
              onChangeText={setRegistrationLink}
              placeholder="https://example.com/register"
              keyboardType="url"
            />
          </View>

          {/* Section Title */}
          <ThemedText style={styles.sectionTitle}>Event Schedule</ThemedText>

          {/* Date and Time inputs */}
          <View style={styles.row}>
            <View style={[styles.column, { marginRight: 10 }]}>
              <DateInput
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
            </View>
            <View style={styles.column}>
              <TimeInput
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.column, { marginRight: 10 }]}>
              <DateInput
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </View>
            <View style={styles.column}>
              <TimeInput
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Create Event</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        {Platform.OS !== 'web' && (
          <>
            <DateTimePickerModal
              isVisible={datePickerVisible}
              onClose={() => setDatePickerVisible(false)}
              onConfirm={handleDateConfirm}
              title={`Select ${activePicker?.type === 'start' ? 'Start' : 'End'} Date`}
              initialValue={formatDateString(activePicker?.type === 'start' ? startDate : endDate)}
              type="date"
            />

            <DateTimePickerModal
              isVisible={timePickerVisible}
              onClose={() => setTimePickerVisible(false)}
              onConfirm={handleTimeConfirm}
              title={`Select ${activePicker?.type === 'start' ? 'Start' : 'End'} Time`}
              initialValue={activePicker?.type === 'start' ? startTime : endTime}
              type="time"
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  imagePicker: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
