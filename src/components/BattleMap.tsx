import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import type { Battle } from '../data/types';
import BattleMarkers from './BattleMarkers';

interface Props {
  all: Battle[];
  visible: Battle[];
  onSelect: (id: string | null) => void;
  focusId: string | null;
  onFocusHandled: () => void;
  /** Bump to force the map to recompute its size after a layout change. */
  resizeKey: number;
}

/** The theatre of operations: Iberia to Moscow, Baltic to the Nile. */
const MAX_BOUNDS = L.latLngBounds(L.latLng(21, -19), L.latLng(67, 54));

function MapChrome({ resizeKey }: { resizeKey: number }) {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ pan: false }), 260);
    return () => window.clearTimeout(t);
  }, [map, resizeKey]);
  useEffect(() => {
    const onResize = () => map.invalidateSize({ pan: false });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);
  return null;
}

export default function BattleMap(props: Props) {
  const narrow = typeof window !== 'undefined' && window.innerWidth < 900;
  const initial = useMemo(
    () => ({
      center: (narrow ? [46.5, 13] : [47.6, 12]) as [number, number],
      zoom: narrow ? 3.6 : 4.7,
    }),
    [narrow],
  );

  return (
    <MapContainer
      className="battle-map"
      center={initial.center}
      zoom={initial.zoom}
      minZoom={3}
      maxZoom={13}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={0.9}
      zoomControl={false}
      zoomSnap={0.1}
      wheelPxPerZoomLevel={140}
      worldCopyJump={false}
      preferCanvas={false}
      attributionControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
        noWrap
      />
      <ZoomControl position="bottomright" />
      <MapChrome resizeKey={props.resizeKey} />
      <BattleMarkers
        all={props.all}
        visible={props.visible}
        onSelect={props.onSelect}
        focusId={props.focusId}
        onFocusHandled={props.onFocusHandled}
      />
    </MapContainer>
  );
}
