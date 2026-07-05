import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CourtThemeId,
  LookId,
  MascotId,
  ShuttleStyleId,
} from '../constants/customization';

export type MarkerId = 'P1' | 'P2' | 'P3' | 'P4' | 'Shuttle';

export type IconType = 'icon' | 'text' | 'photo';

export type MarkerCustomization = {
  size: number;
  color: string;
  isLeftHanded: boolean;
  /** Value for the circle looks: icon name / jersey text / photo uri. */
  icon: string;
  iconType: IconType;
  look: LookId;
};

export type Customizations = {
  [key in MarkerId]: MarkerCustomization;
};

/** Live try-before-you-buy overrides; never persisted. */
export interface PreviewState {
  looks: Partial<Record<MarkerId, MascotId>>;
  shuttleStyle: ShuttleStyleId | null;
  courtTheme: CourtThemeId | null;
}

interface MarkerCustomizationContextType {
  customizations: Customizations;
  updateMarkerCustomization: (markerId: MarkerId, customization: Partial<MarkerCustomization>) => void;
  resetCustomizations: () => void;
  selectedMarker: MarkerId;
  setSelectedMarker: (markerId: MarkerId) => void;

  shuttleStyle: ShuttleStyleId;
  setShuttleStyle: (style: ShuttleStyleId) => void;
  courtTheme: CourtThemeId;
  setCourtTheme: (theme: CourtThemeId) => void;

  previews: PreviewState;
  previewLook: (markerId: MarkerId, look: MascotId | null) => void;
  previewShuttleStyle: (style: ShuttleStyleId | null) => void;
  previewCourtTheme: (theme: CourtThemeId | null) => void;
  /** Drop previews (sheet closed without buying). */
  clearPreviews: (opts?: { keepCourtTheme?: boolean }) => void;
  /** Turn every preview into a kept choice (after a Pro purchase). */
  commitPreviews: () => void;

  /** Kept choices with previews layered on top — what the court renders. */
  effectiveLooks: Record<MarkerId, LookId>;
  effectiveShuttleStyle: ShuttleStyleId;
  effectiveCourtTheme: CourtThemeId;
}

const defaultCustomizations: Customizations = {
  P1: { size: 56, color: '#ff7455', isLeftHanded: false, icon: 'account', iconType: 'icon', look: 'classic' },
  P2: { size: 56, color: '#ff7455', isLeftHanded: false, icon: 'account', iconType: 'icon', look: 'classic' },
  P3: { size: 56, color: '#3e8dff', isLeftHanded: false, icon: 'account', iconType: 'icon', look: 'classic' },
  P4: { size: 56, color: '#3e8dff', isLeftHanded: false, icon: 'account', iconType: 'icon', look: 'classic' },
  Shuttle: { size: 40, color: '#ffffff', isLeftHanded: false, icon: 'badminton', iconType: 'icon', look: 'classic' },
};

const emptyPreviews: PreviewState = { looks: {}, shuttleStyle: null, courtTheme: null };

const STORAGE_KEY = 'customization-v1';

const MARKER_IDS: MarkerId[] = ['P1', 'P2', 'P3', 'P4', 'Shuttle'];

const MarkerCustomizationContext = createContext<MarkerCustomizationContextType | undefined>(undefined);

export function MarkerCustomizationProvider({ children }: { children: ReactNode }) {
  const [customizations, setCustomizations] = useState<Customizations>(defaultCustomizations);
  const [selectedMarker, setSelectedMarker] = useState<MarkerId>('P1');
  const [shuttleStyle, setShuttleStyle] = useState<ShuttleStyleId>('classic');
  const [courtTheme, setCourtTheme] = useState<CourtThemeId>('green');
  const [previews, setPreviews] = useState<PreviewState>(emptyPreviews);
  const loaded = useRef(false);

  // Load kept choices once; previews are session-only.
  // ponytail: kept Pro styles are not revoked when a subscription lapses —
  // add an entitlement sweep here if that ever matters.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.customizations) {
          setCustomizations((prev) => {
            const merged = { ...prev };
            for (const id of MARKER_IDS) {
              if (saved.customizations[id]) {
                merged[id] = { ...prev[id], ...saved.customizations[id] };
              }
            }
            return merged;
          });
        }
        if (saved.shuttleStyle) setShuttleStyle(saved.shuttleStyle);
        if (saved.courtTheme) setCourtTheme(saved.courtTheme);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ customizations, shuttleStyle, courtTheme })
    ).catch(() => {});
  }, [customizations, shuttleStyle, courtTheme]);

  const updateMarkerCustomization = useCallback(
    (markerId: MarkerId, customization: Partial<MarkerCustomization>) => {
      setCustomizations(prev => ({
        ...prev,
        [markerId]: {
          ...prev[markerId],
          ...customization,
        },
      }));
    },
    []
  );

  const resetCustomizations = useCallback(() => {
    setCustomizations(defaultCustomizations);
    setShuttleStyle('classic');
    setCourtTheme('green');
    setPreviews(emptyPreviews);
  }, []);

  const previewLook = useCallback((markerId: MarkerId, look: MascotId | null) => {
    setPreviews((prev) => {
      const looks = { ...prev.looks };
      if (look) looks[markerId] = look;
      else delete looks[markerId];
      return { ...prev, looks };
    });
  }, []);

  const previewShuttleStyle = useCallback((style: ShuttleStyleId | null) => {
    setPreviews((prev) => ({ ...prev, shuttleStyle: style }));
  }, []);

  const previewCourtTheme = useCallback((theme: CourtThemeId | null) => {
    setPreviews((prev) => ({ ...prev, courtTheme: theme }));
  }, []);

  const clearPreviews = useCallback((opts?: { keepCourtTheme?: boolean }) => {
    setPreviews((prev) =>
      opts?.keepCourtTheme
        ? { ...emptyPreviews, courtTheme: prev.courtTheme }
        : emptyPreviews
    );
  }, []);

  const commitPreviews = useCallback(() => {
    setCustomizations((kept) => {
      let next = kept;
      for (const [id, look] of Object.entries(previews.looks) as [MarkerId, MascotId][]) {
        next = { ...next, [id]: { ...next[id], look } };
      }
      return next;
    });
    if (previews.shuttleStyle) setShuttleStyle(previews.shuttleStyle);
    if (previews.courtTheme) setCourtTheme(previews.courtTheme);
    setPreviews(emptyPreviews);
  }, [previews]);

  const effectiveLooks = useMemo(() => {
    const looks = {} as Record<MarkerId, LookId>;
    for (const id of MARKER_IDS) {
      looks[id] = previews.looks[id] ?? customizations[id].look;
    }
    return looks;
  }, [customizations, previews.looks]);

  return (
    <MarkerCustomizationContext.Provider
      value={{
        customizations,
        updateMarkerCustomization,
        resetCustomizations,
        selectedMarker,
        setSelectedMarker,
        shuttleStyle,
        setShuttleStyle,
        courtTheme,
        setCourtTheme,
        previews,
        previewLook,
        previewShuttleStyle,
        previewCourtTheme,
        clearPreviews,
        commitPreviews,
        effectiveLooks,
        effectiveShuttleStyle: previews.shuttleStyle ?? shuttleStyle,
        effectiveCourtTheme: previews.courtTheme ?? courtTheme,
      }}
    >
      {children}
    </MarkerCustomizationContext.Provider>
  );
}

export function useMarkerCustomization() {
  const context = useContext(MarkerCustomizationContext);
  if (!context) {
    throw new Error('useMarkerCustomization must be used within a MarkerCustomizationProvider');
  }
  return context;
}
