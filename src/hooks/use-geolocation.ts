"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return { lat: null, lng: null, error: "Geolocation not supported", loading: false };
    }
    return { lat: null, lng: null, error: null, loading: true };
  });

  useEffect(() => {
    if (state.error) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [state.error]);

  return state;
}
