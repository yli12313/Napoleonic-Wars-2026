import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import type { Battle } from '../data/types';
import { MARKER_PX, clusterSizeClass, markerHtml, popupHtml, tooltipHtml } from '../lib/markers';

interface Props {
  /** Every battle in the dataset -- markers are built once from this. */
  all: Battle[];
  /** The currently visible subset. */
  visible: Battle[];
  /** Set when a marker popup opens, cleared when it closes. */
  onSelect: (id: string | null) => void;
  /** Id of a battle to fly to and open, or null. */
  focusId: string | null;
  onFocusHandled: () => void;
}

/**
 * Markers are created once and then added to / removed from the cluster group
 * as filters change, so typing in the search box never rebuilds the layer.
 */
export default function BattleMarkers({ all, visible, onSelect, focusId, onFocusHandled }: Props) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const shownRef = useRef<Set<string>>(new Set());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Build the cluster group and every marker exactly once.
  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: (zoom) => (zoom >= 8 ? 28 : zoom >= 6 ? 46 : 62),
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 11,
      chunkedLoading: false,
      iconCreateFunction: (cluster) => {
        const children = cluster.getAllChildMarkers();
        const count = children.length;
        const decisive = children.some(
          (m) => (m.options as { battleSignificance?: string }).battleSignificance === 'decisive',
        );
        const size = count >= 20 ? 54 : count >= 10 ? 46 : count >= 5 ? 40 : 34;
        return L.divIcon({
          html:
            `<div class="battle-cluster ${clusterSizeClass(count)}${decisive ? ' has-decisive' : ''}">` +
            '<span class="cluster-ring" aria-hidden="true"></span>' +
            `<span class="cluster-count">${count}</span>` +
            '</div>',
          className: 'battle-cluster-wrap',
          iconSize: L.point(size, size),
        });
      },
    });

    for (const b of all) {
      const px = MARKER_PX[b.significance];
      // A little padding around the shape so small markers stay clickable
      // without their hit boxes swallowing their neighbours.
      const box = px + 14;
      const marker = L.marker([b.lat, b.lng], {
        icon: L.divIcon({
          html: markerHtml(b),
          className: 'battle-marker-wrap',
          iconSize: L.point(box, box),
          iconAnchor: L.point(box / 2, box / 2),
          popupAnchor: L.point(0, -px / 2 - 4),
          tooltipAnchor: L.point(0, -px / 2 - 2),
        }),
        title: `${b.name}, ${b.date.slice(0, 4)}`,
        alt: `${b.name}, ${b.date.slice(0, 4)}`,
        riseOnHover: true,
        keyboard: false,
        // Custom option, read back by the cluster icon factory.
        battleSignificance: b.significance,
      } as L.MarkerOptions);

      marker.bindTooltip(tooltipHtml(b), {
        direction: 'top',
        className: 'battle-tooltip',
        opacity: 1,
      });
      marker.bindPopup(popupHtml(b), {
        className: 'battle-popup',
        maxWidth: 352,
        minWidth: 300,
        autoPanPadding: L.point(28, 96),
        closeButton: true,
      });
      marker.on('popupopen', () => onSelectRef.current(b.id));
      marker.on('popupclose', () => onSelectRef.current(null));
      markersRef.current.set(b.id, marker);
    }

    map.addLayer(group);
    clusterRef.current = group;

    return () => {
      map.removeLayer(group);
      group.clearLayers();
      markersRef.current.clear();
      shownRef.current.clear();
      clusterRef.current = null;
    };
  }, [all, map]);

  // Diff the visible set against what is currently on the map.
  useEffect(() => {
    const group = clusterRef.current;
    if (!group) return;
    const next = new Set(visible.map((b) => b.id));
    const shown = shownRef.current;

    const toAdd: L.Marker[] = [];
    const toRemove: L.Marker[] = [];
    for (const id of next) {
      if (!shown.has(id)) {
        const m = markersRef.current.get(id);
        if (m) toAdd.push(m);
      }
    }
    for (const id of shown) {
      if (!next.has(id)) {
        const m = markersRef.current.get(id);
        if (m) toRemove.push(m);
      }
    }
    if (toRemove.length) group.removeLayers(toRemove);
    if (toAdd.length) group.addLayers(toAdd);
    shownRef.current = next;

    // If a filter change leaves nothing in the *unobstructed* part of the map
    // -- the strip between the docked panels -- frame the results rather than
    // stranding the user on an empty stretch of map. Deferred so the container
    // has settled to its final size before bounds are read.
    if (visible.length === 0) return;
    const t = window.setTimeout(() => {
      const narrow = window.innerWidth < 900;
      const inset = narrow
        ? { left: 10, right: 10, top: 10, bottom: 76 }
        : { left: 348, right: 372, top: 12, bottom: 12 };
      const size = map.getSize();
      const clear = L.latLngBounds(
        map.containerPointToLatLng(L.point(inset.left, inset.top)),
        map.containerPointToLatLng(L.point(size.x - inset.right, size.y - inset.bottom)),
      );
      if (visible.some((b) => clear.contains(L.latLng(b.lat, b.lng)))) return;
      const target = L.latLngBounds(visible.map((b) => L.latLng(b.lat, b.lng)));
      map.flyToBounds(target, {
        paddingTopLeft: L.point(inset.left + 24, inset.top + 24),
        paddingBottomRight: L.point(inset.right + 24, inset.bottom + 24),
        maxZoom: 8,
        duration: 0.85,
      });
    }, 140);
    return () => window.clearTimeout(t);
  }, [visible, map]);

  // Fly to and open a battle requested from outside the map.
  useEffect(() => {
    if (!focusId) return;
    const group = clusterRef.current;
    const marker = markersRef.current.get(focusId);
    if (!group || !marker) {
      onFocusHandled();
      return;
    }
    const ll = marker.getLatLng();
    map.flyTo(ll, Math.max(map.getZoom(), 8), { duration: 0.9 });
    let handled = false;
    let timer = 0;
    const open = () => {
      if (handled) return;
      handled = true;
      window.clearTimeout(timer);
      map.off('moveend', open);
      group.zoomToShowLayer(marker, () => marker.openPopup());
      // Clear the request only once it has actually been carried out, so the
      // effect cleanup cannot cancel the pending fly-to.
      onFocusHandled();
    };
    map.once('moveend', open);
    timer = window.setTimeout(open, 1500);
    return () => {
      window.clearTimeout(timer);
      map.off('moveend', open);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  return null;
}
