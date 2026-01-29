import { Pressable, Text, Image, ImageSourcePropType } from 'react-native';

interface ServiceCardProps {
  icon: ImageSourcePropType;
  titleAr: string;
  titleEn: string;
  onPress: () => void;
}

export function ServiceCard({ icon, titleAr, titleEn, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 12,
        margin: 6,
        minHeight: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Image
        source={icon}
        style={{ width: 56, height: 56, marginBottom: 12 }}
        resizeMode="contain"
      />
      <Text style={{ color: '#111', fontWeight: '700', fontSize: 17, textAlign: 'center' }}>
        {titleAr}
      </Text>
      <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
        {titleEn}
      </Text>
    </Pressable>
  );
}
