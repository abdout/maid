import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { DirhamIcon } from '@/components/icons';
import { useNationalities, useLanguages, useMaid, useCreateMaid, useUpdateMaid } from '@/hooks';
import { uploadsApi } from '@/lib/api';

export default function MaidFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const isEditing = !!id;

  const { data: nationalitiesData } = useNationalities();
  const { data: languagesData } = useLanguages();
  const { data: maidData, isLoading: loadingMaid } = useMaid(id || '');
  const createMaid = useCreateMaid();
  const updateMaid = useUpdateMaid();

  const nationalities = nationalitiesData?.data || [];
  const languages = languagesData?.data || [];

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    nationalityId: '',
    dateOfBirth: '',
    maritalStatus: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    religion: 'muslim' as 'muslim' | 'non_muslim',
    experienceYears: 0,
    salary: '',
    bio: '',
    bioAr: '',
    languageIds: [] as string[],
    photoUrl: '',
  });

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (maidData?.data?.maid) {
      const m = maidData.data.maid;
      const nat = maidData.data.nationality;
      setForm({
        name: m.name,
        nameAr: m.nameAr || '',
        nationalityId: m.nationalityId || nat?.id || '',
        dateOfBirth: m.dateOfBirth?.split('T')[0] || '',
        maritalStatus: m.maritalStatus as typeof form.maritalStatus,
        religion: m.religion as typeof form.religion,
        experienceYears: m.experienceYears,
        salary: m.salary,
        bio: m.bio || '',
        bioAr: m.bioAr || '',
        languageIds: maidData.data.languages.map((l) => l.id),
        photoUrl: m.photoUrl || '',
      });
      if (m.photoUrl) setPhotoUri(m.photoUrl);
    }
  }, [maidData]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setIsUploading(true);

      try {
        const uploadedUrl = await uploadsApi.uploadFile(uri, 'maids');
        setForm((f) => ({ ...f, photoUrl: uploadedUrl }));
        Alert.alert('Success', 'Photo uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
        setPhotoUri(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        salary: parseFloat(form.salary),
        dateOfBirth: new Date(form.dateOfBirth),
      };

      if (isEditing) {
        await updateMaid.mutateAsync({ id, data });
      } else {
        await createMaid.mutateAsync(data);
      }

      router.back();
    } catch (error) {
      console.error('Save maid error:', error);
    }
  };

  const toggleLanguage = (langId: string) => {
    setForm((prev) => ({
      ...prev,
      languageIds: prev.languageIds.includes(langId)
        ? prev.languageIds.filter((id) => id !== langId)
        : [...prev.languageIds, langId],
    }));
  };

  const isSubmitting = createMaid.isPending || updateMaid.isPending || isUploading;

  if (isEditing && loadingMaid) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? 'Edit Maid' : t('office.addMaid'),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary-500 text-lg">{t('common.cancel')}</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View className="items-center py-6">
          <Pressable onPress={handlePickImage} disabled={isUploading}>
            <View className="w-32 h-40 bg-background-100 rounded-xl overflow-hidden">
              {isUploading ? (
                <View className="w-full h-full items-center justify-center bg-background-200">
                  <ActivityIndicator size="small" color="#1e40af" />
                  <Text className="text-typography-500 text-xs mt-2">Uploading...</Text>
                </View>
              ) : photoUri ? (
                <Image source={{ uri: photoUri }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-4xl">📷</Text>
                  <Text className="text-typography-500 text-sm mt-2">Add Photo</Text>
                </View>
              )}
            </View>
          </Pressable>
          {form.photoUrl && (
            <Text className="text-success-500 text-xs mt-2">✓ Photo uploaded</Text>
          )}
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            Name (English) *
          </Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Full name"
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900"
          />
        </View>

        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            الاسم (بالعربي)
          </Text>
          <TextInput
            value={form.nameAr}
            onChangeText={(v) => setForm((f) => ({ ...f, nameAr: v }))}
            placeholder="الاسم الكامل"
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900 text-right"
          />
        </View>

        {/* Nationality */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.nationality')} *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {nationalities.map((nat) => (
                <Pressable
                  key={nat.id}
                  onPress={() => setForm((f) => ({ ...f, nationalityId: nat.id }))}
                  className={`px-4 py-2 rounded-full border ${
                    form.nationalityId === nat.id
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-background-0 border-background-200'
                  }`}
                >
                  <Text className={form.nationalityId === nat.id ? 'text-white' : 'text-typography-700'}>
                    {isRTL ? nat.nameAr : nat.nameEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Date of Birth */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            Date of Birth *
          </Text>
          <TextInput
            value={form.dateOfBirth}
            onChangeText={(v) => setForm((f) => ({ ...f, dateOfBirth: v }))}
            placeholder="YYYY-MM-DD"
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900"
          />
        </View>

        {/* Marital Status */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.maritalStatus')} *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(['single', 'married', 'divorced', 'widowed'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => setForm((f) => ({ ...f, maritalStatus: status }))}
                className={`px-4 py-2 rounded-full border ${
                  form.maritalStatus === status
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text className={form.maritalStatus === status ? 'text-white' : 'text-typography-700'}>
                  {t(`maritalStatus.${status}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Religion */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.religion')} *
          </Text>
          <View className="flex-row gap-2">
            {(['muslim', 'non_muslim'] as const).map((rel) => (
              <Pressable
                key={rel}
                onPress={() => setForm((f) => ({ ...f, religion: rel }))}
                className={`px-4 py-2 rounded-full border ${
                  form.religion === rel
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text className={form.religion === rel ? 'text-white' : 'text-typography-700'}>
                  {t(`religion.${rel}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Experience */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.experience')} (years) *
          </Text>
          <TextInput
            value={form.experienceYears.toString()}
            onChangeText={(v) => setForm((f) => ({ ...f, experienceYears: parseInt(v) || 0 }))}
            keyboardType="number-pad"
            placeholder="0"
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900"
          />
        </View>

        {/* Salary */}
        <View className="mb-4">
          <View className={`flex-row items-center mb-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-typography-700 font-medium`}>
              {t('filters.salary')}
            </Text>
            <Text className="text-typography-700">(</Text>
            <DirhamIcon size={14} color="#374151" />
            <Text className="text-typography-700">/month) *</Text>
          </View>
          <TextInput
            value={form.salary}
            onChangeText={(v) => setForm((f) => ({ ...f, salary: v }))}
            keyboardType="decimal-pad"
            placeholder="2000"
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900"
          />
        </View>

        {/* Languages */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.languages')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {languages.map((lang) => (
              <Pressable
                key={lang.id}
                onPress={() => toggleLanguage(lang.id)}
                className={`px-4 py-2 rounded-full border ${
                  form.languageIds.includes(lang.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text className={form.languageIds.includes(lang.id) ? 'text-white' : 'text-typography-700'}>
                  {isRTL ? lang.nameAr : lang.nameEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View className="mb-4">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            Bio (English)
          </Text>
          <TextInput
            value={form.bio}
            onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
            placeholder="Brief description..."
            multiline
            numberOfLines={4}
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        <View className="mb-6">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            السيرة الذاتية (بالعربي)
          </Text>
          <TextInput
            value={form.bioAr}
            onChangeText={(v) => setForm((f) => ({ ...f, bioAr: v }))}
            placeholder="وصف مختصر..."
            multiline
            numberOfLines={4}
            className="bg-background-50 rounded-xl px-4 py-3 text-typography-900 min-h-[100px] text-right"
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !form.name || !form.nationalityId || !form.salary}
          className={`py-4 rounded-xl items-center mb-10 ${
            isSubmitting || !form.name || !form.nationalityId || !form.salary
              ? 'bg-primary-200'
              : 'bg-primary-500'
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {isSubmitting ? t('common.loading') : isEditing ? t('common.save') : t('office.addMaid')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
