"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Filter, MapPin, X } from "lucide-react";
import { VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  address: string;
  location: { lat: number; lng: number };
  images: string[];
  tier?: string;
  isActive: boolean;
  createdAt: number;
}

interface VehicleMapProps {
  onVehicleClick?: (vehicleId: string) => void;
  vehicles?: Vehicle[];
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

interface VehicleProperties {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  address: string;
  image: string | null;
}

export function VehicleMap({ onVehicleClick, vehicles = [] }: VehicleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProperties | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    transmission: "",
    minPrice: "",
    maxPrice: "",
  });
  const [sourceExists, setSourceExists] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"loading" | "loaded" | "missing">("loading");

  useEffect(() => {
    fetch("/api/mapbox/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          mapboxgl.accessToken = data.token;
          setTokenStatus("loaded");
        } else {
          setTokenStatus("missing");
        }
      })
      .catch(() => setTokenStatus("missing"));
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    if (filters.type && v.type !== filters.type) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.minPrice && v.pricePerDay < Number(filters.minPrice)) return false;
    if (filters.maxPrice && v.pricePerDay > Number(filters.maxPrice)) return false;
    return true;
  });

  const initializeMap = useCallback(() => {
    if (mapRef.current || !mapContainerRef.current || tokenStatus !== "loaded") return;

    const center: [number, number] = [-1.2921, 36.8219]; // Nairobi default

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Add source for vehicle markers
      const features: GeoJSONFeature[] = filteredVehicles.map((v) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [v.location.lng, v.location.lat] as [number, number],
        },
        properties: {
          id: v._id,
          make: v.make,
          model: v.model,
          year: v.year,
          type: v.type,
          pricePerDay: v.pricePerDay,
          address: v.address,
          image: v.images[0] || null,
        },
      }));

      // Add source directly with data - avoids GeoJSONSource constructor issues
map.addSource("vehicles", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // We need to mark source as existing for later updates
      setSourceExists(true);

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "vehicles",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#C9A84C",
            10,
            "#C9A84C",
            50,
            "#B8860B",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            30,
            50,
            40,
          ],
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "vehicles",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Unclustered points
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "vehicles",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#C9A84C",
          "circle-radius": 10,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click on cluster
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const cluster = features[0];
        if (!cluster.properties) return;
        const clusterId = cluster.properties.cluster_id;
        
        const source = map.getSource("vehicles");
        if (source && "getClusterExpansionZoom" in source) {
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !zoom) return;
            const coords = (features[0].geometry as unknown as { coordinates: [number, number] }).coordinates;
            map.easeTo({
              center: coords,
              zoom,
            });
          });
        }
      });

      // Click on vehicle
      map.on("click", "unclustered-point", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["unclustered-point"] });
        if (!features.length) return;
        const vehicle = features[0].properties as VehicleProperties;
        setSelectedVehicle(vehicle);
        onVehicleClick?.(vehicle.id);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });

      setMapLoaded(true);
    });

    mapRef.current = map;
  }, [filteredVehicles, onVehicleClick, tokenStatus]);

  useEffect(() => {
    if (tokenStatus === "loaded") {
      initializeMap();
    }
  }, [tokenStatus, initializeMap]);

  // Update map when filters change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !sourceExists) return;
    
    const features: GeoJSONFeature[] = filteredVehicles.map((v) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [v.location.lng, v.location.lat] as [number, number],
      },
      properties: {
        id: v._id,
        make: v.make,
        model: v.model,
        year: v.year,
        type: v.type,
        pricePerDay: v.pricePerDay,
        address: v.address,
        image: v.images[0] || null,
      },
    }));

    const source = mapRef.current?.getSource("vehicles");
    if (source && "setData" in source) {
      source.setData({
        type: "FeatureCollection",
        features,
      });
    }
  }, [filteredVehicles, mapLoaded, sourceExists]);

  // Cleanup
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (tokenStatus !== "loaded") {
    return (
      <div className="h-[calc(100vh-200px)] rounded-2xl bg-charcoal/5 dark:bg-white/5 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-charcoal/30 dark:text-cream/30" />
          <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
            Map Not Available
          </h3>
          <p className="text-sm text-charcoal/60 dark:text-cream/60">
            Unable to load the map at this time. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setFilters({ type: "", transmission: "", minPrice: "", maxPrice: "" });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="relative h-[calc(100vh-200px)] rounded-2xl overflow-hidden bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-3 shadow-premium"
        >
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="appearance-none w-full pl-10 pr-8 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 cursor-pointer"
            >
              <option value="">All Types</option>
              {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <select
              value={filters.transmission}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
              className="appearance-none w-full pl-4 pr-8 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 cursor-pointer"
            >
              <option value="">All Transmissions</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-28 px-4 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
              min="0"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-28 px-4 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
              min="0"
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-brand-gold-400 hover:underline flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </motion.div>
      </div>

      {/* Vehicle Info Card */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-10"
        >
          <div className="bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5 rounded-2xl p-4 shadow-premium">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
                  {selectedVehicle.make} {selectedVehicle.model}
                </h3>
                <p className="text-sm text-charcoal/60 dark:text-cream/60">
                  {selectedVehicle.year} &bull; {VEHICLE_TYPE_LABELS[selectedVehicle.type as keyof typeof VEHICLE_TYPE_LABELS] || selectedVehicle.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded-full hover:bg-charcoal/10 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5 text-charcoal/50" />
              </button>
            </div>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-3 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {selectedVehicle.address}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl font-bold text-brand-gold-400">
                {formatCurrency(selectedVehicle.pricePerDay)}/day
              </span>
              <button
                onClick={() => onVehicleClick?.(selectedVehicle.id)}
                className="px-4 py-2 bg-brand-gold-500 text-white rounded-xl text-sm font-medium hover:brightness-110 transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Vehicle Count */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5 rounded-xl px-4 py-2 shadow-premium">
        <p className="text-sm text-charcoal/70 dark:text-cream/70">
          {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}