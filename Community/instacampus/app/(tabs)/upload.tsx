import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, ActivityIndicator, Alert, Modal, View, Picker as RNPicker } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { uploadPost } from '@/api/posts';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostContext';

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
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(startDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartDate(newDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(endDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEndDate(newDate);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndDate(newDate);
    }
  };

  const handleWebDateChange = (isStart: boolean, isDate: boolean, value: string) => {
    if (isStart) {
      const newDate = new Date(startDate);
      if (isDate) {
        const [year, month, day] = value.split('-').map(num => parseInt(num));
        if (year && month && day) {
          newDate.setFullYear(year);
          newDate.setMonth(month - 1);
          newDate.setDate(day);
        }
      } else {
        const [hours, minutes] = value.split(':').map(num => parseInt(num));
        if (hours !== undefined && minutes !== undefined) {
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
        }
      }
      setStartDate(newDate);
    } else {
      const newDate = new Date(endDate);
      if (isDate) {
        const [year, month, day] = value.split('-').map(num => parseInt(num));
        if (year && month && day) {
          newDate.setFullYear(year);
          newDate.setMonth(month - 1);
          newDate.setDate(day);
        }
      } else {
        const [hours, minutes] = value.split(':').map(num => parseInt(num));
        if (hours !== undefined && minutes !== undefined) {
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
        }
      }
      setEndDate(newDate);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to upload an image.');
          return;
        }
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(result.assets[0].uri);
            const blob = await response.blob();
            
            let fileName = result.assets[0].uri.split('/').pop() || 'image.jpg';
            if (!fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
              fileName = fileName.replace(/\.[^/.]+$/, '') + '.jpg';
            }
            
            const mimeType = getMimeType(fileName);
            const file = new File([blob], fileName, { type: mimeType });
            setImageFile({ file });
            console.log('Web file prepared:', file.name, file.type, file.size);
          } catch (e) {
            console.error('Error creating file from image:', e);
            Alert.alert('Error', 'Failed to process image for upload');
          }
        } else {
          setImageFile(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting upload with image:', image);
      
      if (Platform.OS === 'web' && (!imageFile || !imageFile.file)) {
        throw new Error('Image file not properly prepared for upload');
      }

      const formFields = {
        event_name: eventName,
        caption: caption || '',
        location: location || '',
        registration_link: registrationLink || '',
        event_type: eventType || '',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };
      
      console.log('Uploading with fields:', formFields);
      
      await uploadPost(image, imageFile, formFields);
      
      await loadPosts();
      
      Alert.alert('Success', 'Post uploaded successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Create New Post',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <ThemedText>Tap to select an image (JPG, PNG, or GIF)</ThemedText>
            </TouchableOpacity>
          )}
          
          {image && (
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <ThemedText style={styles.changeImageText}>Change Image</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
        
        <ThemedView style={styles.form}>
          <ThemedText type="defaultSemiBold">Event Name*</ThemedText>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Event Name"
          />
          
          <ThemedText type="defaultSemiBold">Caption</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Event Description"
            multiline
            numberOfLines={4}
          />
          
          <ThemedText type="defaultSemiBold">Location</ThemedText>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Event Location"
          />
          
          <ThemedText type="defaultSemiBold">Registration Link</ThemedText>
          <TextInput
            style={styles.input}
            value={registrationLink}
            onChangeText={setRegistrationLink}
            placeholder="https://example.com/register"
            keyboardType="url"
          />
          
          <ThemedText type="defaultSemiBold">Event Type</ThemedText>
          {Platform.OS === 'web' ? (
            <View style={styles.selectContainer}>
              <select 
                className="event-type-select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: '#ccc',
                  borderWidth: '1px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setTypePickerVisible(true)}
              >
                <ThemedText>{eventType || 'Select Event Type'}</ThemedText>
              </TouchableOpacity>
              
              <Modal
                visible={typePickerVisible}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <ThemedText type="subtitle">Select Event Type</ThemedText>
                    <RNPicker
                      selectedValue={eventType}
                      style={styles.picker}
                      onValueChange={(itemValue) => setEventType(itemValue)}
                    >
                      <RNPicker.Item label="Select Event Type" value="" />
                      {EVENT_TYPES.map(type => (
                        <RNPicker.Item key={type} label={type} value={type} />
                      ))}
                    </RNPicker>
                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={() => setTypePickerVisible(false)}
                    >
                      <ThemedText style={styles.buttonText}>Done</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}
          
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Event Schedule</ThemedText>
          
          {Platform.OS === 'web' ? (
            <>
              <ThemedView style={styles.dateTimeContainer}>
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>Start Date</ThemedText>
                  <input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={(e) => handleWebDateChange(true, true, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      borderColor: '#ccc',
                      borderWidth: '1px',
                      marginTop: '5px',
                    }}
                  />
                </ThemedView>
                
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>Start Time</ThemedText>
                  <input
                    type="time"
                    value={formatTimeForInput(startDate)}
                    onChange={(e) => handleWebDateChange(true, false, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      borderColor: '#ccc',
                      borderWidth: '1px',
                      marginTop: '5px',
                    }}
                  />
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.dateTimeContainer}>
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>End Date</ThemedText>
                  <input
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={(e) => handleWebDateChange(false, true, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      borderColor: '#ccc',
                      borderWidth: '1px',
                      marginTop: '5px',
                    }}
                  />
                </ThemedView>
                
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>End Time</ThemedText>
                  <input
                    type="time"
                    value={formatTimeForInput(endDate)}
                    onChange={(e) => handleWebDateChange(false, false, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      borderColor: '#ccc',
                      borderWidth: '1px',
                      marginTop: '5px',
                    }}
                  />
                </ThemedView>
              </ThemedView>
            </>
          ) : (
            <>
              <ThemedView style={styles.dateTimeContainer}>
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>Start Date</ThemedText>
                  <TouchableOpacity 
                    style={styles.pickerButton} 
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <ThemedText>{startDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={onStartDateChange}
                    />
                  )}
                </ThemedView>
                
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>Start Time</ThemedText>
                  <TouchableOpacity 
                    style={styles.pickerButton} 
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <ThemedText>{formatTime(startDate)}</ThemedText>
                  </TouchableOpacity>
                  {showStartTimePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="time"
                      display="default"
                      onChange={onStartTimeChange}
                    />
                  )}
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.dateTimeContainer}>
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>End Date</ThemedText>
                  <TouchableOpacity 
                    style={styles.pickerButton} 
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <ThemedText>{endDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={onEndDateChange}
                    />
                  )}
                </ThemedView>
                
                <ThemedView style={styles.dateTimeField}>
                  <ThemedText>End Time</ThemedText>
                  <TouchableOpacity 
                    style={styles.pickerButton} 
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <ThemedText>{formatTime(endDate)}</ThemedText>
                  </TouchableOpacity>
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="time"
                      display="default"
                      onChange={onEndTimeChange}
                    />
                  )}
                </ThemedView>
              </ThemedView>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Upload Post</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    marginTop: 10,
    padding: 8,
  },
  changeImageText: {
    color: '#0a7ea4',
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  dateTimeField: {
    width: '48%',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 5,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectContainer: {
    marginBottom: 10,
  },
});
