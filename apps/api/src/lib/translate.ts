const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';

/**
 * Translate text between Arabic and English using LibreTranslate.
 * Falls back to original text if translation fails.
 */
export async function translateText(
  text: string,
  targetLang: 'en' | 'ar'
): Promise<string> {
  if (!text?.trim()) return '';

  const sourceLang = targetLang === 'ar' ? 'en' : 'ar';

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return text;
    }

    const data = await response.json() as { translatedText?: string };
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

/**
 * Auto-fill missing name translations.
 * If only one language is provided, translates to the other.
 */
export async function autoTranslateNames(data: {
  name?: string;
  nameAr?: string;
}): Promise<{ name: string; nameAr: string }> {
  const hasName = Boolean(data.name?.trim());
  const hasNameAr = Boolean(data.nameAr?.trim());

  if (hasName && !hasNameAr) {
    const translated = await translateText(data.name!, 'ar');
    return { name: data.name!, nameAr: translated };
  }

  if (hasNameAr && !hasName) {
    const translated = await translateText(data.nameAr!, 'en');
    return { name: translated, nameAr: data.nameAr! };
  }

  return {
    name: data.name || '',
    nameAr: data.nameAr || '',
  };
}

/**
 * Auto-fill missing address translations.
 */
export async function autoTranslateAddresses(data: {
  address?: string;
  addressAr?: string;
}): Promise<{ address: string; addressAr: string }> {
  const hasAddress = Boolean(data.address?.trim());
  const hasAddressAr = Boolean(data.addressAr?.trim());

  if (hasAddress && !hasAddressAr) {
    const translated = await translateText(data.address!, 'ar');
    return { address: data.address!, addressAr: translated };
  }

  if (hasAddressAr && !hasAddress) {
    const translated = await translateText(data.addressAr!, 'en');
    return { address: translated, addressAr: data.addressAr! };
  }

  return {
    address: data.address || '',
    addressAr: data.addressAr || '',
  };
}

/**
 * Auto-fill missing bio translations.
 */
export async function autoTranslateBios(data: {
  bio?: string;
  bioAr?: string;
}): Promise<{ bio: string; bioAr: string }> {
  const hasBio = Boolean(data.bio?.trim());
  const hasBioAr = Boolean(data.bioAr?.trim());

  if (hasBio && !hasBioAr) {
    const translated = await translateText(data.bio!, 'ar');
    return { bio: data.bio!, bioAr: translated };
  }

  if (hasBioAr && !hasBio) {
    const translated = await translateText(data.bioAr!, 'en');
    return { bio: translated, bioAr: data.bioAr! };
  }

  return {
    bio: data.bio || '',
    bioAr: data.bioAr || '',
  };
}
