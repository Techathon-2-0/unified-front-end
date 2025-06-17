export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          'User-Agent': 'jai (jai@email.com)', // More specific User-Agent
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name as string;
    } else {
      return 'Address not found';
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Reverse geocoding request timed out');
        return 'Request timed out';
      }
      console.error('Error in reverse geocoding:', error.message);
    }
    return 'Error retrieving address';
  }
}