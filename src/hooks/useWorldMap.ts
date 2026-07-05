import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type CountryFeature = GeoJSON.Feature<Geometry, { name: string }>;

let cache: CountryFeature[] | null = null;

export function useWorldMap() {
  const [countries, setCountries] = useState<CountryFeature[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setCountries(cache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        const collection = feature(
          topo,
          topo.objects.countries,
        ) as FeatureCollection<Geometry, { name: string }>;
        cache = collection.features as CountryFeature[];
        setCountries(cache);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading };
}
