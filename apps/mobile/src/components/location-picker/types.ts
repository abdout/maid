export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  addressAr: string;
  emirate: string;
  googleMapsUrl: string;
}

export interface LocationPickerProps {
  value?: LocationData | null;
  onChange: (location: LocationData) => void;
  error?: string;
  placeholder?: string;
}
